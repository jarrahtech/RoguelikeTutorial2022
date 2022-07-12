
export class Engine {
    constructor(gameMap, player, entities, eventHandler, display) {
        this.gameMap = gameMap;
        this.player = player;
        this.entities = entities;
        this.eventHandler = eventHandler;
        this.display = display;
    }

    handleInput(inputType, inputData) {
        var action = this.eventHandler.dispatch(inputType, inputData);
        action.perform(this, this.player);
        this.render();
    }

    render() {
        this.display.clear();
        this.gameMap.updateFov(this.player);
        this.gameMap.render(this.display);
        this.player.render(this.display, this.gameMap);
        this.entities.forEach((e, i) => e.render(this.display, this.gameMap));
    }
}