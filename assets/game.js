import { Entity } from './entity.js';
import { EventHandler } from './eventHandler.js';

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
        "@": [0, 10]
    },
    width: 80,
    height: 60
}

var Game =  {
    display: null,
    player: new Entity(options.width/2, options.height/2, '@', 'white', 'black'),
    eventHandler: new EventHandler(),

    init: function() {
        this.display = new ROT.Display(options);

        var game = this; 
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                game.handleInput(event, e);
            });
        }
        bindEventToScreen('keydown');
        bindEventToScreen('keyup');
        bindEventToScreen('keypress');

        this.player.display(this.display);
    },
    handleInput: function(inputType, inputData) {
        var action = this.eventHandler.dispatch(inputType, inputData);
        action.perform(null, this.player);
        
        this.display.clear();
        this.player.display(this.display);
    }
}

window.onload = function() {
    Game.init();
    document.body.appendChild(Game.display.getContainer());
};