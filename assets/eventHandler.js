"use strict";

import { NullAction, BumpAction, WaitAction, ShowMessageHistoryAction } from "./actions.js";
import { Location } from "./map.js";
import { conf } from "./game.js"

export class NoEventHandler {
    dispatch(player, inputData) {
        return new Action();
    }

    mouse(player, inputData) {
        const [x, y] = player.engine().display.eventToPosition(inputData);
        const mouseLoc = new Location(x, y, player.location.map);
        if (mouseLoc.isVisible()) {
            const line = ROT.Util.capitalize(mouseLoc.entities().map(e => e.name).join(", "));
            player.engine().info(line)
        }
    }
}

export class MainEventHandler extends NoEventHandler {

    moveKeys = new Map([
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
    waitKeys = new Set([
        ROT.KEYS.VK_PERIOD,
        ROT.KEYS.VK_INSERT,
        ROT.KEYS.VK_KEYPAD0
    ]);

    dispatch(player, inputData) {
        if (this.moveKeys.has(inputData.keyCode)) {
            return new BumpAction(player, this.moveKeys.get(inputData.keyCode));
        } else if (this.waitKeys.has(inputData.keyCode)) {
            return new WaitAction();
        } else if (inputData.keyCode===ROT.KEYS.VK_V) {         
            let history = new HistoryViewerEventHandler(player.engine().messages, 
                                    conf.messageHistoryBorder, conf.messageHistoryBorder, 
                                    conf.width - conf.messageHistoryBorder*2, 
                                    conf.height - conf.messageHistoryBorder*2);
            player.engine().eventHandler = history;
            return history.createAction(player); 
        }       
        return new NullAction(); 
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

    dispatch(player, inputData, initial = false) {
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