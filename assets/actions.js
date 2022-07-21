"use strict";

export class NullAction {
    perform() {
        return false;
    }
}

export class WaitAction {
    perform() {
        return true;
    }
}

class ActionWithDirection {
    constructor(entity, delta, dest = entity.location.delta(delta[0], delta[1]), block = dest.blockingEntity()) {
        this.entity = entity;
        this.delta = delta;
        this.destination = dest;
        this.blocker = block;
    }
}

export class MoveAction extends ActionWithDirection {
    perform() {       
        if (this.destination.isWalkable() && !this.blocker) {         
            this.entity.moveTo(this.destination);
            return true;
        }
        return false;
    }
}

export class MeleeAction extends ActionWithDirection {
    perform() {
        if (this.blocker && this.entity.attack && this.blocker.hp) {
            this.entity.attack(this.blocker);
            return true;
        }
        return false;
    }
}

export class BumpAction extends ActionWithDirection {
    perform() {
        if (!this.blocker) {
            return new MoveAction(this.entity, this.delta, this.destination, null).perform()   
        } else {
            return new MeleeAction(this.entity, this.delta, this.destination, this.blocker).perform()
        }
    }
}

export class ShowMessageHistoryAction {
    constructor(x, y, width, height, messages, display) {
        this.messages = messages;
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.display = display
    }

    perform() {
        this.display.clear();
        for (let i=0; i<this.width; i++) {
            this.display.draw(this.x+i, this.y, " ", null, 'grey');
            this.display.draw(this.x+i, this.y+this.height-1, " ", null, 'grey');
        }
        for (let i=1; i<this.height-1; i++) {
            this.display.draw(this.x, this.y+i, " ", null, 'grey');
            this.display.draw(this.x+this.width-1, this.y+i, " ", null, 'grey');
        }
        const title = "Message History"
        for (let i=0; i<title.length; i++) {
            this.display.drawOver(this.x+2+i, this.y, title[i], 'white', null);
        }
        this.messages.render(this.display);
        return false;
    }
}