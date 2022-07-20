"use strict";

import { MainEventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { GameMap } from './map.js';
import { EntityFactory } from './entity.js';
import { HpBar } from "./renderUtil.js";
import { MessageLog } from './messages.js';
import { welcomeColor } from './color.js';

const options = {
    width: 60,
    uiHeight: 7,
    dungeonHeight: 40,
    calcHeight() { this.height = this.dungeonHeight + this.uiHeight },
    forceSquareRatio: true,
    fontSize: 16
}

window.onload = function() {
    options.calcHeight();
    let display = new ROT.Display(options);
    let player = new EntityFactory().get("player");
    let map = new GameMap(options.width, options.dungeonHeight, player);
    let eventHandler = new MainEventHandler();
    let hpBar = new HpBar(options.width/4, options.dungeonHeight+1, options.width/2, player.maxHp);
    let messages = new MessageLog(2, options.dungeonHeight+2, options.width-4, options.uiHeight-2);
    let engine = new Engine(player, map, eventHandler, display, hpBar, messages);

    engine.messages.addMessage("Hello and welcome, adventurer, to yet another dungeon!", welcomeColor);

    let bindEventToScreen = function(event) {
        window.addEventListener(event, function(e) {
            engine.handleInput(event, e);
        });
    }
    bindEventToScreen('keydown');
    bindEventToScreen('keyup');
    bindEventToScreen('keypress');

    document.body.appendChild(display.getContainer());

    engine.render();
};