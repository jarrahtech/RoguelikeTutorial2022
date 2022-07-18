"use strict";

import { Action, BumpAction, WaitAction } from "./actions.js";

export class EventHandler {

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

    dispatch(player, inputType, inputData) {
        inputData.preventDefault();
        if (inputType === 'keydown') { 
            if (this.moveKeys.has(inputData.keyCode)) {
                return new BumpAction(player, this.moveKeys.get(inputData.keyCode));
            } else if (this.waitKeys.has(inputData.keyCode)) {
                return new WaitAction();
            }        
        } 
        return new Action(); 
    }  
}