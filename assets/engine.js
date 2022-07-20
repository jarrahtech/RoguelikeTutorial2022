"use strict";

export class Engine {
    constructor(player, gameMap, eventHandler, display, hpBar) {
        this.player = player;
        this.gameMap = gameMap;  
        this.gameMap.engine = this;     
        this.eventHandler = eventHandler;
        this.display = display;
        this.hpBar = hpBar;
    }

    handleInput(inputType, inputData) {
        const action = this.eventHandler.dispatch(this.player, inputType, inputData);
        if (action.perform()) {
            this.handleEntitiesTurn();
            this.render();
        }
    }

    render() {
        this.display.clear();
        this.gameMap.render(this.display);
        this.hpBar.render(this.display, this.player.currHp);
    }

    handleEntitiesTurn() {
        this.gameMap.entities.forEach(e => {
            if (e.act) e.act();
        });
    }
}