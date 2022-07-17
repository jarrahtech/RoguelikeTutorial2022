"use strict";

export class Engine {
    constructor(gameMap, eventHandler, display) {
        this.gameMap = gameMap;       
        this.eventHandler = eventHandler;
        this.display = display;
    }

    handleInput(inputType, inputData) {
        const action = this.eventHandler.dispatch(inputType, inputData);
        action.perform(this, this.gameMap.player);
        this.handleEntitiesTurn();
        this.render();
    }

    render() {
        this.display.clear();
        this.gameMap.render(this.display);
    }

    handleEntitiesTurn() {
        this.gameMap.entities.forEach(e => {
            //console.log(`${e.name} looks forward to taking a turn`);
        });
    }
}