"use strict";

import * as color from "./color.js";
import { MainEventHandler } from "./eventHandler.js";
import { ImpossibleException } from "./exceptions.js";

export class Engine {
    constructor(player, gameMap, eventHandler, display, hpBar, messages, info) {
        this.player = player;
        this.gameMap = gameMap;  
        this.gameMap.engine = this;     
        this.eventHandler = eventHandler;
        this.display = display;
        this.hpBar = hpBar;
        this.messages = messages;
        this.infoLine = info;
    }

    handleInput(inputType, inputData) {
        try {
            inputData.preventDefault();
            switch (inputType) {
                case 'keydown': const action = this.eventHandler.dispatch(this.player, inputData);
                                if (action.perform()) {
                                    this.handleEntitiesTurn();
                                    this.render();
                                }
                                break;
                case 'mousemove': this.eventHandler.mouse(this.player, inputData); break;
                default: break;
            }
        } catch (err) {
            if (err instanceof ImpossibleException) {
                this.messages.addMessage(err.message, color.impossible)
            } else {
                this.messages.addMessage(err.message, color.error)
                console.log(err);
            }
            this.messages.clear(this.display);
            this.messages.render(this.display);
        }
    }

    info(line) {
        this.infoLine.show(this.display, line);
    }

    render() {
        this.display.clear();
        this.gameMap.render(this.display);
        this.hpBar.render(this.display, this.player.currHp);
        this.messages.render(this.display);
    }

    handleEntitiesTurn() {
        this.gameMap.entities.forEach(e => {
            try {
                if (e.act) e.act();
            } catch (err) {
                if (err instanceof ImpossibleException) {
                    // ignore it
                }
            }
        });
    }
}