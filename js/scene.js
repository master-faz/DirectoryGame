const Phaser = require('phaser');

const config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 1000, // Canvas width in pixels
    height: 320, // Canvas height in pixels
    parent: "game-container", // ID of the DOM element to add the canvas to
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 }, // Top down game, so no gravity
        }
    }
};

const game = new Phaser.Game(config);
let player;
let level = 1;
let sceneVar;
let cursors;
let map;

function preload() {
    this.load.image('terrain', 'assets/tilesets/terrain.png');
    this.load.image('dirt', 'assets/tilesets/dirt.png');

    this.load.tilemapTiledJSON('map_lg', 'assets/maps/RoomLarge.json')

    this.load.spritesheet('player', 'assets/spritesheets/player.png', {
        frameWidth: 32,
        frameHeight: 48,
    })

    //this.load.multiatlas("steve_atlas",'assets/spritesheets/sprites.json', 'assets/spritesheets');
}

function create() {
    level++;
    hasChangedDir = false;
    map = this.make.tilemap({ key: "map_lg" });
    sceneVar = this;

    const tileset = map.addTilesetImage('terrain', "terrain");
    const belowLayer = map.createDynamicLayer("Background", tileset, 0, 0).setScale(2);
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0).setScale(2);
    const fileLayer = map.createBlankDynamicLayer('Files', tileset, 0, 0).setScale(2);


    groundLayer.forEachTile((tile) => {
        if (tile.index == 84) {
            groundLayer.removeTileAt(tile.x, tile.y)
            if (level != 1) {
                fileLayer.putTileAt(84, tile.x, tile.y);
                let newTile = fileLayer.getTileAt(tile.x, tile.y)
                newTile.properties.changeDirectory = 'up';
            }
        }
    })

    // This will set Tile ID 84 (ladder) to call the function "changeDirectory" when collided with
    fileLayer.setCollision(84)
    fileLayer.setTileIndexCallback(84, (player, tile) => {
        tileChangeDir(tile.properties)
        enableButtons()
    }, this);
    // This will set Tile ID 26 (books) to call the function "changeDirectory" when collided with
    fileLayer.setCollision(26)
    fileLayer.setTileIndexCallback(36, (player, tile) => {
        selectFile(tile.properties)
        enableButtons()
    }, this);
    // This will set Tile ID 82 (door) to call the function "changeDirectory" when collided with
    fileLayer.setCollision(82)
    fileLayer.setTileIndexCallback(82, (player, tile) => {
        tileChangeDir(tile.properties)
        enableButtons()
    }, this);


    // makes it so player can't occupy ground tiles
    groundLayer.setCollisionBetween(1, 5);

    if(currSubDir.length == null){
        currSubDir.length = 0
    }

    for (let i = 0; i < currSubDir.length; ++i) {
        let x = (i * 2) + 6;
        const y = 5;

        if(i > 13){
            break;
        }

        const filePath = path.join(CurrentDirectory, currSubDir[i])
        const stats = fs.statSync(filePath);
        const letname = currSubDir[i]
        let curTile;

        if (stats.isDirectory()) {
            //places dark tile in background
            belowLayer.putTileAt(168, x, y)
            belowLayer.putTileAt(168, x, y + 1)
            // places door in foreground
            fileLayer.putTileAt(82, x, y)
            fileLayer.putTileAt(98, x, y + 1)

            curTile = fileLayer.getTileAt(x, y)
            curTile.properties.changeDirectory = 'down';
            curTile.properties.directory = currSubDir[i];

        } else if (stats.isFile()) {
            if (stats.size < 300000) {
                fileLayer.putTileAt(36, x, y + 1)
                curTile = fileLayer.getTileAt(x, y + 1)
                curTile.properties.fileName = currSubDir[i];
            } else if (stats.size < 1000000) {
                fileLayer.putTileAt(36, x, y + 1)
                fileLayer.putTileAt(36, x, y);
                curTile = fileLayer.getTileAt(x, y + 1)
                curTile.properties.fileName = currSubDir[i];
            } else {
                fileLayer.putTileAt(36, x, y + 1);
                fileLayer.putTileAt(36, x, y);
                fileLayer.putTileAt(36, x, y - 1);
                curTile = fileLayer.getTileAt(x, y + 1)
                curTile.properties.fileName = currSubDir[i];
            }
        }
    }


    player = this.physics.add.sprite(0, 0, 'player').setPosition(100, 180);
    player.setBounce(0.1);
    player.setCollideWorldBounds(true)
    player.body.setGravityY(300)
    this.physics.add.collider(player, groundLayer);
    this.physics.add.overlap(player, fileLayer);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    // Help text that has a "fixed" position on the screen
    this.add
        .text(16, 270, "Use Arrow keys to move", {
            font: "18px monospace",
            fill: "#000000",
            padding: { x: 20, y: 10 },
            backgroundColor: "#ffffff"
        })
        .setScrollFactor(0);
}

function update(time, delta) {
    // Runs once per frame for the duration of the scene
    const sprite = player;
    const speed = 300;

    // Stop any previous movement from the last frame
    sprite.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
        sprite.body.setVelocityX(-speed);
        sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
        sprite.body.setVelocityX(speed);
        sprite.setFlipX(false);
    }
    if(hasChangedDir){
        return
    }
    if(hasContentChanged){
        hasContentChanged = false;
        fs.readdir(CurrentDirectory, (err, files) => {
            if (err) {
              alert('Error getting sub directories')
            }
            currSubDir = files;
        })
        sceneVar.scene.restart();
    }
}

function tileChangeDir(tile) {
    if(tile.changeDirectory == 'up'){
        document.getElementById('currSelected').innerText = path.dirname(CurrentDirectory)
        deleteBtn.disabled = true;
    }else{
        deleteBtn.disabled = false;
        document.getElementById('currSelected').innerText = tile.directory
    }
    
    if (cursors.up.isDown && !hasChangedDir) {
        changeDirectory(tile.changeDirectory, tile.directory)
        sceneVar.scene.restart();
    }   
}

function selectFile(tile){
    deleteBtn.disabled = false;
    document.getElementById('currSelected').innerText = tile.fileName;
}