"use strict";

import * as color from './color.js';

export class HpBar {

    constructor(x, y, width, max, fg = color.barFilled, bg = color.barEmpty, txt = color.bar) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.max = max;
        this.fg = fg;
        this.bg = bg;
        this.txt = txt;
    }

    render(display, value) {
        let filledWidth = Math.floor(value/this.max * this.width);
        for (let i=0; i<filledWidth; i++) {
            display.draw(this.x+i, this.y, " ", null, this.fg);
        }
        for (let i=filledWidth; i<this.width; i++) {
            display.draw(this.x+i, this.y, " ", null, this.bg); 
        }
        let text = `HP: ${value}/${this.max}`;
        for (let i=0; i<text.length; i++) {
            display.drawOver(this.x+i+2, this.y, text[i], this.txt, null);
        }
    }
}