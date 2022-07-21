"use strict";

import { MainEventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { GameMap } from './map.js';
import { EntityFactory } from './entity.js';
import { HpBar } from "./renderUtil.js";
import { MessageLog, InfoLine } from './messages.js';
import { welcomeColor } from './color.js';

export const conf = {
    width: 60,
    uiHeight: 10,
    dungeonHeight: 40,
    forceSquareRatio: true,
    fontSize: 16,
    messageHistoryBorder: 2,

    init() { this.height = this.dungeonHeight + this.uiHeight }
}

window.onload = function() {
    conf.init();
    let display = new ROT.Display(conf);
    let player = new EntityFactory().get("player");
    let map = new GameMap(conf.width, conf.dungeonHeight, player);
    let eventHandler = new MainEventHandler();
    let hpBar = new HpBar(conf.width/4, conf.dungeonHeight+3, conf.width/2, player.maxHp);
    let messages = new MessageLog(2, conf.dungeonHeight+5, conf.width-4, conf.uiHeight-5);
    let engine = new Engine(player, map, eventHandler, display, hpBar, messages, new InfoLine(0, conf.dungeonHeight, conf.width));

    engine.messages.addMessage("Hello and welcome, adventurer, to yet another dungeon!", welcomeColor);

    let bindEventToScreen = function(event) {
        window.addEventListener(event, function(e) {
            engine.handleInput(event, e);
        });
    }
    bindEventToScreen('keydown');
    bindEventToScreen('mousemove');

    document.body.appendChild(display.getContainer());

    engine.render();
};