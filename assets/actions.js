
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
        entity.move(this.xDelta, this.yDelta);
    }
}