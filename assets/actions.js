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
    //constructor(x, y, width, height, messages, display) {
    constructor(messages, display) {
        this.messages = messages;
        //this.x = x
       //this.y = y
        //this.width = width
        //this.height = height
        this.display = display
    }

    perform() {
        this.display.clear();
        this.messages.render(this.display);
        //log_console.draw_frame(0, 0, log_console.width, log_console.height)
        //log_console.print_box(
        //    0, 0, log_console.width, 1, "┤Message history├", alignment=tcod.CENTER
        //)
        //self.engine.message_log.render_messages(
        //    log_console,
        //    1,
        //    1,
        //    log_console.width - 2,
        //    log_console.height - 2,
        //    self.engine.message_log.messages[: self.cursor + 1],
        //)
        return false;
    }
}