let { init, getContext, Sprite, GameLoop } = kontra;
let { canvas, context } = init();

/**
 * Game params
 */
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
let HALF_WIDTH = canvas.width / 2;
let HALF_HEIGHT = canvas.height / 2;
let DARK_COLOR = '#333333';
let LIGHT_COLOR = '#ffffff';
let upmode = true;
let grounded = true;

/**
 * Background setup
 */
function drawBackground() {
    let ctx = getContext();
    ctx.beginPath();
    ctx.moveTo(0, HALF_HEIGHT);
    ctx.lineTo(canvas.width, HALF_HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = DARK_COLOR;
    ctx.stroke();
}

/**
 * Player setup
 */
let player = Sprite({
    x: HALF_WIDTH,
    y: HALF_HEIGHT,
    anchor: {x: 0.5, y: 1},
    width: 20,
    height: 20,
    color: DARK_COLOR,
    checkPos: function() {
        if (
            (upmode && player.y > HALF_HEIGHT) ||
            (!upmode && player.y < HALF_HEIGHT)) {
            player.y = HALF_HEIGHT;
            player.dy = 0;
            player.ddy = 0;
            grounded = true;
        }
    }
});

window.addEventListener("keydown", function(e) {
    // jump up
    if (upmode && grounded && e.code == "ArrowUp") {
        grounded = false;
        player.dy = -10;
        player.ddy = 0.5;
    }
    // jump down
    if (!upmode && grounded && e.code == "ArrowDown") {
        grounded = false;
        player.dy = 10;
        player.ddy = -0.5;
    }
    // go backside
    if (grounded && e.code == "Space") {
        upmode = !upmode;
        player.anchor.y = 1 - player.anchor.y;
    }
});

/**
 * Game loop
 */
let loop = GameLoop({
    update: function() {
        player.update();
        player.checkPos();
    },
    render: function() {
        player.render();
        drawBackground();
    }
});

loop.start();