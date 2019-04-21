const Phaser = require('phaser');
// const Dungeon = require("@mikewesthad/dungeon");
// const Player =require("player.js");
// const TILES = require('tile-mapping.js')

/**
 * Scene that generates a new dungeon
 */
class DungeonScene extends Phaser.Scene {
  preload() {
    this.load.image("tiles", "assets/tilesets/buch-tileset-48px-extruded.png");
    this.load.spritesheet(
      "characters",
      "assets/spritesheets/buch-characters-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );
  }

  create() {
    // Generate a random world with a few extra options:
    //  - Rooms should only have odd dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, to leave enough room for the tiles
    //    that we're going to put on either side of the door opening.
    this.dungeon = new Dungeon({
      width: 100,
      height: 100,
      doorPadding: 2,
      randomSeed: 0,
      rooms: {
        width: { min: 15, max: 20, onlyOdd: true },
        height: { min: 15, max: 20, onlyOdd: true }
      }
    });

    // Creating a blank tilemap with dimensions matching the dungeon
    const map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2); // 1px margin, 2px spacing
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);

    this.groundLayer.fill(TILES.BLANK);

    // Use the array of rooms generated to place tiles in the map
    // Note: using an arrow function here so that "this" still refers to our scene
    this.dungeon.rooms.forEach(room => {
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the floor with mostly clean tiles
      this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

      // Place the room corners tiles
      this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
      this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

      // Fill the walls with mostly clean tiles
      this.groundLayer.weightedRandomize(left + 1, top, width - 2, 1, TILES.WALL.TOP);
      this.groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
      this.groundLayer.weightedRandomize(left, top + 1, 1, height - 2, TILES.WALL.LEFT);
      this.groundLayer.weightedRandomize(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);

      // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
      // room's location. Each direction has a different door to tile mapping.
      var doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
      for (var i = 0; i < doors.length; i++) {
        if (doors[i].y === 0) {
          this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].y === room.height - 1) {
          this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].x === 0) {
          this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
        } else if (doors[i].x === room.width - 1) {
          this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
        }
      }
    });




    // Place a stair for each subdirectory
    this.stuffLayer.putTileAt(TILES.STAIRS, this.dungeon.rooms[0].centerX,  this.dungeon.rooms[0].centerY);
    
    //opens option menu when 'K' is pressed
    this.input.keyboard.on('keydown_K', openOption, this);



    
    // Not exactly correct for the tileset since there are more possible floor tiles, but this will
    // do for the example.
    this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

    // Place the player in the center of the map
    this.player = new Player(this, (map.widthInPixels + 50) / 2, (map.heightInPixels + 200)/ 2);

    // Watch the player and ground layer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, this.groundLayer);

    // // Phaser supports multiple cameras, but you can access the default camera like this:
    // const camera = this.cameras.main;

    // // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // camera.startFollow(this.player.sprite);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, "Arrow keys to move and K for actions", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0);
  }

  update(time, delta) {
    this.player.update();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000",
  parent: "game-container",
  pixelArt: true,
  scene: DungeonScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);