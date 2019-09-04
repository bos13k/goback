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
function fillBackground(upmode) {
    let ctx = getContext();
    ctx.beginPath();
    if (upmode) {
        ctx.rect(0, HALF_HEIGHT - 1, canvas.width, HALF_HEIGHT + 1);
    } else {
        ctx.rect(0, 0, canvas.width, HALF_HEIGHT + 1);
    }
    ctx.fillStyle = DARK_COLOR;
    ctx.fill();
}

/**
 * BGM setup
 */
function playShort(moveType, upmode) {
    switch (moveType) {
        case "jump":
            D=upmode?[13,12,10]:[13,12,15]
            break;
        case "flip":
            D=upmode?[10,15]:[15,10]
            break;
        default:
            D = [];
    }
    with(new AudioContext)
    with(G=createGain())
    for(i in D)
    with(createOscillator())
    if(D[i])
    connect(G),
    G.connect(destination),
    start(i*.1),
    frequency.setValueAtTime(440*1.06**(13-D[i]),i*.1),
    gain.setValueAtTime(1,i*.1),
    gain.setTargetAtTime(.0001,i*.1+.08,.005),
    stop(i*.1+.09)
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
        playShort("jump", upmode);
        grounded = false;
        player.dy = -10;
        player.ddy = 0.5;
    }
    // jump down
    if (!upmode && grounded && e.code == "ArrowDown") {
        playShort("jump", upmode);
        grounded = false;
        player.dy = 10;
        player.ddy = -0.5;
    }
    // go backside
    if (grounded && e.code == "Space") {
        playShort("flip", upmode);
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
        fillBackground(upmode);
        player.render();
    }
});

loop.start();