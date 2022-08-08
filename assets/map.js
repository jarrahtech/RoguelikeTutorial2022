"use strict";

import { EntityFactory } from './entity.js';
import { inLight } from './color.js';

export class Location {
    constructor(x, y, map) {
        this.x = x;
        this.y = y;
        this.map = map;
    }

    delta(dx, dy) {
        return new Location(this.x+dx, this.y+dy, this.map);
    }

    shift(x, y) {
        return new Location(x, y, this.map);
    }

    inBounds() {
        return 0<=this.x && this.x<this.map.width && 0<=this.y && this.y<this.map.height;
    }

    isVisible() {
        return this.inBounds() && this.map.tileAt(this).visible>0;
    }

    isTransparent() {
        return this.inBounds() && this.map.tileAt(this).type.transparent;
    }

    isWalkable() {
        return this.inBounds() && this.map.tileAt(this).type.walkable;
    }

    isDownstairs() {
        return this.inBounds() && this.map.tileAt(this).type === downstairs;
    }

    isUpstairs() {
        return this.inBounds() && this.map.tileAt(this).type === upstairs;
    }

    clampToBounds() {
        if (this.inBounds()) {
            return this;
        } else {          
            return new Location(
                        Math.max(0, Math.min(this.x, this.map.width - 1)), 
                        Math.max(0, Math.min(this.y, this.map.height - 1)),
                        this.map);
        }
    }

    entities() {
        let result = [];
        for (let entity of this.map.entities) {
            if (entity.location.equiv(this)) {
                result.push(entity);
            }
        }
        return result;
    }

    blockingEntity() {
        for (let entity of this.map.entities) {
            if (entity.blocker && entity.location.equiv(this)) {
                return entity;
            }
        }
        return null;
    }

    items() {
        let result = [];
        for (let entity of this.map.entities) {
            if (entity.isItem() && entity.location.equiv(this)) {
                result.push(entity);
            }
        }
        return result;
    }

    equiv(other) {
        return this.x===other.x && this.y===other.y;
    }

    distance(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.max(Math.abs(dx), Math.abs(dy));  // Chebyshev distance.
    }

    deltaTo(other) {
        return [other.x-this.x, other.y-this.y];
    }
}

export class TileDisplay {
    constructor(glyph, fg, bg) {
        this.glyph = glyph;
        this.fg = fg;
        this.bg = bg;
    }

    render(display, x, y, v=1) {
        display.draw(x, y, this.glyph, this.fg, this.bg);
    }
}

export class TileType {
    constructor(visible, seen, unseen, walkable, transparent) {
        this.visible = visible;
        this.seen = seen;
        this.unseen = unseen;
        this.walkable = walkable;
        this.transparent = transparent;
    }

    render(display, visible, seen, x, y) {
        if (visible>0) {
            this.visible.render(display, x, y, visible);
        } else if (seen) {
            this.seen.render(display, x, y);
        } else {
            this.unseen.render(display, x, y);
        }
    }  
}

const floor = new TileType(new TileDisplay(" ", 'black', inLight), new TileDisplay(" ", 'black', '#777777aa'), new TileDisplay(" ", 'black', 'black'), true, true)
const wall = new TileType(new TileDisplay(" ", 'black', '#cccccc'), new TileDisplay(" ", 'black', '#cccccc'), new TileDisplay(" ", 'black', 'black'), false, false);
const downstairs = new TileType(new TileDisplay(">", 'white', inLight), new TileDisplay(">", '#cccccc', '#777777aa'), new TileDisplay(" ", 'black', 'black'), true, true)
const upstairs = new TileType(new TileDisplay("<", 'white', inLight), new TileDisplay("<", '#cccccc', '#777777aa'), new TileDisplay(" ", 'black', 'black'), true, true)

export class Tile {
    constructor(type) {
        this.visible = 0.0;
        this.seen = false;
        this.type = type;
    }

    clearVisibility() {
        this.visible = 0.0;
    }

    setVisible(v) {
        this.visible = v;
        this.seen = true;
    }

    render(display, x, y) {
        this.type.render(display, this.visible, this.seen, x, y);
    }

    bgColor(color) {
        return bgColor(color, this.visible);
    }

}

let compareEntityRenderOrder = function(a, b) {
    return a.renderOrder - b.renderOrder;
}

