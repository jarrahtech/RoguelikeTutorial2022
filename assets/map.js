
export class Tile {
    glyph;

    constructor(glyph, fg, bg, walkable, transparent) {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
        this.walkable = walkable;
        this.transparent = transparent;
    }

    render(display, x, y) {
        display.draw(x, y, this.glyph, this.fg, this.bg);
    }
}

export var floor = new Tile(" ", 'white', 'black', true, true)
export var wall = new Tile(" ", 'white', 'grey', false, false)
export var door = new Tile(" ", 'white', 'red', false, false)

export class GameMap {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = new ROT.Map.Digger(width, height);
        this.tiles = Array.from(Array(width), () => new Array(height).fill(wall));

        this.map.create((x, y, value) => {
            if (value === 0) {
                this.tiles[x][y] = floor;
            }
        });
    }

    inBounds(x, y) {
        return 0<=x && x<this.width && 0<=y && y<this.height;
    }

    render(display) {
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height; y++) {
                this.tiles[x][y].render(display, x, y);
            }
        }
    }

    randomPosition() {
        var rooms = this.map.getRooms();
        var room = rooms[this.randInt(0, rooms.length)];
        return [this.randInt(room.getLeft(), room.getRight()), this.randInt(room.getTop(), room.getBottom())];
    }

    randInt(min, max) {
        return Math.floor(ROT.RNG.getUniform() * (max - min + 1) + min);
    }
}