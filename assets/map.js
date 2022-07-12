import { Entity } from './entity.js';

export class TileDisplay {
    constructor(glyph, fg, bg) {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
    }

    render(display, x, y) {
        display.draw(x, y, this.glyph, this.fg, this.bg);
    }
}

export class TileType {
    constructor(visible, seen, unseen, walkable, transparent) {
        this.visible = visible;
        this.seen = seen;
        this.unseen = unseen;
        this.walkable = walkable;
        this.transparent = transparent;
    }

    render(display, visible, seen, x, y) {
        if (visible) {
            this.visible.render(display, x, y);
        } else if (seen) {
            this.seen.render(display, x, y);
        } else {
            this.unseen.render(display, x, y);
        }
    }
}

var inLightColor = '#ffff0080';
var rememberColor = '#777777aa';
var wallColor = '#ccccccff'
var unseenColor = 'black'

var floor = new TileType(new TileDisplay(" ", unseenColor, inLightColor), new TileDisplay(" ", unseenColor, rememberColor), new TileDisplay(" ", unseenColor, unseenColor), true, true)
var wall = new TileType(new TileDisplay(" ", unseenColor, wallColor), new TileDisplay(" ", unseenColor, wallColor), new TileDisplay(" ", unseenColor, unseenColor), false, false)

export class Tile {
    constructor(type) {
        this.visible = false;
        this.seen = false;
        this.type = type;
    }

    clearVisibility() {
        this.visible = false;
    }

    setVisible() {
        this.visible = true;
        this.seen = true;
    }

    render(display, x, y) {
        this.type.render(display, this.visible, this.seen, x, y);
    }
}

export class GameMap {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = new ROT.Map.Digger(width, height);       
        this.tiles = Array.from(Array(width), () => new Array(height));
        this.map.create((x, y, value) => {
            this.tiles[x][y] = new Tile((value === 0)?floor:wall);
        });
        this.player = new Entity("Player", this.randomPosition(), "@", 'white', inLightColor, true);
        this.entities = [];
        this.placeEntities(2);   
        this.fov = new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this), { topology: 8 });
    }

    placeEntities(maxPerRoom) {
        var monsters = {
            "orc": 4,
            "troll": 1
        }

        this.map.getRooms().forEach(r => {
            for (var i=this.randInt(0, maxPerRoom-1); i>=0; i--) {
                switch(ROT.RNG.getWeightedValue(monsters)) {
                    case "orc": this.entities.push(new Entity("Orc", this.randomRoomPosition(r), 'o', 'white', inLightColor, true)); break;
                    case "troll": this.entities.push(new Entity("Troll", this.randomRoomPosition(r), 't', 'white', inLightColor, true)); break;
                }
            }
        });
    }

    inBounds(x, y) {
        return 0<=x && x<this.width && 0<=y && y<this.height;
    }

    isVisible(x, y) {
        return this.inBounds(x, y) && this.tiles[x][y].visible;
    }

    isTransparent(x, y) {
        return this.inBounds(x, y) && this.tiles[x][y].type.transparent;
    }

    blockingEntityAt(x, y) {
        for (var i=0; i<this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity.blocker && entity.x===x && entity.y===y) {
                return entity;
            }
        }
        return null;
    }

    clearFov() {
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height; y++) {
                this.tiles[x][y].clearVisibility();
            }
        }
    }

    updateFov(entity) {
        this.clearFov();
        this.fov.compute(entity.x, entity.y, 8, function(x,y,r,v) {
            this.tiles[x][y].setVisible();
        }.bind(this));
    }

    render(display) {
        this.updateFov(this.player);
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height; y++) {
                this.tiles[x][y].render(display, x, y);
            }
        }
        this.player.render(display, this);
        this.entities.forEach((e, i) => e.render(display, this));
    }

    randomPosition() {
        var rooms = this.map.getRooms();
        return this.randomRoomPosition(rooms[this.randInt(0, rooms.length-1)]);
    }

    randomRoomPosition(room) {
        return [this.randInt(room.getLeft(), room.getRight()), this.randInt(room.getTop(), room.getBottom())];
    }

    randInt(min, max) {
        return Math.floor(ROT.RNG.getUniform() * (max - min + 1) + min);
    }
}