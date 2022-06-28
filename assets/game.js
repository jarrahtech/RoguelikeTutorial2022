var tileSet = document.createElement("img");
tileSet.src = "assets/img/tileset10x10.png";

var options = {
    layout: "tile",
    bg: "black",
    tileWidth: 10,
    tileHeight: 10,
    tileSet: tileSet,
    tileMap: {
        "@": [0, 10]
    },
    width: 80,
    height: 60
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    move(xDelta, yDelta) {
        this.x = clamp(this.x+xDelta, 0, options.width-1)
        this.y = clamp(this.y+yDelta, 0, options.height-1)
    }

    display(display) {
        display.draw(this.x, this.y, "@", 'white', 'black');
    }
}

var Game =  {
    display: null,
    player: new Player(options.width/2, options.height/2),

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
        if (inputType === 'keydown') {
            // Movement
            if (inputData.keyCode === ROT.KEYS.VK_LEFT) {
                this.player.move(-1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT) {
                this.player.move(1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_UP) {
                this.player.move(0, -1);
            } else if (inputData.keyCode === ROT.KEYS.VK_DOWN) {
                this.player.move(0, 1);
            }
            this.display.clear();
			this.player.display(this.display);
        } 
    }
}

window.onload = function() {
    Game.init();
    document.body.appendChild(Game.display.getContainer());
};