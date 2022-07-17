"use strict";

import { EventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { GameMap } from './map.js';

const options = {
    width: 60,
    height: 40,
    forceSquareRatio: true,
    fontSize: 16
}

window.onload = function() {
    let display = new ROT.Display(options);
    let map = new GameMap(options.width, options.height);
    let eventHandler = new EventHandler();
    let engine = new Engine(map, eventHandler, display);

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
