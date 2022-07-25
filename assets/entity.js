"use strict";

import { inLightColor, playerAtkColor, enemyAtkColor, playerDieColor, enemyDieColor, healthRecoveredColor } from './color.js';
import { MoveAction, MeleeAction } from './actions.js';
import { NoEventHandler } from './eventHandler.js';
import { ImpossibleException } from './exceptions.js';

const RenderOrder = {
    CORPSE: 1,
    ITEM: 2,
    ACTOR: 3
};
Object.freeze(RenderOrder);

class Entity {

    constructor({name="Error", glyph="?", fg, bg, renderOrder, blocker=false}) {
        this.glyph = glyph
        this.fg = fg
        this.bg = bg
        this.name = name
        this.renderOrder = renderOrder
        this.blocker = blocker
    }

    engine() {
        return this.location.map.engine;
    }

    moveTo(destination) {
        this.location = destination;
    }

    isItem() {
        return this.renderOrder===RenderOrder.ITEM;
    }

    render(display) {
        if (this.location.isVisible()) {
            display.draw(this.location.x, this.location.y, this.glyph, this.fg, this.bg);
        }
    }

    distance(entity) {
        return this.location.distance(entity.location);
    }
}

export class EntityFactory {

    entitiesConfig = {
        player: {
            name: "Player",
            glyph: "@",
            fg: 'white',
            bg: inLightColor,
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 30;
                    this.defense = 2;
                    this.power = 5;
                }],
                [EntityComponents.Inventory, function() {
                    this.capacity = 26;
                }]
            ]
        }, 
        corpse: {
            name: "Remains of ",
            glyph: "%",
            fg: 'red',
            bg: inLightColor,
            renderOrder: RenderOrder.CORPSE,
            blocker: false,
            components: []
        }, 
        orc: {
            name: "Orc",
            glyph: "o",
            fg: 'white',
            bg: inLightColor,
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
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
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 16;
                    this.defense = 1;
                    this.power = 4;
                }]
            ]
        },
        healthPotion: {
            name: "Health Potion",
            glyph: "!",
            fg: "#8000ff",
            blocker: false,
            bg: inLightColor,
            renderOrder: RenderOrder.ITEM,
            components: [[EntityComponents.HealingConsumable]]
        },
        lightningScroll: {
            name: "Lightning Scroll",
            glyph: "~",
            fg: "#ffff00",
            blocker: false,
            bg: inLightColor,
            renderOrder: RenderOrder.ITEM,
            components: [[EntityComponents.LightningConsumable]]
        }
    };

    get(name) {
        let conf = this.entitiesConfig[name];
        let entity = new Entity(conf);
        for (let [component, initFn] of conf.components) {
            Object.assign(entity, component);
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
            let color = this.engine().player===this?playerAtkColor:enemyAtkColor;
            let desc = `${this.name} attacks the ${target.name}`;
            if (damage>0) {
                this.engine().messages.addMessage(`${desc} for ${damage} hit points`, color);
                target.hp(target.currHp-damage);
            } else {
                this.engine().messages.addMessage(`${desc} but does no damage`, color);
            }
        },
        heal(amount) {
            let oldHp = this.currHp;
            this.hp(this.currHp+amount);
            return this.currHp-oldHp;
        },
        hp(value) {
            this.currHp = Math.max(0, Math.min(value, this.maxHp));
            if (this.currHp<=0) {
                this.die();
            } 
        },
        die() {
            if (this===this.location.map.player) {
                this.engine().messages.addMessage("You died", playerDieColor);
                this.engine().eventHandler = new NoEventHandler();
            } else {
                this.engine().messages.addMessage(`${this.name} dies`, enemyDieColor);
            }
            this.location.map.corpsify(this);
        }
    },
    HealingConsumable: {
        amount: 4,
        activate(action) {
            let recovered = action.entity.heal(this.amount)
            if (recovered > 0) {
                this.engine().messages.addMessage(`You consume the ${this.name}, and recover ${recovered} HP!`, healthRecoveredColor );
                action.entity.items.splice(action.entity.items.indexOf(this), 1);
            } else {
                throw new ImpossibleException("Your health is already full.")
            }           
        }
    },
    LightningConsumable: {
        damage: 20,
        maxRange: 5,
        activate(action) {
            let target = undefined
            let closest = this.maxRange + 1;

            for (let e of action.entity.location.map.entities) {
                if (e!==action.entity && e.location.isVisible() && e.blocker) {
                    let dist = action.entity.distance(e);
                    if (dist<closest) {
                        target=e;
                        closest=dist;
                    }
                }
            }

            if (target) {
                this.engine().messages.addMessage(`A lighting bolt strikes the ${target.name}, for ${this.damage} damage!`)
                target.hp(target.currHp-this.damage);
                action.entity.items.splice(action.entity.items.indexOf(this), 1);
            } else {
                throw new ImpossibleException("No enemy is close enough to strike.")
            }
        }
    },
    Inventory: {
        capacity: 0,
        items: [],
        drop(item) {
            this.items.splice(this.items.indexOf(item), 1);
            item.location.map.add(item, this.location);
            this.engine().messages.addMessage(`You dropped the ${item.name}.`);
        },
        pickup(item) {
            if (this.items.length+1<this.capacity) {
                this.location.map.remove(item);
                this.items.push(item);
                this.engine().messages.addMessage(`You pickup the ${item.name}.`);
            } else {
                throw new ImpossibleException("You are carrying too much already!")
            }          
        }
    }
};

