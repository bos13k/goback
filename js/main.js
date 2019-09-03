let { init, Sprite, GameLoop } = kontra;
let { canvas } = init();

let DARK_COLOR = '#333333';
let LIGHT_COLOR = '#ffffff';

/**
 * player setup
 */
let player = Sprite({
    x: canvas.width / 2,
    y: canvas.height / 2,
    anchor: {x: 0.5, y: 1},
    width: 20,
    height: 20,
    color: DARK_COLOR
});

window.addEventListener("keydown", function(e) {
    if (e.code == "ArrowUp") {
        player.dy = -10;
        player.ddy = 0.5;
    }
});

/**
 * 
 */


/**
 * Game loop
 */
let loop = GameLoop({
    update: function() {
        player.update();
    },
    render: function() {
        player.render();
    }
});

loop.start();