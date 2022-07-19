"use strict";

import { MainEventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { GameMap } from './map.js';
import { EntityFactory } from './entity.js';

const options = {
    width: 60,
    height: 40,
    forceSquareRatio: true,
    fontSize: 16
}

window.onload = function() {
    let display = new ROT.Display(options);
    let player = new EntityFactory().get("player");
    let map = new GameMap(options.width, options.height, player);
    let eventHandler = new MainEventHandler();
    let engine = new Engine(player, map, eventHandler, display);

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