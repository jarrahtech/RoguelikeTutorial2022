"use strict";

export class Engine {
    constructor(player, gameMap, eventHandler, display) {
        this.player = player;
        this.gameMap = gameMap;  
        this.gameMap.engine = this;     
        this.eventHandler = eventHandler;
        this.display = display;
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
    }

    handleEntitiesTurn() {
        this.gameMap.entities.forEach(e => {
            if (e.act) e.act();
        });
    }
}