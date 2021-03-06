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

export class GameMap {

    constructor(width, height, player) {
        this.width = width;
        this.height = height;
        this.map = new ROT.Map.Digger(width, height);       
        this.tiles = Array.from(Array(width), () => new Array(height));
        this.map.create((x, y, value) => {
            this.tiles[x][y] = new Tile((value === 0)?floor:wall);
        });
        this.player = player;
        player.moveTo(this.randomPosition());
        this.entities = [player];
        this.factory = new EntityFactory();
        this.placeEntities(2, this.factory);  
        this.entities.sort(compareEntityRenderOrder); 
        this.fov = new ROT.FOV.PreciseShadowcasting((x, y) => { 
            return new Location(x, y, this).isTransparent();
        }, { topology: 8 });
    }

    placeEntities(maxPerRoom, factory) {
        var monsters = {
            orc: 4,
            healthPotion: 1,
            lightningScroll: 1,
            confusionScroll: 1,
            fireballScroll: 1,
            troll: 1
        }
        this.map.getRooms().forEach(r => {
            for (let i=this.randInt(0, maxPerRoom-1); i>=0; i--) {
                let location = this.randomRoomPosition(r);
                if (location.blockingEntity()==null) {
                    this.add(factory.get(ROT.RNG.getWeightedValue(monsters)), location, false);
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