let entitiesPerRoom = [
    [0,2],
    [3,3],
    [5,5]
]

let itemsPerFloor = [
    [0,1],
    [4,2]
]

let monsters = [
    [0, {orc: 4, troll: 1}],
    [1, {orc: 3, troll: 1}],
    [3, {orc: 2, troll: 4, giant: 1}],
    [5, {troll: 2, giant: 1}],
    [7, {troll: 1, giant: 1, dragon: 1}],
    [9, {dragon: 1, giant: 2}]
]

let items = [
    [0, {healthPotion: 2}, {confusionScroll: 1}],
    [3, {healthPotion: 2}, {confusionScroll: 1}, {lightningScroll: 1}],
    [5, {healthPotion: 1}, {confusionScroll: 1}, {lightningScroll: 1}, {fireballScroll: 1}],
]

export class GameMap {

    constructor(level, width, height, player) {
        this.level = level;
        this.width = width;
        this.height = height;
        this.map = new ROT.Map.Digger(width, height);       
        this.tiles = Array.from(Array(width), () => new Array(height));
        this.map.create((x, y, value) => {
            this.tiles[x][y] = new Tile((value === 0)?floor:wall);
        });       
        this.player = player;
        player.moveTo(this.randomPosition());
        this.downPosition = player.location;
        while (this.downPosition === player.location) {
            this.downPosition = this.randomPosition();
        }
        this.tiles[this.downPosition.x][this.downPosition.y] = new Tile(downstairs);
        if (level>0) {
            this.upPosition = player.location;
            this.tiles[this.upPosition.x][this.upPosition.y] = new Tile(upstairs);
        }
        this.entities = [player];
        this.factory = new EntityFactory();
        this.placeEntities(this.maxForFloor(entitiesPerRoom), this.maxForFloor(monsters));  
        this.placeEntities(this.maxForFloor(itemsPerFloor), this.maxForFloor(items));
        this.entities.sort(compareEntityRenderOrder); 
        this.fov = new ROT.FOV.PreciseShadowcasting((x, y) => { 
            return new Location(x, y, this).isTransparent();
        }, { topology: 8 });
    }

    maxForFloor(floorMap) {       
        let result = 0;
        for (let [min, val] of floorMap) {
            if (min > this.level) {
                break
            } else {
                result = val
            }
        }
        return result
    }

    placeEntities(maxPerRoom, entities) {
        this.map.getRooms().forEach(r => {
            for (let i=this.randInt(0, maxPerRoom); i>0; i--) {
                let location = this.randomRoomPosition(r);
                if (location.blockingEntity()==null) {
                    this.add(this.factory.get(ROT.RNG.getWeightedValue(entities)), location, false);
                }
            }
        });
    }

    remove(entity) {
        let idx = this.entities.indexOf(entity);
        this.entities.splice(idx, 1);
    }

    add(entity, location, sort = true) {
        this.entities.push(entity);
        entity.moveTo(location);
        if (sort) {
            this.entities.sort(compareEntityRenderOrder); 
        }
        return entity;
    }

    corpsify(entity) {
        this.remove(entity);
        this.add(this.factory.get("corpse"), entity.location).name += entity.name;
    }

    tileAt(location) {
        return this.tiles[location.x][location.y];
    }

    clearFov() {
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                this.tiles[x][y].clearVisibility();
            }
        }
    }

    updateFov(entity) {
        this.clearFov();
        this.fov.compute(entity.location.x, entity.location.y, 8, function(x,y,r,v) {
            this.tiles[x][y].setVisible(v);
        }.bind(this));
    }

    render(display) {
        this.updateFov(this.player);
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                this.tiles[x][y].render(display, x, y);
            }
        }
        this.entities.forEach((e, i) => e.render(display));
    }

    randomPosition() {
        const rooms = this.map.getRooms();
        return this.randomRoomPosition(rooms[this.randInt(0, rooms.length-1)]);
    }

    randomRoomPosition(room) {
        return new Location(this.randInt(room.getLeft(), room.getRight()), this.randInt(room.getTop(), room.getBottom()), this);
    }

    randInt(min, max) {
        return Math.floor(ROT.RNG.getUniform() * (max - min + 1) + min);
    }
}