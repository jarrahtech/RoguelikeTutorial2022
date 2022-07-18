"use strict";

export class Action {
    perform() {}
}

class ActionWithDirection extends Action {
    constructor(entity, dx, dy, dest = entity.location.delta(dx, dy), block = dest.blockingEntity()) {
        super();
        this.entity = entity;
        this.dx = dx;
        this.dy = dy;
        this.destination = dest;
        this.blocker = block;
    }

    perform() { }
}

class MoveAction extends ActionWithDirection {
    perform() {        
        if (this.destination.isWalkable()) {         
            this.entity.moveTo(this.destination);
        }
    }
}

class MeleeAction extends ActionWithDirection {
    perform() {
        alert(`You kick the ${this.blocker.name}, much to its annoyance!`);
    }
}

export class BumpAction extends ActionWithDirection {
    perform() {
        if (this.blocker==null) {
            return new MoveAction(this.entity, this.dx, this.dy, this.destination, null).perform()   
        } else {
            return new MeleeAction(this.entity, this.dx, this.dy, this.destination, this.blocker).perform()
        }
    }
}