/*
Level 2
*/
var q = new Queue();
var choices = ["tetromino", "junk"];
var counterVal1 = 0;
var cursors;
var playState2 = {
  telescopes: null,
  playerLayer: null,
  // obstacles: null,
  lives: null,
  counter: null,
  create: function(){
    var self = this;
    jump_sfx = game.add.audio('jump');
    //set up background
    skyBg = game.add.tileSprite(0, 0, 1024, 640, 'endless_sky');
    runnerBg = game.add.tileSprite(0, 0, 1024, 640, 'endless_bg');
    pipeImage = game.add.sprite(10, 540, 'pipe')
    game.world.setBounds(0, 0, 1024, 520);
    cursors = game.input.keyboard.createCursorKeys();


    q.enqueue("tetromino");
    q.enqueue("junk");
    q.enqueue("tetromino");
    q.enqueue("tetromino");
    q.enqueue("junk");
    q.enqueue("junk");
    q.peek();
    //console.log(typeof q);

    //add pipe content
    self.pipe = new Pipe(q.toString());
    game.add.existing(self.pipe);

    //add Counter
    self.counter = new Counter(counterVal1);
    game.add.existing(self.counter);

    self.lives = new Lives(3);
    game.add.existing(self.lives);

    //add sprite layers
    self.telescopes = game.add.group();
    self.playerLayer = game.add.group();
    // self.obstacles = game.add.group();
    // self.rivers = game.add.group();

    generateTelescopes = game.time.events.loop(Phaser.Timer.SECOND * 3, function() {
      self.telescopes.add(Telescope());
    }, this);

    //add Serol

    self.player = new Player1(100, 350);
    self.playerLayer.create(self.player);
    //activate physics for Serol
    game.physics.enable(self.player, Phaser.Physics.ARCADE);
    self.player.body.collideWorldBounds = true;
    self.player.body.gravity.y = 3000;

    // generateRivers = game.time.events.loop(Phaser.Timer.SECOND * 14, function() {
    //   self.rivers.create(River());
    // }, this);

    // generateObstacles = game.time.events.loop(Phaser.Timer.SECOND * 3, function() {
    //   //keep adding tetrominos to the group
    //   self.obstacles.create(Obstacle());
    // }, this);

    //dequeueing using keyup
    game.input.keyboard.onUpCallback = function( e ){
      //down key logic
      if(e.keyCode == Phaser.Keyboard.DOWN){
        var removed = q.shift();
        if (removed.valueOf()==="tetromino"){
          console.log("tetromino dequeued");
          q.enqueue(choose(choices));
          self.pipe.updatePipe(q.toString());
        }else if(removed.valueOf()==="junk"){
          console.log("junk dequeued");
          q.enqueue(choose(choices));
          self.pipe.updatePipe(q.toString());
        }
        console.log(q.toString());
      } else if (e.keyCode == Phaser.Keyboard.UP){
        console.log("Up pressed");
      }
    };

  },

  update: function(){
    var self = this;

    skyBg.tilePosition.x -= 0.5;
    runnerBg.tilePosition.x -= 3;
    self.player.body.velocity.x = 0;
    self.player.movePlayer();
    // game.world.sendToBack(self.telescopes);
    game.world.bringToTop(self.playerLayer);

      // if (cursors.down.downDuration(10))
    	// {
      //   if (q.shift().valueOf()==="tetromino"){
      //     console.log("tetromino dequeued");
      //     q.enqueue(choose(choices));
      //     self.pipe.updatePipe(q.toString());
      //   }else if(q.shift().valueOf()==="junk"){
      //     console.log("junk dequeued");
      //     q.enqueue(choose(choices));
      //     self.pipe.updatePipe(q.toString());
      //   }
      //
      //   // q.enqueue(choose(choices));
      //   // self.pipe.updatePipe(q.toString());
      //   // console.log(q.peek());
      //   console.log(q.toString());
      //
    	// }

  },


};

function Player1(x, y) {

  //serol attributes
  var player = game.add.sprite(x, y, 'serol');

  player.animations.add('walkRight', [6, 7, 8, 9, 10, 11], 6, true);
  player.animations.add('walkLeft', [12, 13, 14, 15, 16, 17], 6, true);
  player.animations.add('staticBob', [30, 31, 30, 31, 32, 33], 4, true);
  player.animations.add('static', [1, 1], 4, true);
  player.animations.add('staticRight', [18, 19, 20, 21], 4, true);
  player.animations.add('staticLeft', [24, 25, 26, 27], 4, true);
  player.animations.add('sleeping', [28, 29, 28, 29], 2, true);

  player.movePlayer = function(){
    var hozMove = 400;
    var vertMove = -1000;
    var jumpTimer = 0;
    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
          player.body.velocity.x = -hozMove;
          player.play('walkRight');
      } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
        player.body.velocity.x = hozMove;
        player.play('walkRight');
      }
      if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && player.body.onFloor() && game.time.now > jumpTimer){
        player.body.velocity.y = vertMove;
        jump_sfx.play();
        jumpTimer = game.time.now + 900;
        player.animations.stop('walkRight');
        player.animations.play('staticRight');
      } else {
        player.animations.play('walkRight');
      }
  };



  return player;
};

function Obstacle(){
  var obstacle = game.add.sprite(1000, 450, 'obstacle');
  obstacle.frame = Math.floor(Math.random() * 5);
  //enable physics
  game.physics.enable(obstacle, Phaser.Physics.ARCADE);
  obstacle.body.velocity.x = -180;

  //methods
  obstacle.goOffScreen = function(){
    var self = this;
    self.kill();
  }
  return obstacle;
}

function Telescope(){
  var telescope = game.add.sprite(1000, 250, 'telescope');
  telescope.frame = Math.floor(Math.random() * 6);

  game.physics.enable(telescope, Phaser.Physics.ARCADE);
  telescope.body.velocity.x = -180;
  return telescope;
}

function River(){
  var river = game.add.sprite(1000, 482, 'river');
  river.animations.add('flow', [0, 1, 2], 4, true);

  river.animations.play('flow');
  game.physics.enable(river, Phaser.Physics.ARCADE);
  river.body.velocity.x = -180;
  return river;
}

function Pipe(string){
  var pipe = game.add.text(100, 580, ("Queue: "+ string), {
    font: "32px 'Press Start 2P'",
    fill: "#ffffff",
    align: "center"
  });

  pipe.updatePipe = function(value){
    var self = this;
    self.setText("Queue: " + value);
  }
  return pipe;
};

function Queue(){
  var queue = [];

  queue.enqueue = function(item){
    queue.push(item);
  }
  // queue.dequeue = function(){
  //   return queue.shift().valueOf();
  // }
  queue.peek = function(){
    if (queue.length <0){
      console.log(null);
    }else{
      console.log(queue[0]);
    }

  }
  queue.disp = function(){
    console.log(queue);
  }
  queue.flush = function(){
    queue = [];
  }
  return queue;
}

// function IsNumeric(val) {
//     return !isNaN(parseInt(val));
// }
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}
