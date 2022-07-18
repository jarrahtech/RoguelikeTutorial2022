"use strict";

export class Action {
    perform() {
        return false;
    }
}

export class WaitAction {
    perform() {
        return true;
    }
}

class ActionWithDirection extends Action {
    constructor(entity, delta, dest = entity.location.delta(delta[0], delta[1]), block = dest.blockingEntity()) {
        super();
        this.entity = entity;
        this.delta = delta;
        this.destination = dest;
        this.blocker = block;
    }
}

export class MoveAction extends ActionWithDirection {
    perform() {       
        if (this.destination.isWalkable() && this.blocker==null) {         
            this.entity.moveTo(this.destination);
            return true;
        }
        return false;
    }
}

export class MeleeAction extends ActionWithDirection {
    perform() {
        if (this.blocker!=null) {
            alert(`You kick the ${this.blocker.name}, much to its annoyance!`);
            return true;
        }
        return false;
    }
}

export class BumpAction extends ActionWithDirection {
    perform() {
        if (this.blocker==null) {
            return new MoveAction(this.entity, this.delta, this.destination, null).perform()   
        } else {
            return new MeleeAction(this.entity, this.delta, this.destination, this.blocker).perform()
        }
    }
}