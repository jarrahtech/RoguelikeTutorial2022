
export class Action {
    perform(engine, entity) {}
}

class ActionWithDirection extends Action {
    constructor(xDelta, yDelta) {
        super();
        this.xDelta = xDelta;
		this.yDelta = yDelta;
    }

    perform(engine, entity) { }
}

class MoveAction extends ActionWithDirection {
    perform(engine, entity) {
        var x = entity.x + this.xDelta;
        var y = entity.y + this.yDelta;

        if (engine.gameMap.inBounds(x, y) && engine.gameMap.tiles[x][y].type.walkable && engine.gameMap.blockingEntityAt(x, y)==null) {
            entity.move(this.xDelta, this.yDelta);
        }
    }
}

class MeleeAction extends ActionWithDirection {
    perform(engine, entity) {
        var x = entity.x + this.xDelta;
        var y = entity.y + this.yDelta;
        const target = engine.gameMap.blockingEntityAt(x, y);
        if (target!=null) {
            alert(`You kick the ${target.name}, much to its annoyance!`);
        }
    }
}

export class BumpAction extends ActionWithDirection {
    perform(engine, entity) {
        var x = entity.x + this.xDelta;
        var y = entity.y + this.yDelta;
        if (engine.gameMap.blockingEntityAt(x, y)==null) {
            return new MoveAction(this.xDelta, this.yDelta).perform(engine, entity)   
        } else {
            return new MeleeAction(this.xDelta, this.yDelta).perform(engine, entity)
        }
    }
}