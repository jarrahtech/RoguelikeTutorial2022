
export class Entity {
    constructor(name, pos, glyph, fg, bg, blocker) {
        this.x = pos[0]
        this.y = pos[1]
        this.glyph = glyph
        this.fg = fg
        this.bg = bg
        this.name = name
        this.blocker = blocker
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