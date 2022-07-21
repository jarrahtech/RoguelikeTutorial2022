"use strict";

class Message {
    constructor(text, fg) {
        this.text = text
        this.fg = fg
        this.count = 1
        this.shown = false
    }

    fullText() {
        if (this.count > 1) {
            return `${this.text} (x${this.count})`;
        }
        return this.text;
    }

    canStackWith(text) {
        return !this.shown && text === this.text
    }
}

export class InfoLine {
    constructor(x, y, width) {
        this.x = x
        this.y = y
        this.width = width     
    } 
    
    clear(display) {
        for (let j=0; j<this.width; j++) {
            display.draw(this.x+j, this.y, " ", 'white', null);
        }  
    }

    show(display, text) {
        this.clear(display);
        const line = text.substring(0, this.width);   
        const offset = Math.floor((this.width-line.length)/2)
        for (let j=0; j<line.length; j++) {
            display.draw(this.x+j+offset, this.y, line[j], 'white', null);
        }   
    }
}

export class MessageLog {

    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.messages = []        
    }

    addMessage(text, fg = 'white', stack = true) {
        if (!this.shown && stack && this.messages.length>0 && this.messages.at(-1).canStackWith(text)) {
            this.messages.at(-1).count += 1
        } else {
            this.messages.push(new Message(text, fg));
        }
    }

    render(display) {
        let yOffset = this.height - 1
        for (let i=this.messages.length-1; i>=0; i--) {
            let msg = this.messages[i]
            let text = msg.fullText().substring(0, this.width);
            for (let j=0; j<text.length; j++) {
                display.draw(this.x+j, this.y+yOffset, text[j], msg.fg, null);
            }
            this.messages.at(-1).shown = true;
            yOffset--;
            if (yOffset<0) {
                return;
            }
        }
    }
}