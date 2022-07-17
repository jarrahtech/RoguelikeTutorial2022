"use strict";

import { inLightColor } from './map.js';

class Entity {

    constructor({name="Error", glyph="?", fg, bg, blocker=false}) {
        this.glyph = glyph
        this.fg = fg
        this.bg = bg
        this.name = name
        this.blocker = blocker
    }

    setPosition(pos) {
        this.x = pos[0]
        this.y = pos[1]
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

export class EntityFactory {
    constructor() {
        this.entities = {
            "player": {
                "name": "Player",
                "glyph": "@",
                "fg": 'white',
                "bg": inLightColor,
                "blocker": true
            }, 
            "orc": {
                "name": "Orc",
                "glyph": "o",
                "fg": 'white',
                "bg": inLightColor,
                "blocker": true
            }, 
            "troll": {
                "name": "Troll",
                "glyph": "T",
                "fg": 'white',
                "bg": inLightColor,
                "blocker": true
            }
        }
    }

    get(name, pos) {
        const conf = this.entities[name];
        let e = new Entity(conf);
        e.setPosition(pos);
        return e;
    }
}
