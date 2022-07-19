"use strict";

import { inLightColor } from './map.js';
import { MoveAction, MeleeAction } from './actions.js';

class Entity {

    constructor({name="Error", glyph="?", fg, bg, blocker=false}) {
        this.glyph = glyph
        this.fg = fg
        this.bg = bg
        this.name = name
        this.blocker = blocker
    }

    moveTo(destination) {
        this.location = destination;
    }

    render(display) {
        if (this.location.isVisible()) {
            display.draw(this.location.x, this.location.y, this.glyph, this.fg, this.bg);
        }
    }
}

export class EntityFactory {

    entitiesConfig = {
        player: {
            name: "Player",
            glyph: "@",
            fg: 'white',
            bg: inLightColor,
            blocker: true,
            mixins: [
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 30;
                    this.defense = 2;
                    this.power = 5;
                }]
            ]
        }, 
        corpse: {
            name: "Remains of ",
            glyph: "%",
            fg: 'red',
            bg: inLightColor,
            blocker: false,
            mixins: []
        }, 
        orc: {
            name: "Orc",
            glyph: "o",
            fg: 'white',
            bg: inLightColor,
            blocker: true,
            mixins: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 10;
                    this.defense = 0;
                    this.power = 3;
                }]
            ]
        }, 
        troll: {
            name: "Troll",
            glyph: "T",
            fg: 'white',
            bg: inLightColor,
            blocker: true,
            mixins: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 16;
                    this.defense = 1;
                    this.power = 4;
                }]
            ]
        }
    };

    get(name) {
        let conf = this.entitiesConfig[name];
        let entity = new Entity(conf);
        for (let [mixin, initFn] of conf.mixins) {
            Object.assign(entity, mixin);
            if (initFn) {
                (initFn.bind(entity))();
            }
        }
        return entity;
    }
}

const EntityComponents = {
    HostileEnemy: {
        stepsPerTurn: 1,
        act() { 
            if (this.location.isVisible()) {
                let playerLoc = this.location.map.player.location;
                if (this.location.distance(playerLoc)<=1) {
                    new MeleeAction(this, this.location.deltaTo(playerLoc)).perform();
                } else {
                    let dijkstra = new ROT.Path.Dijkstra(playerLoc.x, playerLoc.y, function(x, y) {
                        return playerLoc.map.tiles[x][y].type.walkable;
                    }.bind(this));
                    let steps = this.stepsPerTurn;
                    let result = [];
                    dijkstra.compute(this.location.x, this.location.y, function(x, y) {
                        if (steps===0) {
                            result = [x-this.location.x, y-this.location.y]
                        } 
                        steps--;
                    }.bind(this));
                    new MoveAction(this, result).perform();
                }
            }
        }
    },
    Fighter: {
        maxHp: 0,
        currHp: 0,
        defense: 0,
        power: 0,
        attack(target) {
            let damage = this.power - target.defense;
            let desc = `${this.name} attacks the ${target.name}`;
            if (damage>0) {
                alert(`${desc} for ${damage} hit points`);
                target.hp(target.currHp-damage);
            } else {
                alert(`${desc} but does no damage`);
            }
        },
        hp(value) {
            this.currHp = Math.max(0, Math.min(value, this.maxHp));
            if (this.currHp<=0) {
                this.die();
            } 
        },
        die() {
            alert(`${this.name} dies`);
            this.location.map.corpsify(this);
        }
    }
};

