const GAME = {
  SIZE: 512,
};

const FRAMERATE = 8;
const GRAVITY = 400,
  GROUNDY = GAME.SIZE - 124;
const MIN_CLOUDS = 7,
  MAX_CLOUDS = 10,
  CLOUDMINSPEED = 10,
  CLOUDMAXSPEED = 25;
const MAX_BUTTERFLIES = 7;
const PLAYER_SPEED = 150,
  PLAYER_SIZE = 16,
  JUMP_VELOCITY = (-GRAVITY * 2) / 3;
const GLOBAL_SCALE = 4;

var IS_MOBILE;
if (
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
    navigator.userAgent.substr(0, 4)
  )
) {
  IS_MOBILE = true;
} else {
  IS_MOBILE = false;
}

getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

class PopUp extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);
    this.popup = scene.add.image(GAME.SIZE / 2, GAME.SIZE / 2, "popup");
    this.popup.setDepth(12);
    this.popup.setVisible(false);
    this.popup.setScrollFactor(0);
    this.popup.setScale(GLOBAL_SCALE);

    this.x = scene.add.image(432, 80, "x").setInteractive();
    this.x.on("pointerdown", () => {
      this.close();
    });
    this.x.setDepth(12);
    this.x.setVisible(false);
    this.x.setScrollFactor(0);
    this.x.setScale(GLOBAL_SCALE);

    this.textBody = scene.add
      .text(GAME.SIZE / 2, 100, "", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#000000",
        wordWrap: {
          width: (3 * GAME.SIZE) / 5,
          useAdvancedWrap: true,
        },
        align: "center",
      })
      .setInteractive();
    this.textBody.setOrigin(0.5, 0);
    this.textBody.setDepth(12);
    this.textBody.setVisible(false);
    this.textBody.setScrollFactor(0);

    this.displayed = false;

    return this;
  }

  setText(text) {
    this.textBody.setText(text);
  }

  setTextColor(color) {
    this.textBody.setColor(color);
  }

  setTextStyle(style) {
    this.textBody.setFontStyle(style);
  }

  setTextLocation(x, y) {
    this.textBody.setPosition(x, y);
  }

  addButton(scene) {
    this.button = scene.add
      .image((GAME.SIZE * 2) / 3, (GAME.SIZE * 7) / 9, "button")
      .setInteractive();
    this.button.on("pointerdown", () => this.buttonPressed());
    this.button.setDepth(12);
    this.button.setVisible(false);
    this.button.setScrollFactor(0);
    this.button.setScale(GLOBAL_SCALE);
    this.buttonText = scene.add.text(
      (GAME.SIZE * 2) / 3,
      (GAME.SIZE * 7) / 9,
      "random",
      {
        fontFamily: "Arial",
        fontStyle: "bolder",
        fontSize: "24px",
        color: "#ffffff",
        wordWrap: {
          width: (3 * GAME.SIZE) / 5,
          useAdvancedWrap: true,
        },
        align: "center",
      }
    );
    this.buttonText.setOrigin(0.5, 0.5);
    this.buttonText.setDepth(13);
    this.buttonText.setVisible(false);
    this.buttonText.setScrollFactor(0);
  }

  buttonPressed() {
    this.buttonCallback ? this.buttonCallback() : null;
  }

  setButtonCallback(callback) {
    this.buttonCallback = callback;
  }

  display(text) {
    this.textBody.setText(text);
    this.popup.setVisible(true);
    this.x.setVisible(true);
    this.textBody.setVisible(true);
    if (this.button && this.buttonText) {
      this.button.setVisible(true);
      this.buttonText.setVisible(true);
    }
    this.displayed = true;
    return this;
  }

  close() {
    this.popup.setVisible(false);
    this.x.setVisible(false);
    this.textBody.setVisible(false);
    this.displayed = false;
    if (this.button && this.buttonText) {
      this.button.setVisible(false);
      this.buttonText.setVisible(false);
    }
    if (this.closeCallback) {
      this.closeCallback();
    }
  }

  onTextClick(callback) {
    this.textBody.on("pointerdown", callback);
  }

  onClose(callback) {
    this.closeCallback = callback;
  }
}

