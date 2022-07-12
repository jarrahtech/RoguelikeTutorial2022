
export class Entity {
    constructor(pos, glyph, fg, bg) {
        this.x = pos[0]
        this.y = pos[1]
        this.glyph = glyph
        this.fg = fg
        this.bg = bg
    }

    move(xDelta, yDelta) {
        this.x += xDelta
        this.y += yDelta
    }

    render(display, gameMap) {
        if (gameMap.isVisible(this.x, this.y)) {
            display.draw(this.x, this.y, this.glyph, this.fg, this.bg);
        }
    }
}