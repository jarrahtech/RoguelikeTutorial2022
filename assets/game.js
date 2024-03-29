"use strict";

import { MainEventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { EntityFactory } from './entity.js';
import { HpBar } from "./renderUtil.js";
import { MessageLog, InfoLine } from './messages.js';
import { welcome } from './color.js';

export const conf = {
    width: 60,
    uiHeight: 10,
    dungeonHeight: 40,
    forceSquareRatio: true,
    fontSize: 16,
    messageHistoryBorder: 1,

    init() { this.height = this.dungeonHeight + this.uiHeight }
}

window.onload = function() {
    conf.init();   
    let display = new ROT.Display(conf);

    let factory = new EntityFactory()
    let player = new EntityFactory().get("player");
    let dagger = factory.get("dagger");
    player.pickup(dagger)
    dagger.equip(player);
    let leathers = factory.get("leatherArmor");
    player.pickup(leathers)
    leathers.equip(player);

    let eventHandler = new MainEventHandler();
    let hpBar = new HpBar(conf.width/4, conf.dungeonHeight+3, conf.width/2);
    let messages = new MessageLog(2, conf.dungeonHeight+5, conf.width-4, conf.uiHeight-5);
    let engine = new Engine(player, eventHandler, display, hpBar, messages, new InfoLine(0, conf.dungeonHeight, conf.width), new InfoLine(0, conf.dungeonHeight+2, conf.width));

    engine.messages.addMessage("Hello and welcome, adventurer, to yet another dungeon!", welcome);
    

    let bindEventToScreen = function(event) {
        window.addEventListener(event, function(e) {
            engine.handleInput(event, e);
        });
    }
    bindEventToScreen('keydown');
    bindEventToScreen('mousemove');

    document.body.appendChild(display.getContainer());

    display.drawBox = function(x, y, width, height, title, clear=true, fg='grey', titleColor='white', clearColor='black') {
        for (let i=0; i<width; i++) {
            this.draw(x+i, y, " ", null, fg);
            this.draw(x+i, y+height-1, " ", null, fg);
        }
        for (let i=1; i<height-1; i++) {
            this.draw(x, y+i, " ", null, fg);
            this.draw(x+width-1, y+i, " ", null, fg);
            if (clear) {
                for (let j=1; j<width-1; j++) {
                    this.draw(x+j, y+i, " ", null, clearColor);
                }
            }
        }
        for (let i=0; i<title.length; i++) {
            this.drawOver(x+2+i, y, title[i], titleColor, null);
        }
    }

    engine.render();
};