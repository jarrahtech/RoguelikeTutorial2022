"use strict";

import { NullAction, BumpAction, WaitAction, ShowMessageHistoryAction, DropAction, PickupAction, UseAction, TakeStairsAction } from "./actions.js";
import { Location } from "./map.js";
import { conf } from "./game.js"
import { ImpossibleException } from "./exceptions.js";

let toMain = function(engine, takeTurn=false) {
    engine.eventHandler = new MainEventHandler();
    engine.render();
    return takeTurn?new WaitAction() : new NullAction();   
}

export class NoEventHandler {
    dispatch(player, inputData) {
        return new NullAction();
    }

    mouse(player, inputData) {
        this.lookAt(player, ...player.engine().display.eventToPosition(inputData))
    }

    lookAt(player, x, y) {
        const mouseLoc = new Location(x, y, player.location.map);
        if (mouseLoc.isVisible()) {
            const line = ROT.Util.capitalize(mouseLoc.entities().map(e => e.name).join(", "));
            player.engine().info(line)
        }
    }
}

const moveKeys = new Map([
    // Left
    [ROT.KEYS.VK_LEFT, [-1, 0]],
    [ROT.KEYS.VK_A, [-1, 0]],
    [ROT.KEYS.VK_KEYPAD4, [-1, 0]],
    // Right
    [ROT.KEYS.VK_RIGHT, [1, 0]],
    [ROT.KEYS.VK_D, [1, 0]],
    [ROT.KEYS.VK_KEYPAD6, [1, 0]],
    // Up
    [ROT.KEYS.VK_UP, [0, -1]],
    [ROT.KEYS.VK_W, [0, -1]],
    [ROT.KEYS.VK_KEYPAD8, [0, -1]],
    // Down
    [ROT.KEYS.VK_DOWN, [0, 1]],
    [ROT.KEYS.VK_S, [0, 1]],
    [ROT.KEYS.VK_KEYPAD2, [0, 1]],
    // Up Left
    [ROT.KEYS.VK_HOME, [-1, -1]],
    [ROT.KEYS.VK_Q, [-1, -1]],
    [ROT.KEYS.VK_KEYPAD7, [-1, -1]],
    // Up Right
    [ROT.KEYS.VK_PAGE_UP, [1, -1]],
    [ROT.KEYS.VK_E, [1, -1]],
    [ROT.KEYS.VK_KEYPAD9, [1, -1]],
    // Down Right
    [ROT.KEYS.VK_PAGE_DOWN, [1, 1]],
    [ROT.KEYS.VK_X, [1, 1]],
    [ROT.KEYS.VK_KEYPAD3, [1, 1]],
    // Down Left
    [ROT.KEYS.VK_END, [-1, 1]],
    [ROT.KEYS.VK_Z, [-1, 1]],
    [ROT.KEYS.VK_KEYPAD1, [-1, 1]]
]);

export class MainEventHandler extends NoEventHandler {

    waitKeys = new Set([
        ROT.KEYS.VK_PERIOD,
        ROT.KEYS.VK_INSERT,
        ROT.KEYS.VK_KEYPAD0
    ]);

    dispatch(player, inputData) {
        if (moveKeys.has(inputData.keyCode)) {
            return new BumpAction(player, moveKeys.get(inputData.keyCode));
        } else if (inputData.shiftKey && (inputData.keyCode===ROT.KEYS.VK_PERIOD || inputData.keyCode===ROT.KEYS.VK_COMMA)) {
            return new TakeStairsAction(player);
        } else if (this.waitKeys.has(inputData.keyCode)) {
            return new WaitAction();
        } else if (inputData.keyCode===ROT.KEYS.VK_V) {         
            let history = new HistoryViewerEventHandler(player.engine().messages, 
                                    conf.messageHistoryBorder, conf.messageHistoryBorder, 
                                    conf.width - conf.messageHistoryBorder*2, 
                                    conf.height - conf.messageHistoryBorder*2);
            player.engine().eventHandler = history;
            return history.createAction(player); 
        } else if (inputData.keyCode===ROT.KEYS.VK_L) {
            return new DropAction(player);
        } else if (inputData.keyCode===ROT.KEYS.VK_P) {
            return new PickupAction(player);
        } else if (inputData.keyCode===ROT.KEYS.VK_U) {
            return new UseAction(player);
        } else if (inputData.keyCode===ROT.KEYS.VK_SLASH) {
            player.engine().eventHandler = new LookHandler(player)
        } else if (inputData.keyCode===ROT.KEYS.VK_C) {
            player.engine().eventHandler = new CharacterScreenHandler(player)
        } 
        return new NullAction(); 
    }  
}

