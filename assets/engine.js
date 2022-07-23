"use strict";

import { errorColor, impossibleColor } from "./color.js";
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
                this.messages.addMessage(err.message, impossibleColor)
            } else {
                this.messages.addMessage(err.message, errorColor)
            }
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