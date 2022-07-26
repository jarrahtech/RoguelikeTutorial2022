"use strict";

import { ImpossibleException } from "./exceptions.js";
import { PlayerListEventHandler } from "./eventHandler.js"

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
        throw new ImpossibleException("That way is blocked.")
    }
}

export class MeleeAction extends ActionWithDirection {
    perform() {
        if (this.blocker && this.entity.attack && this.blocker.hp) {
            this.entity.attack(this.blocker);
            return true;
        }
        throw new ImpossibleException("Nothing to attack.")
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

export class ItemAction {
    constructor(entity, item, target = entity.location) {
        this.entity = entity;
        this.item = item;
        this.target = target;
    }

    targetEntity() {
        return this.target.blockingEntity();
    }

    perform() {
        this.item.activate(this);
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
        this.display.drawBox(this.x, this.y, this.width, this.height, "Message History", false);
        this.messages.render(this.display);
        return false;
    }
}

class ListAction {
    startCode = "a".charCodeAt(0)

    perform() {
        switch (this.items.length) {
            case 0: throw new ImpossibleException(`Nothing to ${this.actionName}.`)   
            case 1: return this.action(this.items[0]); 
            default: 
                let x = this.entity.location.x<30?31:0;
                let y = 0;
                let display = this.entity.engine().display;
                display.drawBox(x, y, this.title.length+4, this.items.length+2, this.title);
                this.items.forEach((e, i) => {
                    display.draw(x+1, y+1+i, String.fromCharCode(this.startCode + i), 'white', null);
                    for (let j=0; j<e.name.length; j++) {
                        display.drawOver(x+3+j, y+1+i, e.name[j], 'white', null);
                    }
                });
                this.entity.engine().eventHandler = new PlayerListEventHandler(this.entity, this.items, this.action);
                return false;
        }      
    }
}

export class DropAction extends ListAction {
    actionName = "drop";
    title = "Select an item to drop"

    constructor(entity) {
        super();
        this.entity = entity;
        if (entity.items) {
            this.items = entity.items;
            this.action = this.entity.drop.bind(entity);
        } else {
            throw new ImpossibleException("No inventory")  
        }
    }   
}

export class PickupAction extends ListAction {
    actionName = "pickup";
    title = "Select an item to pickup"

    constructor(entity) {
        super();
        this.entity = entity;
        if (entity.items) {
            this.items = entity.location.items();
            this.action = this.entity.pickup.bind(entity);
        } else {
            throw new ImpossibleException("No inventory")  
        }
    }
}

export class UseAction extends ListAction {
    actionName = "use";
    title = "Select an item to use"

    constructor(entity) {
        super();
        this.entity = entity;
        if (entity.items) {
            this.items = entity.items;
            this.action = this.use.bind(this);
        } else {
            throw new ImpossibleException("No inventory")  
        }
    }

    use(item) {
        return item.activate(this);
    }
}