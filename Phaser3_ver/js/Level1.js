var endgame = false;

class Level1 extends Phaser.Scene {
	constructor() {
		super("level1");
  }
  xCoords = [64,128,192,256,320,384,448,512,576,640,704,769,833,897,961];
  angles = [90, 0, -90];
  grav = 40;
  score = 0;
  lives = 3;
  timeLeft;
  minutes;
  seconds;
  fallAfterReset;
	create() {
    endgame = false;
    this.score = 0;
    this.lives = 3;
    //background
    console.log('Loading bg...');
    this.lvl1Bg = this.add.image(0,0,"lvl1Bg").setOrigin(0,0);
    //score label and life gauge
    this.scoreLabel = this.add.bitmapText(10, 15, "pixelFont", "SCORE " + this.score  , 60);
    this.livesLabel = this.add.bitmapText(775, 15, "pixelFont", "LIVES " + this.lives  , 60);
    this.lifeGauge = new LifeGauge(this, 950, 10).setOrigin(0.5, 0).setScale(4);
    //timer setup
    this.timedEvent = this.time.delayedCall(120000, this.lvlOneComplete, [], this);
    this.timerLabel = this.add.bitmapText(424, 15, "pixelFont", "00:00 ", 100);
    //floor platform
    this.stagePlatform = this.add.tileSprite(config.width/2, 640, 0, 0, 'stage').setOrigin(0.5, 0.8);
    this.physics.add.existing(this.stagePlatform, true);
    this.stagePlatform.enableBody = true;
    this.stagePlatform.body.immovable = true;

    //spawning serol
    this.serol = new Serol(this, 512, 50);
    this.physics.add.existing(this.serol);
    this.serol.body.setGravityY(3000);
    this.serol.anims.play('staticBob',true);
    this.serol.setCollideWorldBounds(true);
    //colliding with floor platform
    this.physics.add.collider(this.stagePlatform, this.serol);
    
    //enabling serol controls
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');

    //spawning tetrominos
    this.tet1 = new Tetromino(this, this.xCoords[Math.round(Math.random() * (this.xCoords.length - 1))], 0);
    this.tet1.setOrigin(0.5,0.5);
    this.tet2 = new Tetromino(this, this.xCoords[Math.round(Math.random() * (this.xCoords.length - 1))], 0);
    this.tet2.setOrigin(0.5,0.5);


    this.tetrominos = this.physics.add.group();
    this.tetrominos.add(this.tet1);
    this.tetrominos.add(this.tet2);

    //spawning junk
    this.junk1 = new Junk(this, this.xCoords[Math.round(Math.random() * (this.xCoords.length - 1))], 0);
    this.junk2 = new Junk(this, this.xCoords[Math.round(Math.random() * (this.xCoords.length - 1))], 0);

    this.junkItems = this.physics.add.group();
    this.junkItems.add(this.junk1);
    this.junkItems.add(this.junk2);

    //spawning 1ups
    this.oneUp = new OneUp(this, this.xCoords[Math.round(Math.random() * (this.xCoords.length - 1))], 50);
    this.physics.world.enable(this.oneUp);
    this.fallAfterSpawn = this.time.addEvent({
      delay: 10000,
      callback: ()=>{
        this.itemFall(this.oneUp, 30);
      },
      loop: false
  })

    //enabling overlap between serol and tetrominos
    this.physics.add.overlap(this.serol, this.tetrominos, this.catchTetromino, null, this);
    this.physics.add.overlap(this.serol, this.junkItems, this.catchJunk, null, this);
    this.physics.add.overlap(this.serol, this.oneUp, this.catchOneUp , null, this);

  }

	update() {
    this.movePlayerManager();
    this.itemFall(this.tet1, 20);
    this.itemFall(this.tet2, 15);
    this.itemFall(this.junk1, 20);
    this.itemFall(this.junk2, 15);
    //update timer
    this.updateTimer();
    //increase gravity gradually
  }
  
