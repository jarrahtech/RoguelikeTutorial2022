"use strict";

import { inLight, statusEffectApplied, playerAtk, enemyAtk, enemyDie, healthRecovered, playerDie, needsTarget } from './color.js';
import { MoveAction, MeleeAction, BumpAction, WaitAction, NullAction } from './actions.js';
import { NoEventHandler, SingleRangedAttackHandler, AreaRangedAttackHandler } from './eventHandler.js';
import { ImpossibleException } from './exceptions.js';

const RenderOrder = {
    CORPSE: 1,
    ITEM: 2,
    ACTOR: 3
};
Object.freeze(RenderOrder);

const directions = [
    [-1, -1],  
    [0, -1], 
    [1, -1],  
    [-1, 0], 
    [1, 0], 
    [-1, 1], 
    [0, 1],  
    [1, 1] 
]

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
            bg: inLight,
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
                }],
                [EntityComponents.Level]
            ]
        }, 
        corpse: {
            name: "Remains of ",
            glyph: "%",
            fg: 'red',
            bg: inLight,
            renderOrder: RenderOrder.CORPSE,
            blocker: false,
            components: []
        }, 
        orc: {
            name: "Orc",
            glyph: "o",
            fg: 'white',
            bg: inLight,
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 10;
                    this.defense = 0;
                    this.power = 3;
                }],
                [EntityComponents.XP, function() {
                    this.xp = 35;
                }]
            ]
        }, 
        troll: {
            name: "Troll",
            glyph: "T",
            fg: 'white',
            bg: inLight,
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 16;
                    this.defense = 1;
                    this.power = 4;
                }],
                [EntityComponents.XP, function() {
                    this.xp = 100;
                }]
            ]
        },
        giant: {
            name: "Giant",
            glyph: "G",
            fg: 'white',
            bg: inLight,
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 30;
                    this.defense = 2;
                    this.power = 6;
                }],
                [EntityComponents.XP, function() {
                    this.xp = 150;
                }]
            ]
        },
        dragon: {
            name: "Dragon",
            glyph: "D",
            fg: 'white',
            bg: inLight,
            renderOrder: RenderOrder.ACTOR,
            blocker: true,
            components: [
                [EntityComponents.HostileEnemy], 
                [EntityComponents.Fighter, function() {
                    this.maxHp = this.currHp = 50;
                    this.defense = 5;
                    this.power = 15;
                }],
                [EntityComponents.XP, function() {
                    this.xp = 250;
                }]
            ]
        },
        healthPotion: {
            name: "Health Potion",
            glyph: "!",
            fg: "#8000ff",
            blocker: false,
            bg: inLight,
            renderOrder: RenderOrder.ITEM,
            components: [[EntityComponents.HealingConsumable]]
        },
        lightningScroll: {
            name: "Lightning Scroll",
            glyph: "~",
            fg: "#ffff00",
            blocker: false,
            bg: inLight,
            renderOrder: RenderOrder.ITEM,
            components: [[EntityComponents.LightningConsumable]]
        },
        confusionScroll: {
            name: "Confusion Scroll",
            glyph: "~",
            fg: "#e063ff",
            blocker: false,
            bg: inLight,
            renderOrder: RenderOrder.ITEM,
            components: [[EntityComponents.ConfusionConsumable]]
        },
        fireballScroll: {
            glyph: "~",
            fg: "#ff0000",
            name: "Fireball Scroll",
            blocker: false,
            bg: inLight,
            renderOrder: RenderOrder.ITEM,
            components: [[EntityComponents.FireballConsumable]]
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
            let color = this.engine().player===this?playerAtk:enemyAtk;
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
                this.engine().messages.addMessage("You died", playerDie);
                this.engine().eventHandler = new NoEventHandler();
            } else {
                this.engine().messages.addMessage(`${this.name} dies`, enemyDie);
                if (this.engine().player.addXP && this.xp) {
                    this.engine().player.addXP(this.xp);
                }
            }
            this.location.map.corpsify(this);
        }
    },
    HealingConsumable: {
        amount: 4,
        activate(action) {
            let recovered = action.entity.heal(this.amount)
            if (recovered > 0) {
                this.engine().messages.addMessage(`You consume the ${this.name}, and recover ${recovered} HP!`, healthRecovered);
                action.entity.remove(this);
            } else {
                throw new ImpossibleException("Your health is already full.")
            } 
            return true;      
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
                action.entity.remove(this);
                return true;
            } else {
                throw new ImpossibleException("No enemy is close enough to strike.")
            }
        }
    },
    Inventory: {
        capacity: 0,
        items: [],
        drop(item) {
            this.remove(item);
            item.location.map.add(item, this.location);
            this.engine().messages.addMessage(`You dropped the ${item.name}.`);
            return true;
        },
        remove(item) {
            this.items.splice(this.items.indexOf(item), 1);
        },
        pickup(item) {
            if (this.items.length<this.capacity) {
                this.location.map.remove(item);
                this.items.push(item);
                this.engine().messages.addMessage(`You pickup the ${item.name}.`);
            } else {
                throw new ImpossibleException("You are carrying too much already!")
            }   
            return true;    
        }
    },
    ConfusionConsumable: {
        turns: 10,
        activate(action) {
            this.action = action;
            this.engine().messages.addMessage("Select a target location.", needsTarget);
            this.engine().eventHandler = new SingleRangedAttackHandler(this.action.entity, this.confuse.bind(this));
            return false;
        },
        confuse(loc) {
            let target = loc.blockingEntity();
            if (!loc.isVisible()) {
                throw new ImpossibleException("You cannot target an area that you cannot see.")
            } else if (!target) {
                throw new ImpossibleException("You must select an enemy to target.")
            } else if (target===this.action.entity) {
                throw new ImpossibleException("You cannot confuse yourself!")
            }
            this.engine().messages.addMessage(`The ${target.name}'s eyes look empty, as it starts to stumble!`, statusEffectApplied);

            target.confusedTurns =this.turns;
            target.originalAct = target.act;
            target.act = function() {
                if (this.confusedTurns <= 0) {
                    this.engine().messages.addMessage(`The ${this.name} is no longer confused.`)
                    this.act = this.originalAct;
                    this.originalAct = undefined;
                } else {
                    let delta = directions[this.location.map.randInt(0, directions.length)];
                    this.confusedTurns -= 1
                    new BumpAction(this, delta).perform()
                }    
            }
            this.action.entity.remove(this);
            return new WaitAction();
        }
    },
    FireballConsumable: {
        damage: 12,
        radius: 3,
        activate(action) {
            this.action = action;
            this.engine().messages.addMessage("Select a target location.", needsTarget);
            this.engine().eventHandler = new AreaRangedAttackHandler(this.action.entity, this.radius, this.fireball.bind(this));
            return false;
        },
        fireball(loc) {
            if (!loc.isVisible()) {
                throw new ImpossibleException("You cannot target an area that you cannot see.")
            }
            let hit = false;
            for (let e of this.action.entity.location.map.entities) {
                if (e.blocker && e.location.distance(loc)<=this.radius) {
                    this.engine().messages.addMessage(`The ${e.name} is engulfed in fire, taking ${this.damage} damage!`);
                    e.hp(e.currHp-this.damage);
                    hit = true
                }
            }         
            if (!hit) {
                throw new ImpossibleException("There are no targets in the radius.")
            }

            this.action.entity.remove(this);
            return new WaitAction();
        }
    },
    XP: {
        xp: 5
    },
    Level: {
        currentLevel: 1,
        currentXp: 0,
        levelUpBase: 200,
        levelUpFactor: 150,
        xpNext() {
            return this.levelUpBase+this.currentLevel*this.levelUpFactor;
        },
        requiresLevelUp() {
            return this.currentXp >= this.xpNext();
        },
        addXP(xp) {
            if (xp === 0 || this.levelUpBase === 0) {
                return;
            }
            this.currentXp += xp
            this.engine().messages.addMessage(`You gain ${xp} experience points.`)

            if (this.requiresLevelUp()) {
                this.engine().messages.addMessage(`You advance to level ${this.currentLevel + 1}!`)
            }
        },
        increaseLevel() {
            this.currentXp -= this.xpNext()
            this.currentLevel += 1
        },
        increaseHp(amount = 20) {
            this.maxHp += amount
            this.currHp += amount
            this.engine().messages.addMessage("Your health improves!")
            this.increaseLevel()
        },
        increasePower(amount = 1) {
            this.power += amount
            this.engine().messages.addMessage("You feel stronger!")
            this.increaseLevel()
        },
        increaseDefense(amount = 1) {
            this.defense += amount
            this.engine().messages.addMessage("Your movements are getting swifter!")
            this.increaseLevel()
        }
    }
};
