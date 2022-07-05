
export class Action {
  
    perform(engine, entity) {}
}

export class MoveAction extends Action {

    constructor(xDelta, yDelta) {
        super();
        this.xDelta = xDelta;
		this.yDelta = yDelta;
    }

    perform(engine, entity) {
        var x = entity.x + this.xDelta;
        var y = entity.y + this.yDelta;

        if (engine.gameMap.inBounds(x, y) && engine.gameMap.tiles[x][y].walkable) {
            entity.move(this.xDelta, this.yDelta);
        }
    }
}