export class PlayerListEventHandler {

    constructor(entity, list, itemAction) {
        this.entity = entity;
        this.list = list;
        this.itemAction = itemAction;
    }

    mouse(player, inputData) { }

    dispatch(player, inputData) {
        let index = inputData.key.charCodeAt(0)-"a".charCodeAt(0)
        if (index>=0 && index<26) {
            if (index<this.list.length) {
                player.engine().eventHandler = new MainEventHandler();
                player.engine().render(player.engine().display);
                return this.itemAction(this.list[index])?new WaitAction() : new NullAction(); 
            } else {
                throw new ImpossibleException("Invalid entry.");
            }
        } else {
            return toMain(player.engine()); 
        }
    }
}

export class LevelUpEventHandler {

    constructor(entity) {
        this.render(entity);
    }

    render(player) {
        let display = player.engine().display;
        
        let x = player.location.x<23?24:0;
        display.drawBox(x, 0, 40, 9, "Level Up");
        this.draw(display, "Congratulations! You level up!", x, 1)
        this.draw(display, "Select an attribute to increase.", x, 2)
        this.draw(display, `a) Constitution (+20 HP, from ${player.maxHp})`, x, 4);
        this.draw(display, `b) Strength (+1 attack, from ${player.power})`, x, 5);
        this.draw(display, `c) Agility (+1 defense, from ${player.defense})`, x, 6);
    }

    draw(display, text, x, y) {
        for (let j=0; j<text.length; j++) {
            display.drawOver(x+1+j, y, text[j], 'white', null);
        }
    }

    mouse(player, inputData) { }

    dispatch(player, inputData) {
        switch (inputData.key.charCodeAt(0)-"a".charCodeAt(0)) {
            case 0: player.increaseHp(); break;
            case 1: player.increasePower(); break;
            case 2: player.increaseDefense(); break;
            default: throw new ImpossibleException("Invalid entry.");
        }
        return toMain(player.engine(), true); 
    }
}

export class HistoryViewerEventHandler {
    
    cursorKeys = new Map([
        // Left
        [ROT.KEYS.VK_UP, -1],
        [ROT.KEYS.VK_DOWN, 1],
        [ROT.KEYS.VK_PAGE_UP, -10],
        [ROT.KEYS.VK_PAGE_DOWN, 10]
    ]);

    constructor(messageLog, x, y, width, height) {
        this.messages = messageLog;
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.maxCursor = messageLog.messages.length - 1
        this.cursor = this.maxCursor
    }

    mouse(player, inputData) { }

    createAction(player) {
        return new ShowMessageHistoryAction(this.x, this.y, this.width, this.height,
                                            player.engine().messages.convertTo(this.x+1, this.y+1, this.width-2, this.height-2, this.cursor), 
                                            player.engine().display);      
    }

    dispatch(player, inputData) {
        if (this.cursorKeys.has(inputData.keyCode)) {
            let adjust = this.cursorKeys.get(inputData.keyCode)
            if (adjust < 0 && this.cursor === 0) {
                this.cursor = this.maxCursor
            } else if (adjust > 0 && this.cursor === this.maxCursor) {
                this.cursor = 0
            } else {
                this.cursor = Math.max(0, Math.min(this.cursor + adjust, this.maxCursor))
            }
        } else if (inputData.keyCode === ROT.KEYS.VK_HOME) {
            this.cursor = 0 
        } else if (inputData.keyCode === ROT.KEYS.VK_END) {
            this.cursor = this.maxCursor;
        } else {
            player.engine().eventHandler = new MainEventHandler();
            player.engine().render();
            return new NullAction(); 
        }  
        return this.createAction(player);      
    }
}

