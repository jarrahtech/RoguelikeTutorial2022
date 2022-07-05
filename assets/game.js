import { Entity } from './entity.js';
import { EventHandler } from './eventHandler.js';
import { Engine } from './engine.js';
import { GameMap } from './map.js';

var tileSet = document.createElement("img");
tileSet.src = "assets/img/tileset10x10.png";

var options = {
    layout: "tile",
    bg: "black",
    tileWidth: 10,
    tileHeight: 10,
    tileSet: tileSet,
    tileMap: {
        " ": [0, 0],
        "a": [0, 40],
        "@": [0, 10]
    },
    width: 80,
    height: 60
}

window.onload = function() {
    var display = new ROT.Display(options);
    var map = new GameMap();
    var eventHandler = new EventHandler();
    var player = new Entity(options.width/2, options.height/2, '@', 'white', 'black');
    var engine = new Engine(map, player, [new Entity(20, 20, 'a', 'white', 'black')], eventHandler, display);

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