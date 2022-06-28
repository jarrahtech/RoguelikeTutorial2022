var tileSet = document.createElement("img");
tileSet.src = "assets/img/tileset10x10.png";

var options = {
    layout: "tile",
    bg: "black",
    tileWidth: 64,
    tileHeight: 64,
    tileSet: tileSet,
    tileMap: {
        "@": [0, 0],
        "#": [0, 10],
        "a": [10, 0],
        "!": [10, 10]
    },
    width: 80,
    height: 24
}

var Game =  {
    _display: null,
    _currentScreen: null, 
    init: function() {
        // Any necessary initialization will go here.
        this._display = new ROT.Display(options);
        // Create a helper function for binding to an event
        // and making it send it to the screen
        var game = this; // So that we don't lose this
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the
                // screen if there is one
                if (game._currentScreen !== null) {
                    // Send the event type and data to the screen
                    game._currentScreen.handleInput(event, e);
                }
            });
        }
        // Bind keyboard input events
        bindEventToScreen('keydown');
        bindEventToScreen('keyup');
        bindEventToScreen('keypress');
    },
    getDisplay: function() {
        return this._display;
    },
    switchScreen: function(screen) {
        // If we had a screen before, notify it that we exited
        if (this._currentScreen !== null) {
            this._currentScreen.exit();
        }
        // Clear the display
        this.getDisplay().clear();
        // Update our current screen, notify it we entered
        // and then render it
        this._currentScreen = screen;
        if (!this._currentScreen !== null) {
            this._currentScreen.enter();
            this._currentScreen.render(this._display);
        }
    }
}

window.onload = function() {
    Game.init();
    document.body.appendChild(Game.getDisplay().getContainer());
    Game.switchScreen(Game.Screen.startScreen);
}