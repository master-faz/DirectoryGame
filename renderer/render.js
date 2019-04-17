const Phaser = require('phaser');
const { dialog, app, BrowserWindow } = require('electron').remote;

win = remote.getCurrentWindow();

class Player {
    constructor(scene, x, y) {
      this.scene = scene;
  
      // Create the animations we need from the player spritesheet
      const anims = scene.anims;
      anims.create({
        key: "player-idle",
        frames: anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1
      });
      anims.create({
        key: "player-run",
        frames: anims.generateFrameNumbers("player", { start: 8, end: 15 }),
        frameRate: 12,
        repeat: -1
      });
  
      // Create the physics-based sprite that we will move around and animate
      this.sprite = scene.physics.add
        .sprite(x, y, "player", 0)
        .setDrag(1000, 0)
        .setMaxVelocity(300, 400);
  
      // Track the arrow keys & WASD
      const { LEFT, RIGHT, UP, W, A, D } = Phaser.Input.Keyboard.KeyCodes;
      this.keys = scene.input.keyboard.addKeys({
        left: LEFT,
        right: RIGHT,
        up: UP,
        w: W,
        a: A,
        d: D
      });
    }
  
    update() {
      const keys = this.keys;
      const sprite = this.sprite;
      const onGround = sprite.body.blocked.down;
      const acceleration = onGround ? 600 : 200;
  
      // Apply horizontal acceleration when left/a or right/d are applied
      if (keys.left.isDown || keys.a.isDown) {
        sprite.setAccelerationX(-acceleration);
        // No need to have a separate set of graphics for running to the left & to the right. Instead
        // we can just mirror the sprite.
        sprite.setFlipX(true);
      } else if (keys.right.isDown || keys.d.isDown) {
        sprite.setAccelerationX(acceleration);
        sprite.setFlipX(false);
      } else {
        sprite.setAccelerationX(0);
      }
  
      // Only allow the player to jump if they are on the ground
      if (onGround && (keys.up.isDown || keys.w.isDown)) {
        sprite.setVelocityY(-500);
      }
  
      // Update the animation/texture based on the state of the player
      if (onGround) {
        if (sprite.body.velocity.x !== 0) sprite.anims.play("player-run", true);
        else sprite.anims.play("player-idle", true);
      } else {
        sprite.anims.stop();
        sprite.setTexture("player", 10);
      }
    }
  
    destroy() {
      this.sprite.destroy();
    }
}

class PlatformerScene extends Phaser.Scene {
  preload() {
    this.load.spritesheet(
      "player",
      "./assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );
    this.load.image("tiles", "./assets/tilesets/0x72-industrial-tileset-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "./assets/tilemaps/platformer-simple.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("0x72-industrial-tileset-32px-extruded", "tiles");

    map.createDynamicLayer("Background", tiles);
    this.groundLayer = map.createDynamicLayer("Ground", tiles);
    map.createDynamicLayer("Foreground", tiles);

    // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map.
    // Note: instead of storing the player in a global variable, it's stored as a property of the
    // scene.
    const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    // Collide the player against the ground layer - here we are grabbing the sprite property from
    // the player (since the Player class is not a Phaser.Sprite).
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.physics.world.addCollider(this.player.sprite, this.groundLayer);

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, "Arrow keys or WASD to move & jump", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0);
  }

  update(time, delta) {
    // Allow the player to respond to key presses and move itself
    this.player.update();

    if (this.player.sprite.y > this.groundLayer.height) {
      this.player.destroy();
      this.scene.restart();
    }
  }
}

PlatformerScene = new PlatformerScene();

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    pixelArt: false,
    backgroundColor: "#1d212d",
    scene: PlatformerScene,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1000 }
      }
    }
  };
  
const game = new Phaser.Game(config);


////// Directory code ///////
process.chdir('C:\\Users\\runin\\Documents\\TestDir')
let CurrentDirectory = process.cwd();

function changeDirectory(direction, folder){
  if(direction == 'up'){
    let filePath = path.dirname(CurrentDirectory)
    process.chdir(filePath)
    CurrentDirectory = process.cwd();
  }else if(direction == 'down'){
    let filePath = path.join(CurrentDirectory, folder)
    process.chdir(filePath)
    CurrentDirectory = process.cwd();
  }
}

// returns object with file info
function getFileInfo(fileName){
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    let stats = fs.statSync(filePath);

    // gets file size, creation time, last modification, and absolute path
    let size = stats.size;
    let creationTime = stats.birthtime.toLocaleString('en-US');
    let modTime = stats.mtime.toLocaleString('en-US');
    let absolutePath = filePath;
    
    const obj = {
      size: size,
      creationTime: creationTime,
      modTime: modTime,
      absolutePath: absolutePath
    }

    return obj;    
  } 
  catch (err) {
    console.error(err)
  }
}

// deletes file or directory
async function remover(fileName){  
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    await fs.remove(filePath)
    console.log('Removed')
  } catch (err) {
    console.error(err)
  }
}

// creates new empty file at cwd
async function newFile (fileName) {
  try {
    let filePath = path.join(CurrentDirectory, fileName);
    await fs.writeFile(filePath, "");
    console.log('New File created!')
  } 
  catch (err) {
    console.error(err)
  }
}

// creates new folder at cwd
async function newFolder (folderName) {
  try {
      let filePath = path.join(CurrentDirectory, folderName)
      await fs.mkdir(filePath)
      console.log('New Folder created!')
  } catch (err) {
      console.error(err)
  }
}

// opens file
async function openFile(fileName) {
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    shell.openItem(filePath)
  } 
  catch (err) {
    console.error(err)
  }
}

// moves file from one directory to another
async function moveFile (src) {
  const options = {
      title : "Select New Directory",
      defaultPath : CurrentDirectory,
      buttonLabel : "Select Directory",
      properties : ["openDirectory"]
  }
  let filePath = path.join(CurrentDirectory, src)
  dialog.showOpenDialog( options, async (dest) => {
      try {
          let filename = path.parse(src)
          let destPath = path.join(dest[0], filename.base)
          await fs.move(filePath, destPath)
          console.log('File moved to ' + destPath  + '!')
        } catch (err) {
          console.error(err)
        }
  })
  
}

// copies file to specified directory
async function copyFile(src) {
  const options = {
      title: "Select New Directory",
      defaultPath : CurrentDirectory,
      buttonLabel : "Select Directory",
      properties : ["openDirectory"]
  }

  let filePath = path.join(CurrentDirectory, src)
  dialog.showOpenDialog(win ,options, async (dest) => {
      try {
          let filename = path.parse(src)
          let destPath = path.join(dest[0], filename.base)
          await fs.copy(filePath, destPath)
          console.log('File Copied to ' + destPath + '!')
      } catch (err) {
          console.error(err)
      }
  })
}