"use strict";

import * as color from "./color.js";
import { GameMap } from './map.js';
import { ImpossibleException } from "./exceptions.js";
import { conf } from "./game.js"

export class Engine {
    constructor(player, eventHandler, display, hpBar, messages, info, level) {
        this.player = player;
        this.gameMaps = []; 
        this.currentLevel = -1; 
        this.goDown();
        this.eventHandler = eventHandler;
        this.display = display;
        this.hpBar = hpBar;
        this.messages = messages;
        this.infoLine = info; 
        this.levelLine = level;        
    }

    gameMap() {
        return this.gameMaps[this.currentLevel];
    }

    goDown() {
        this.currentLevel++;
        if (this.gameMaps.length<=this.currentLevel) {
            let map = new GameMap(this.currentLevel, conf.width, conf.dungeonHeight, this.player);
            map.engine = this;
            this.gameMaps.push(map);
        } else {
            this.player.location = this.gameMap().upPosition;
        }
    }

    goUp() {
        this.currentLevel--;
        this.player.location = this.gameMap().downPosition;
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
        this.gameMap().render(this.display);
        this.hpBar.render(this.display, this.player.currHp);
        this.messages.render(this.display);
        this.levelLine.show(this.display, "Dungeon Level: "+this.currentLevel);
    }

    handleEntitiesTurn() {
        this.gameMap().entities.forEach(e => {
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