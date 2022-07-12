import { EventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { GameMap } from './map.js';

var options = {
    width: 80,
    height: 60
}

window.onload = function() {
    var display = new ROT.Display(options);
    var map = new GameMap(options.width, options.height);
    var eventHandler = new EventHandler();
    var engine = new Engine(map, eventHandler, display);

    var bindEventToScreen = function(event) {
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
