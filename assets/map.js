
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
export var wall = new Tile(" ", 'grey', 'grey', false, false)

export class GameMap {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = Array.from(Array(width), () => new Array(height).fill(floor));
        this.tiles[20][3] = wall;
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
}