class SelectIndexHandler extends NoEventHandler {

    confirmKeys = new Set([
        ROT.KEYS.VK_RETURN,
        ROT.KEYS.VK_ENTER
    ])

    constructor(player) {
        super();
        this.mouseLocation = player.location;
        this.renderCursor(player.engine());
    }

    renderCursor(engine) {
        engine.render();
        engine.display.drawOver(this.mouseLocation.x, this.mouseLocation.y, "+", 'white', null);
    }

    dispatch(player, inputData) {
        if (moveKeys.has(inputData.keyCode)) {
            let modifier = 1;
            if (inputData.shiftKey) {
                modifier *= 5
            } 
            if (inputData.ctrlKey) {
                modifier *= 10
            }
            if (inputData.altKey) {
                modifier *= 20
            }

            let [dx, dy] = moveKeys.get(inputData.keyCode)
            let newLoc = this.mouseLocation.delta(dx * modifier, dy * modifier)        
            this.mouseLocation = newLoc.clampToBounds();
            this.renderCursor(player.engine())
            return new NullAction();
        } else if (this.confirmKeys.has(inputData.keyCode)) {
            return this.selected(player);
        }
        return toMain(player.engine()); 
    }

    mouse(player, inputData) { 
        if (inputData.buttons===1) {
            this.selected(player);
        }
    }

}

class LookHandler extends SelectIndexHandler {

    constructor(player) {
        super(player)
    }

    renderCursor(engine) {
        super.renderCursor(engine);
        this.lookAt(engine.player, this.mouseLocation.x, this.mouseLocation.y)
    }

    selected(player) {
        return toMain(player.engine())
    }
}

export class SingleRangedAttackHandler extends SelectIndexHandler {

    constructor(player, callback) {
        super(player)
        this.callback = callback;
    }

    selected(player) {
        toMain(player.engine(), true);
        return this.callback(this.mouseLocation)
    }
}

export class AreaRangedAttackHandler extends SelectIndexHandler {

    constructor(player, radius, callback) {
        super(player)
        this.radius = radius;
        this.callback = callback;
        this.renderCursor(player.engine());
    }

    renderCursor(engine) {
        super.renderCursor(engine);
        for (let i=-this.radius; i<this.radius+1; i++) {
            for (let j=-this.radius; j<this.radius+1; j++) {   
                engine.display.drawOver(this.mouseLocation.x+i, this.mouseLocation.y+j, "+", 'white', null);
            }
        }
    }

    selected(player) {
        toMain(player.engine(), true);
        return this.callback(this.mouseLocation)
    }
}

class CharacterScreenHandler {
    constructor(entity) {
        console.log(":ASDF")
        this.render(entity);
    }

    render(player) {
        let display = player.engine().display;
        
        let x = player.location.x<25?25:0;
        display.drawBox(x, 0, 30, 8, "Character Information");
        this.draw(display, `Level: ${player.currentLevel}`, x, 2);
        this.draw(display, `XP: ${player.currentXp}`, x, 3);
        this.draw(display, `XP for next level: ${player.xpNext()}`, x, 4);
        this.draw(display, `Power: ${player.power}`, x, 5);
        this.draw(display, `Defense: ${player.defense}`, x, 6);
    }

    draw(display, text, x, y) {
        for (let j=0; j<text.length; j++) {
            display.drawOver(x+1+j, y, text[j], 'white', null);
        }
    }

    mouse(player, inputData) { }

    dispatch(player, inputData) {
        return toMain(player.engine()); 
    }
}