class Smiler extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "smiler");

    scene.add.existing(this);
    let smiler = scene.physics.add.existing(this);
    smiler.setCollideWorldBounds(true);
    smiler.body.setAllowGravity(true);
    smiler.setDrag(250, 1);
    smiler.body.setAllowDrag(true);
    smiler.setScale(GLOBAL_SCALE);

    this.face = scene.add.sprite(x, y, "faces");
    this.face.setScale(GLOBAL_SCALE);

    this.anims.create({
      key: "front",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("smiler", {
        frames: [0, 1, 2, 3],
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("smiler", {
        frames: [5, 6, 7, 8],
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "left",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("smiler", {
        frames: [10, 11, 12, 13],
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "jumpfront",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("smiler", { frames: [4] }),
      repeat: -1,
    });
    this.anims.create({
      key: "jumpright",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("smiler", { frames: [9] }),
      repeat: -1,
    });
    this.anims.create({
      key: "jumpleft",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("smiler", { frames: [14] }),
      repeat: -1,
    });

    this.speed = PLAYER_SPEED;

    return this;
  }

  updateStuff() {
    this.face.x = this.x;
    this.face.y = this.y;

    if (getRandomInt(0, 150) === 100) {
      this.face.setFrame(getRandomInt(0, 29));
    }
  }
}

class Butterfly extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    var texture;
    switch (getRandomInt(0, 3)) {
      case 0:
        texture = "purpleButterfly";
        break;
      case 1:
        texture = "pinkButterfly";
        break;
      case 2:
        texture = "orangeButterfly";
        break;
      case 3:
        texture = "blueButterfly";
        break;
    }
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);

    this.anims.create({
      key: "left",
      frameRate: 3,
      frames: this.anims.generateFrameNumbers(texture, { frames: [0, 1] }),
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frameRate: 3,
      frames: this.anims.generateFrameNumbers(texture, { frames: [2, 3] }),
      repeat: -1,
    });

    this.body.gravity.y = GRAVITY / 3;
    this.homeY = y;
    this.setScale(GLOBAL_SCALE / 2);
    getRandomInt(0, 1) === 1
      ? this.anims.play("left")
      : this.anims.play("right");
    return this;
  }

  update() {
    if (this.body) {
      let rand = getRandomInt(0, 50);
      if (rand === 1) {
        this.setVelocity(
          getRandomInt(-3 * PLAYER_SPEED, 3 * PLAYER_SPEED),
          getRandomInt(-GRAVITY, GRAVITY)
        );
      } else if (rand > 43) {
        this.setVelocity(0, 0);
      }
      if (this.y >= this.homeY) {
        this.setVelocityY(getRandomInt(-GRAVITY, 0));
      }
      this.animForButterfly();
    }
  }

  animForButterfly() {
    if (this.body.velocity.x > 0) {
      this.anims.play("right", true);
    } else if (this.body.velocity.x < 0) {
      this.anims.play("left", true);
    }
  }
}

class Sparkle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "sparkle");

    let sparkle = scene.add.existing(this);
    sparkle.setScale(GLOBAL_SCALE);

    this.anims.create({
      key: "sparkle",
      frameRate: FRAMERATE,
      frames: this.anims.generateFrameNumbers("sparkle", {
        frames: [0, 1, 2, 3, 4, 5, 6],
      }),
      repeat: 0,
    });

    this.anims.play("sparkle");

    return this;
  }
}

class Flower extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    let flower = scene.add.existing(this);
    flower.setScale(GLOBAL_SCALE);

    this.anims.create({
      key: "sway1",
      frameRate: FRAMERATE / 4,
      frames: this.anims.generateFrameNumbers(texture, {
        frames: [0, 1, 2, 3],
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "sway2",
      frameRate: FRAMERATE / 4,
      frames: this.anims.generateFrameNumbers(texture, {
        frames: [2, 3, 0, 1],
      }),
      repeat: -1,
    });

    return this;
  }
}

class DrawvidDotCom extends Phaser.Scene {
  constructor() {
    super("DrawvidDotCom");
    this.clouds = new Array();
    this.butterflies = new Array();
    this.sparkles = new Array();
    this.currentGalleryIndex = 0;
  }

  preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("button", "assets/button.png");
    this.load.image("code", "assets/code-button.png");
    this.load.image("about", "assets/about-button.png");
    this.load.image("paradise", "assets/paradise-button.png");
    this.load.image("gallery-bg", "assets/gallery-bg.png");
    this.load.image("gallery-fg", "assets/gallery-fg.png");
    this.load.image("home", "assets/home-button.png");
    this.load.image("logo", "assets/drawvid-logo.png");
    this.load.image("popup", "assets/popup.png");
    this.load.image("x", "assets/x.png");
    this.load.image("twitter", "assets/twitter.png");
    this.load.image("insta", "assets/instagram.png");
    this.load.image("giphy", "assets/giphy.png");
    this.load.image("patreon", "assets/patreon.png");
    this.load.image("lounge-button", "assets/lounge-button.png");
    this.load.image("divedave-button", "assets/divedave-button.png");
    this.load.spritesheet("smiler", "assets/smiler.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("pflower", "assets/p-flower.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("bflower", "assets/b-flower.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("oflower", "assets/o-flower.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("cloud", "assets/clouds.png", {
      frameWidth: 32,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("faces", "assets/faces.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("sparkle", "assets/sparkle.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("purpleButterfly", "assets/butterfly-purple.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("blueButterfly", "assets/butterfly-blue.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("orangeButterfly", "assets/butterfly-orange.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("pinkButterfly", "assets/butterfly-pink.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
  }

  create() {
    this.physics.world.setBounds(0, 0, GAME.SIZE, GROUNDY);
    let bg = this.add.image(GAME.SIZE / 2, GAME.SIZE / 2, "bg");
    bg.setScale(GLOBAL_SCALE);
    let g = this.add.image(GAME.SIZE / 2, GAME.SIZE / 2, "ground");
    g.setScale(GLOBAL_SCALE);

    this.spawnClouds();
    this.spawnBackFlowers();
    let galleryBG = this.physics.add.image(
      GAME.SIZE - 64,
      (7 * GAME.SIZE) / 11,
      "gallery-bg"
    );
    galleryBG.body.setAllowGravity(false);
    galleryBG.setScale(GLOBAL_SCALE);
    this.player = new Smiler(
      this,
      GAME.SIZE / 2,
      GAME.SIZE / 4 + PLAYER_SIZE * GLOBAL_SCALE
    );
    this.player.setScale(GLOBAL_SCALE);
    this.addButtons();
    this.spawnFrontFlowers();

    let logo = this.add.image(48, 48, "logo").setInteractive();
    logo.setScale(GLOBAL_SCALE);

    let insta = this.add.image(300, 48, "insta").setInteractive();
    insta.setScale(GLOBAL_SCALE / 2);
    insta.on("pointerdown", () => {
      window.location.href = "https://www.instagram.com/drawvid";
    });
    insta.setDepth(11);
    let twitter = this.add.image(380, 48, "twitter").setInteractive();
    twitter.setScale(GLOBAL_SCALE / 2);
    twitter.on("pointerdown", () => {
      window.location.href = "https://www.twitter.com/drawvid";
    });
    twitter.setDepth(11);
    let giphy = this.add.image(460, 48, "giphy").setInteractive();
    giphy.setScale(GLOBAL_SCALE / 2);
    giphy.on("pointerdown", () => {
      window.location.href = "https://www.giphy.com/drawvid";
    });
    giphy.setDepth(11);
    // let patreon = this.add.image(220, 48, "patreon").setInteractive();
    // patreon.setScale(GLOBAL_SCALE / 2);
    // patreon.on("pointerdown", () => {
    //   window.location.href = "https://www.patreon.com/drawvid";
    // });
    // patreon.setDepth(11);

    let loungeButton = this.add
      .image(
        (4 * GAME.SIZE) / 5,
        GAME.SIZE - GLOBAL_SCALE * 32,
        "lounge-button"
      )
      .setOrigin(0.5, 0)
      .setInteractive();
    loungeButton.setScale(GLOBAL_SCALE);
    loungeButton.on("pointerdown", () => {
      window.location.href = "/code/onlinelounge_2.0/";
    });
    loungeButton.setDepth(10);

    let divedaveButton = this.add
      .image(GAME.SIZE / 8, GAME.SIZE - GLOBAL_SCALE * 32, "divedave-button")
      .setOrigin(0.5, 0)
      .setInteractive();
    divedaveButton.setScale(GLOBAL_SCALE);
    divedaveButton.on("pointerdown", () => {
      window.location.href = "http://drawvid.com/code/divedave";
    });
    divedaveButton.setDepth(11);

    // controls
    this.controls = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
      right: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.D,
        false
      ),
      space: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        false
      ),
    };

    this.aboutPopup = new PopUp(this);
    this.aboutPopup.setTextColor("#000000");
  }

  addButtons() {
    let code = this.physics.add
      .image(GAME.SIZE / 4, GAME.SIZE / 3, "code")
      .setInteractive();
    code.body.setAllowGravity(false);
    code.setScale(GLOBAL_SCALE);
    code.on("pointerdown", () => {
      window.location.href = "/code";
    });
    code.setDepth(11);
    let paradise = this.physics.add
      .image((2 * GAME.SIZE) / 4, GAME.SIZE / 3, "paradise")
      .setInteractive();
    paradise.body.setAllowGravity(false);
    paradise.setScale(GLOBAL_SCALE);
    paradise.on("pointerdown", () => {
      window.location.href = "/code/postinparadise";
    });
    paradise.setDepth(11);
    let about = this.physics.add
      .image((3 * GAME.SIZE) / 4, GAME.SIZE / 3, "about")
      .setInteractive();
    about.body.setAllowGravity(false);
    about.setScale(GLOBAL_SCALE);
    about.on("pointerdown", () => {
      this.aboutPopUp();
    });
    about.setDepth(11);
    let gallery = this.physics.add
      .image(GAME.SIZE - 64, (7 * GAME.SIZE) / 11, "gallery-fg")
      .setInteractive();
    gallery.body.setAllowGravity(false);
    gallery.setScale(GLOBAL_SCALE);
    gallery.on("pointerdown", () => {
      window.location.href = "/gallery";
    });
    gallery.setDepth(11);
  }

  aboutPopUp() {
    this.aboutPopup.display(
      "david🤫 a.k.a. drawvid😈  art🎨 + computer software💾  @drawvid👨‍💻 on instagram📸 twitter🐦 and giphy🕺 this site🏡 was built🛠️ using 👽Phaser.js🚀"
    );
  }

  fitImageInBox(img, boxSize) {
    let ogHeight = img.height,
      ogWidth = img.width;
    let scale;
    if (img.width > img.height) {
      img.width = boxSize;
      scale = img.width / ogWidth;
      img.height = scale * ogHeight;
    } else if (img.width !== img.height) {
      img.height = boxSize;
      scale = img.height / ogHeight;
      img.width = scale * ogWidth;
    } else {
      img.height = boxSize;
      img.width = boxSize;
    }
  }

  spawnClouds() {
    for (let i = 0; i < getRandomInt(MIN_CLOUDS, MAX_CLOUDS); i++) {
      let yMax = GAME.SIZE / 2;
      let yPos = getRandomInt(0, yMax);
      let cloud = this.physics.add.sprite(
        getRandomInt(
          -PLAYER_SIZE * GLOBAL_SCALE,
          GAME.SIZE + PLAYER_SIZE * GLOBAL_SCALE
        ),
        yPos,
        "cloud"
      );
      cloud.setScale(GLOBAL_SCALE);
      cloud.setFrame(this.getFrame(yPos, yMax));
      cloud.flipX = getRandomInt(0, 1) === 0 ? true : false;
      cloud.body.setAllowGravity(false);
      cloud.setVelocityX(getRandomInt(CLOUDMINSPEED, CLOUDMAXSPEED));
      this.clouds.push(cloud);
    }
  }

  spawnBackFlowers() {
    let flower1 = new Flower(
      this,
      GAME.SIZE / 4 - PLAYER_SIZE * GLOBAL_SCALE,
      GROUNDY - 2 * PLAYER_SIZE,
      "pflower"
    );
    let flower2 = new Flower(
      this,
      GAME.SIZE / 2 + PLAYER_SIZE * GLOBAL_SCALE,
      GROUNDY - 2 * PLAYER_SIZE,
      "oflower"
    );
    flower1.anims.play("sway1", true);
    flower2.anims.play("sway1", true);
  }

  spawnFrontFlowers() {
    let flower1 = new Flower(
      this,
      GAME.SIZE / 2 - PLAYER_SIZE * GLOBAL_SCALE,
      GROUNDY - (3 * PLAYER_SIZE) / 2,
      "bflower"
    );
    let flower2 = new Flower(
      this,
      GAME.SIZE - PLAYER_SIZE * GLOBAL_SCALE,
      GROUNDY - (3 * PLAYER_SIZE) / 2,
      "pflower"
    );
    flower1.anims.play("sway2", true);
    flower2.anims.play("sway2", true);
  }

  handleClouds() {
    this.clouds.forEach((cloud) => {
      if (cloud.x >= GAME.SIZE + (cloud.width * GLOBAL_SCALE) / 2) {
        let yMax = GAME.SIZE / 2;
        let yPos = getRandomInt(0, yMax);
        cloud.setPosition(-PLAYER_SIZE * GLOBAL_SCALE, yPos);
        cloud.setVelocityX(getRandomInt(CLOUDMINSPEED, CLOUDMAXSPEED));
        cloud.setFrame(this.getFrame(yPos, yMax));
      }
    });
  }

  getFrame(yPos, yMax) {
    return yPos < yMax / 4
      ? 0
      : yPos < yMax / 2
      ? 1
      : yPos < (yMax * 3) / 4
      ? 2
      : 3;
  }

  update() {
    this.handleClouds();
    this.updateAllButterflies();
    this.playerHandler();
  }

  generateButterfly() {
    if (this.butterflies.length < MAX_BUTTERFLIES) {
      let butterfly = new Butterfly(
        this,
        getRandomInt(0, GROUNDY),
        getRandomInt(0, GAME.SIZE)
      );
      this.butterflies.push(butterfly);
      this.physics.add.collider(this.player, butterfly, (player, butterfly) => {
        let sparkle = new Sparkle(this, butterfly.x, butterfly.y);
        this.sparkles.push(sparkle);
        butterfly.x = GAME.SIZE + GAME.SIZE;
        butterfly.y = GAME.SIZE + GAME.SIZE;
      });
      return butterfly;
    }
    return null;
  }

  updateAllButterflies() {
    if (MAX_BUTTERFLIES > 0) {
      if (getRandomInt(0, 150) === 69) {
        this.generateButterfly();
      }
      this.butterflies.forEach((butterfly, index, butterflies) => {
        butterfly.update();
        if (
          !this.cameras.main.worldView.contains(butterfly.x, butterfly.y) ||
          butterfly.y >= GROUNDY
        ) {
          butterflies.splice(index, 1);
          butterfly.destroy();
        }
      });
      this.sparkles.forEach((sparkle, index, sparkles) => {
        if (sparkle.frame.name.toString() === "6") {
          sparkles.splice(index, 1);
          sparkle.destroy();
        }
      });
    }
  }

  playerHandler() {
    if (this.player.x > 460) {
      window.location.href = "/gallery";
    }
    if (IS_MOBILE) {
      this.playerMobileMovementHandler();
    } else {
      this.playerMovementHandler();
    }
    this.player.updateStuff();

    if (this.player.body.velocity.y < 0) {
      if (this.player.body.velocity.x < 0) {
        this.player.setFrame(14);
      } else if (this.player.body.velocity.x > 0) {
        this.player.setFrame(9);
      } else {
        this.player.setFrame(4);
      }
    } else {
      if (this.player.body.velocity.x > 0) {
        this.player.anims.play("right", true);
      } else if (this.player.body.velocity.x < 0) {
        this.player.anims.play("left", true);
      } else {
        this.player.setFrame(0);
      }
    }
  }

  playerMovementHandler() {
    if (
      (this.controls.up.isDown || this.controls.space.isDown) &&
      this.player.body.velocity.y === 0 &&
      this.player.y >= GROUNDY - PLAYER_SIZE * GLOBAL_SCALE - GLOBAL_SCALE
    ) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }
    if (this.controls.left.isDown) {
      this.player.setVelocityX(-this.player.speed);
    }
    if (this.controls.right.isDown) {
      this.player.setVelocityX(this.player.speed);
    }
  }

  playerMobileMovementHandler() {
    var pointer = this.input.activePointer;
    if (pointer.isDown) {
      var touchX = pointer.x;
      var touchY = pointer.y;
      var touchWorldPoint = this.cameras.main.getWorldPoint(touchX, touchY);
      if (
        touchWorldPoint.y <= GROUNDY - PLAYER_SIZE * GLOBAL_SCALE &&
        this.player.body.velocity.y === 0 &&
        this.player.y >= GROUNDY - PLAYER_SIZE * GLOBAL_SCALE - GLOBAL_SCALE
      ) {
        this.player.setVelocityY(JUMP_VELOCITY);
      } else {
        if (
          touchWorldPoint.x >
          this.player.body.position.x + (PLAYER_SIZE * GLOBAL_SCALE) / 2
        ) {
          this.player.setVelocityX(this.player.speed);
        } else if (
          touchWorldPoint.x <
          this.player.body.position.x - (PLAYER_SIZE * GLOBAL_SCALE) / 2
        ) {
          this.player.setVelocityX(-this.player.speed);
        } else if (
          this.player.body.velocity.y === 0 &&
          this.player.y >= GROUNDY - PLAYER_SIZE * GLOBAL_SCALE - GLOBAL_SCALE
        ) {
          this.player.setVelocityY(JUMP_VELOCITY);
        }
      }
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var gameConfig = {
  backgroundColor: 0x00008b,
  render: {
    roundPixels: true,
    pixelArt: true,
    antialias: false,
  },
  scale: {
    parent: "phaser-div",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME.SIZE,
    height: GAME.SIZE,
  },
  parent: "phaser-div",
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GRAVITY },
      debug: false,
    },
  },
  scene: [DrawvidDotCom],
};
var game = new Phaser.Game(gameConfig);
window.focus();
