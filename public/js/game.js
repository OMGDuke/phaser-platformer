var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload,
                                                        create: create,
                                                        update: update });
var platforms,
    player,
    baddie,
    cursors,
    stars,
    score = 0,
    scoreText,
    health = 100,
    healthText,
    immune,
    hitSound,
    music;

function preload() {
  game.load.image('sky', '../assets/sky.png');
  game.load.image('ground', '../assets/platform.png');
  game.load.image('star', '../assets/star.png');
  game.load.image('health', '../assets/firstaid.png');
  game.load.spritesheet('dude', '../assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', '../assets/baddie.png', 32, 32);
  game.load.audio('hit', '../assets/sound/Hit_Hurt.wav');
  game.load.audio('music', '../assets/sound/Brodyquest.ogg');
}

function create() {
  _createWorld();
  _createPlatforms();
  _createGround();
  _createLedge();
  _createPlayer();
  _createStars();
  _createBaddie();
  cursors = game.input.keyboard.createCursorKeys();
  scoreText = game.add.text(16, 16, 'Score: ' + score, {fontSize: '32px', fill: '#000'});
  healthText = game.add.text(16, 64, 'Health: ' + health, {fontSize: '32px', fill: '#000'});
  hitSound = game.add.audio('hit');
  music = game.add.audio('music');
  music.play();
}

function _createWorld() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0,0, 'sky');
}

function _createPlatforms() {
  platforms = game.add.group();
  platforms.enableBody = true;
}

function _createGround() {
  var ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;
}

function _createLedge() {
  var ledge = platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;
  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;
}

function _createPlayer() {
  player = game.add.sprite(32, game.world.height - 150, 'dude');
  game.physics.arcade.enable(player);
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
}

function _createBaddie() {
    baddie = game.add.sprite(game.world.width - 64, game.world.height - 150, 'baddie');
    game.physics.arcade.enable(baddie);
    baddie.body.bounce.y = 0.2;
    baddie.body.gravity.y = 300;
    baddie.body.collideWorldBounds = true;

    baddie.animations.add('left', [0, 1 ], 10, true);
    baddie.animations.add('right', [2, 3], 10, true);
    baddie.body.velocity.x = 150;
}

function _createStars() {
  stars = game.add.group();
  stars.enableBody = true;

  for (var i=0; i < 12; i++) {
    var star = stars.create(i* 70, 0, 'star');
    star.body.gravity.y = 6;
    star.body.bounce.y = 0.7 + Math.random() * 0.2;
  }
}

function update() {
  _gameOver();
  var hitPlatform = game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(baddie, platforms);
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.overlap(player, stars, _collectStar, null, this);
  if(!immune) {
    game.physics.arcade.overlap(baddie, player, _playerHit, null, this);
  }
  _playerMovement(hitPlatform);
  _baddieMovement();
}

function _gameOver() {
  if (health <= 0) {
    game.paused = true;
    var gameOverText = game.add.text(game.world.centerX, game.world.centerY,
                                     'Game Over', {fontSize: '32px',
                                     fill: '#000', align: 'center'});
    gameOverText.anchor.setTo(0.5, 0.5);
  } else if (score >= 120) {
    game.paused = true;
    var winText = game.add.text(game.world.centerX, game.world.centerY,
                                     'You Win', {fontSize: '32px',
                                     fill: '#000', align: 'center'});
    winText.anchor.setTo(0.5, 0.5);
  }
}

function _playerMovement(hitPlatform) {
  player.body.velocity.x = 0;
  if (cursors.left.isDown) {
    player.body.velocity.x = -150;
    player.animations.play('left');
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 150;
    player.animations.play('right');
  } else {
    player.animations.stop();
    player.frame = 4;
  }

  if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
    player.body.velocity.y = -350;
  }
}

function _baddieMovement() {
  if(baddie.body.velocity.x > 0) {
    baddie.animations.play('right');
  } else if(baddie.body.velocity.x < 0) {
    baddie.animations.play('left');
  } else {
      baddie.animations.stop();
      baddie.frame = 1;
  }
  if(baddie.body.blocked.left) {
    baddie.body.velocity.x = 150;
  } else if (baddie.body.blocked.right) {
    baddie.body.velocity.x = -150;
  }
}

function _collectStar(player, star) {
  star.kill();
  score += 10;
  scoreText.text = 'Score: ' + score;
}

function _playerHit() {
  health -= 50;
  healthText.text = 'Health: ' + health;
  _animatePlayerHit();
  hitSound.play();
  immune = true;
  game.time.events.add(Phaser.Timer.SECOND, _toggleImmunity, this);
}

function _animatePlayerHit() {
  var fadeout = game.add.tween(player).to( { alpha: 0 }, 100, 'Linear', true);
  var fadein = game.add.tween(player).to( { alpha: 1 }, 100, 'Linear', true);
  fadeout.chain(fadein);
  fadeout.repeat(5, 200);
  player.body.velocity.y = -100;
}

function _toggleImmunity() {
  immune = false;
  player.tint = 0xffffff;
}
