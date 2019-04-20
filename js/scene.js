const Phaser = require('phaser');

const config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 800, // Canvas width in pixels
    height: 600, // Canvas height in pixels
    parent: "game-container", // ID of the DOM element to add the canvas to
    scene: {
        preload: preload,
        create: create,
        update: update
    }//,
    // physics: {
    //     default: "arcade",
    //     arcade: {
    //         gravity: { y: 0 } // Top down game, so no gravity
    //     }
    // }
};
  
function getTileProperties() {

    var x = layer.getTileX(game.input.activePointer.worldX);
    var y = layer.getTileY(game.input.activePointer.worldY);

    var tile = map.getTile(x, y, layer);
    
    // Note: JSON.stringify will convert the object tile properties to a string
    currentDataString = JSON.stringify( tile.properties );

    console.log(currentDataString)

    }

const game = new Phaser.Game(config);
let player;
let level = 1;
  
function preload() {
    this.load.image('terrain', 'assets/tilesets/terrain.png');
    this.load.image('terrain2', 'assets/tilesets/terrain.tsx');

    this.load.tilemapTiledJSON('map_sm', 'assets/maps/RoomSmall.json')
    this.load.tilemapTiledJSON('map_md', 'assets/maps/RoomMed.json')
    this.load.tilemapTiledJSON('map_lg', 'assets/maps/RoomLarge.json')

    this.load.spritesheet(
        "steve",
        "assets/spritesheets/steve.png",
        {
            frameWidth: 30,
            frameHeight: 60,
            margin: 1,
            spacing: 2
        }
    );
}
  
function create() {
    level++;
    let map;
    if(currSubDir.length < 3){
        map = this.make.tilemap({ key: "map_sm"});
    }else if(currSubDir.length < 10){
        map = this.make.tilemap({ key: "map_md"});
    }else{
        map = this.make.tilemap({ key: "map_lg"});
    }

    game.input.mouse.onMouseDown(getTileProperties)
    //opens option menu when 'K' is pressed
    this.input.keyboard.on('keydown_K', openOption, this);

    const tileset = map.addTilesetImage('terrain', "terrain");
    const belowLayer = map.createDynamicLayer("Background", tileset, 0, 0).setScale(2);
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0).setScale(2);

    groundLayer.forEachTile((tile)=>{
        if(tile.index == 84){
            if(level == 1){
                groundLayer.removeTileAt(tile.x, tile.y)
            }else{
                tile.properties.changeDirectory = 'up';
            }
        }
        
    })

    for(let i = 0; i < currSubDir.length; ++i){
        let x = Math.floor( ((i+3) * currSubDir.length)/ 2);
        const y = 5;

        const filePath = path.join(CurrentDirectory, currSubDir[i])
        const stats = fs.statSync(filePath);
        const letname = currSubDir[i]
        let curTile;

        if(stats.isDirectory()){
            //places dark tile in background
            belowLayer.putTileAt(168, x, y)
            belowLayer.putTileAt(168, x, y+1)
            // places door in foreground
            groundLayer.putTileAt(82, x, y)
            groundLayer.putTileAt(98, x, y+1)
            
            curTile = groundLayer.getTileAt(x, y)
            curTile.properties.changeDirectory = 'down';
            curTile.properties.directory = currSubDir[i];

        }else if(stats.isFile()){
            if(stats.size < 300000){
                groundLayer.putTileAt(36, x, y+1)
                curTile = groundLayer.getTileAt(x, y+1)
                curTile.properties.fileName = currSubDir[i];
            }else if(stats.size < 1000000){
                groundLayer.putTileAt(36, x, y+1)
                groundLayer.putTileAt(36, x, y);
                curTile = groundLayer.getTileAt(x, y+1)
                curTile.properties.fileName = currSubDir[i];
            }else{
                groundLayer.putTileAt(36, x, y+1);
                groundLayer.putTileAt(36, x, y);
                groundLayer.putTileAt(36, x, y-1);
                curTile = groundLayer.getTileAt(x, y+1)
                curTile.properties.fileName = currSubDir[i];
            }           
        }
    }
    

    groundLayer.setCollision(3)

    //player = this.physics.add.sprite(400, 350, "steve");





    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //camera.startFollow(this.player.sprite);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 270, "Use Arrow keys to move and K for actions", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0);
}
  
function update(time, delta) {
    // Runs once per frame for the duration of the scene
    const keys = this.keys;
    const sprite = this.sprite;
    const speed = 300;
    const prevVelocity = sprite.body.velocity.clone();

    // Stop any previous movement from the last frame
    sprite.body.setVelocity(0);

    // Horizontal movement
    if (keys.left.isDown) {
        sprite.body.setVelocityX(-speed);
        sprite.setFlipX(true);
      } else if (keys.right.isDown) {
        sprite.body.setVelocityX(speed);
        sprite.setFlipX(false);
      }
      // Navigates directory
      if (keys.up.isDown && collision) {
        //get tile collision

        //changeDirectory()
      }

    //on collision with bookcase

    // this.add
    //     .text(16, 16, tile.properties.fileName, {
    //         font: "18px monospace",
    //         fill: "#000000",
    //         padding: { x: 20, y: 10 },
    //         backgroundColor: "#ffffff"
    //     })
    //     .setScrollFactor(0);
}