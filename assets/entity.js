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

    moveTo(destination) {
        this.location = destination;
    }

    render(display) {
        if (this.location.isVisible()) {
            display.draw(this.location.x, this.location.y, this.glyph, this.fg, this.bg);
        }
    }
}

export class EntityFactory {

    entitiesConfig = {
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
    };

    get(name) {
        return new Entity(this.entitiesConfig[name]);
    }
}
