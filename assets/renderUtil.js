"use strict";

import * as color from './color.js';

export class HpBar {

    constructor(x, y, width, fg = color.barFilled, bg = color.barEmpty, txt = color.bar) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.fg = fg;
        this.bg = bg;
        this.txt = txt;
    }

    render(display, value, max) {
        let filledWidth = Math.floor(value/max * this.width);
        for (let i=0; i<filledWidth; i++) {
            display.draw(this.x+i, this.y, " ", null, this.fg);
        }
        for (let i=filledWidth; i<this.width; i++) {
            display.draw(this.x+i, this.y, " ", null, this.bg); 
        }
        let text = `HP: ${value}/${max}`;
        for (let i=0; i<text.length; i++) {
            display.drawOver(this.x+i+2, this.y, text[i], this.txt, null);
        }
    }
}