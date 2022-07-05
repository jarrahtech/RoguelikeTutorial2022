
export class Entity {
    constructor(x, y, glyph, fg, bg) {
        this.x = x
        this.y = y
        this.glyph = glyph
        this.fg = fg
        this.bg = bg
    }

    move(xDelta, yDelta) {
        this.x += xDelta
        this.y += yDelta
    }

    render(display) {
        display.draw(this.x, this.y, this.glyph, this.fg, this.bg);
    }
}