  movePlayerManager(){
    let pad = Phaser.Input.Gamepad.Gamepad;

    if (this.input.gamepad.total){
      pad = this.input.gamepad.getPad(0);
    }
    if (this.cursorKeys.left.isDown|| this.wasdKeys.A.isDown|| pad.left) {
      this.serol.setVelocityX(-gameSettings.playerXSpeed);
      this.serol.anims.play('walkLeft',true);
    }
    else if(this.cursorKeys.right.isDown|| this.wasdKeys.D.isDown|| pad.right) {
      this.serol.setVelocityX(gameSettings.playerXSpeed);
      this.serol.anims.play('walkRight',true);
    }
    else if(endgame == false) {
      this.serol.anims.play('staticBob',true);
      this.serol.setVelocityX(0);
    }
    if((this.cursorKeys.up.isDown || this.wasdKeys.W.isDown) && this.serol.body.onFloor()) {
      this.serol.setVelocityY(-gameSettings.playerYSpeed);
    }
    if (endgame == true) {
      this.serol.anims.play('sleep',true);
      this.serol.setVelocityX(0);
      this.serol.setVelocityY(0);
      this.serol.setAccelerationY(3000);
    }
  }
  //falling items
  itemFall(item, accel) {
    //set acceleration
    item.body.setAcceleration(0,accel);
    //reset item when it falls beyond the world boundary (top/bottom)
    if (item.y > config.height) {
      this.itemReset(item);
    }
  }
  itemReset(item) {
    item.setVelocityY(0);
    item.body.setAcceleration(0,0);
    item.y = 0;
    item.x = this.xCoords[Math.round(Math.random() * (this.xCoords.length - 1))];
    console.log(item.texture.key);
    if (item.texture.key == "tetromino1") {
      item.setTexture("tetromino1", Phaser.Math.Between(0, 31));
      item.setAngle(this.angles[Math.round(Math.random() * (this.angles.length - 1))]);
      if (item.angle == 90 || item.angle == -90){
        item.setSize(68,34);
      }
      else if (item.angle == 0){
        item.setSize(34,68);
      }
    }
    else if (item.texture.key == "junk") {
      item.setTexture("junk", Phaser.Math.Between(0, 5));
    }
    else if (item.texture.key == "1up") {
      item.setTexture("1up", 0);
      this.fallAfterReset = this.time.addEvent({
        delay: 10000,
        callback: ()=>{
          this.itemFall(item, 30);
        },
        loop: true
    })    
  }
    
    
  }
  catchTetromino(serol,tetromino){
    this.itemReset(tetromino);
    //increase score
    this.score += 10;
    this.scoreLabel.text = "SCORE " + this.score;
  }
  catchJunk(serol,junkItem){
    this.itemReset(junkItem);
    //decrease life count
    if ( this.lives <= 1){
      this.lives = 0;
      //endgame sequence
      endgame=true;
      this.serol.anims.play('sleeping',true);
      this.transition = this.time.delayedCall(4000, function(){this.scene.start('gameOver')}, [], this);  // delay in ms

    }else{
      this.lives--;
    }
    this.livesLabel.text = "LIVES " + this.lives;
    //update lives gauge
    this.lifeGauge.updateLife(this.lives);

  }
  catchOneUp(serol,oneUp){
    this.itemReset(oneUp);
    //increase life count
    if (this.lives >= 3){
      this.lives = 3;
    }else{
      this.lives++;
    }
    this.livesLabel.text = "LIVES " + this.lives;
    //update lives gauge
    this.lifeGauge.updateLife(this.lives);
  }
  zeroPad(number,size){
    var stringNumber = String(number);
    while(stringNumber.length < (size || 2)){
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }
  updateTimer(){
    this.timeLeft = ((120000 - this.timedEvent.delay*this.timedEvent.getProgress())/1000).toFixed(0);
    this.seconds = Math.floor(this.timeLeft % 60); //Seconds to display
    this.minutes = Math.floor(this.timeLeft / 60); //Minutes to display
    this.timeFormatted = (this.zeroPad(this.minutes,2)+":"+this.zeroPad(this.seconds,2));
    this.timerLabel.setText(this.timeFormatted);
  }
  lvlOneComplete(){
    this.scene.start('level1Complete');
  }
}

/* Serol Class */
class Serol extends Phaser.Physics.Arcade.Sprite {
  // healthBar
  constructor(scene, x = 0, y = 0, texture = 'serol') {
    super(scene, x, y, texture)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    scene.events.on('update', this.update, this)

    scene.anims.create({
      key: 'staticBob',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [30,31,30,31,32,33]}),
      frameRate: 4,
      repeat: -1
    });

    scene.anims.create({
      key: 'static',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [1,1]}),
      frameRate: 4,
      repeat: -1
    });

    scene.anims.create({
      key: 'staticRight',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [18,19,20,21]}),
      frameRate: 4,
      repeat: -1
    });

    scene.anims.create({
      key: 'walkRight',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [6,7,8,9,10,11]}),
      frameRate: 4,
      repeat: -1
    });

    scene.anims.create({
      key: 'staticLeft',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [24,25,26,27]}),
      frameRate: 4,
      repeat: -1
    });

    scene.anims.create({
      key: 'walkLeft',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [12,13,14,15,16,17]}),
      frameRate: 4,
      repeat: -1
    });

    scene.anims.create({
      key: 'sleep',
      frames: scene.anims.generateFrameNumbers('serol', {frames: [28,29,28,29]}),
      frameRate: 2,
      repeat: -1
    });
  }

  update() {
  }
}

/*tetromino class*/
class Tetromino extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x=0, y=0, texture = 'tetromino1', frame = Phaser.Math.Between(0, 31)) {
    super(scene,x,y,texture,frame)
    scene.add.existing(this)
    scene.events.on('update', this.update, this)
  }
}
/*junk class*/
class Junk extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x=0, y=0, texture = 'junk', frame = Phaser.Math.Between(0, 5)) {
    super(scene,x,y,texture,frame)
    scene.add.existing(this)
    scene.events.on('update', this.update, this)
  }
}
/*1up class*/
class OneUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x=0, y=0, texture = '1up', frame = 0) {
    super(scene,x,y,texture,frame)
    scene.add.existing(this)
    scene.events.on('update', this.update, this)
  }
}

/* Battery health bar Class */
class LifeGauge extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x = 0, y = 0, texture = 'charge', frame = 3) {
    super(scene,x,y,texture,frame)
    scene.add.existing(this)
    scene.events.on('update', this.update, this)
  }
  updateLife(i){
    this.setFrame(i);
  }
}