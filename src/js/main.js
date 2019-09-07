let {init, getContext, Sprite, Pool, GameLoop} = kontra;
let {canvas, context} = init();

/**
 * Game params
 */
let dpi = window.devicePixelRatio;
// canvas.width = document.body.clientWidth;
// canvas.height = document.body.clientHeight;
canvas.setAttribute('width', getComputedStyle(canvas).getPropertyValue('width').slice(0, -2) * dpi);
canvas.setAttribute('height', getComputedStyle(canvas).getPropertyValue('height').slice(0, -2) * dpi);
let ctx = getContext();
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
let HALF_WIDTH = canvas.width / 2;
let HALF_HEIGHT = canvas.height / 2;
let DARK_COLOR = '#333333';
let LIGHT_COLOR = '#ffffff';
let PLAYER_FRAME1 = 'img/player1.png';
let PLAYER_FRAME2 = 'img/player2.png';
let isUpMode = true;
let grounded = true;
// let hasSecondJump = true;


let GRID = 20;
let PLAYER_HEIGHT = 120;
let PLAYER_WIDTH = 60;
let INIT_BLOCK_SPEED = -10;
let BLOCK_SPEED = INIT_BLOCK_SPEED;
let BLOCK_WIDTH = canvas.width / GRID;

/**
 * Background setup
 */
function fillBackground(upmode) {
    ctx.beginPath();
    if (upmode) {
        ctx.rect(0, HALF_HEIGHT, canvas.width, HALF_HEIGHT);
    } else {
        ctx.rect(0, 0, canvas.width, HALF_HEIGHT);
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
            D = upmode ? [13, 12, 10] : [13, 12, 15]
            break;
        case "flip":
            D = upmode ? [10, 15] : [15, 10]
            break;
        default:
            D = [];
    }
    with (new AudioContext)
        with (G = createGain())
            for (i in D)
                with (createOscillator())
                    if (D[i])
                        connect(G),
                            G.connect(destination),
                            start(i * .1),
                            frequency.setValueAtTime(440 * 1.06 ** (13 - D[i]), i * .1),
                            gain.setValueAtTime(1, i * .1),
                            gain.setTargetAtTime(.0001, i * .1 + .08, .005),
                            stop(i * .1 + .09)
}

/**
 * Player setup
 */
var player = Sprite({
    x: HALF_WIDTH,
    y: HALF_HEIGHT,
    anchor: {x: 0.5, y: 1},
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    rotation: 0,
    animCount: 0,
    hasSecondJump: false,
    checkPos: function () {
        if (
            (isUpMode && player.y > HALF_HEIGHT) ||
            (!isUpMode && player.y < HALF_HEIGHT)) {
            player.y = HALF_HEIGHT;
            player.dy = 0;
            player.ddy = 0;
            grounded = true;
        }
    }
});

let playerImg = new Image();
playerImg.src = PLAYER_FRAME1;
playerImg.onload = function () {
    player.image = playerImg;
};

// Animation
let walk = function () {
    if (player.animCount === 30) {
        playerImg.src = PLAYER_FRAME2;
    }
    if (player.animCount === 60) {
        playerImg.src = PLAYER_FRAME1;
        player.animCount = 0;
    }
    player.animCount += 1;
};

// Controls
window.addEventListener("keydown", function (e) {
    // jump up
    // if (isUpMode && grounded && e.code === "ArrowUp") {
    //     playShort("jump", isUpMode);
    //     grounded = false;
    //     player.dy = -40;
    //     player.ddy = 2;
    // }
    if (e.code === "ArrowUp") {
        if (isUpMode && grounded) {
            playShort("jump", isUpMode);
            grounded = false;
            player.dy = -40;
            player.ddy = 2;
            player.hasSecondJump = true;
        }
        else if (isUpMode && !grounded && player.hasSecondJump) {
            playShort("jump", isUpMode);
            player.dy = -20;
            player.ddy = 2;
            player.hasSecondJump = false;
        }
    }
    // jump down
    if (!isUpMode && grounded && e.code === "ArrowDown") {
        playShort("jump", isUpMode);
        grounded = false;
        player.dy = 40;
        player.ddy = -2;
    }
    // go backside
    if (grounded && e.code === "Space") {
        playShort("flip", isUpMode);
        isUpMode = !isUpMode;
        player.rotation = Math.PI - player.rotation;
    }
    // restart
    if (e.code === "Space" && loop.isStopped) {
        loop.start();
    }
});


/**
 * Block Pool
 */
let block_pool = Pool({
    create: Sprite,
    maxSize: 32,
});

function update_block() {
    this.dx = BLOCK_SPEED;
    if (isUpMode) {
        this.color = this.isUpper ? DARK_COLOR : LIGHT_COLOR;
    } else {
        this.color = this.isUpper ? LIGHT_COLOR : DARK_COLOR;
    }
    check_collision(this, isUpMode);

    this.advance();
}

function generate_block(isUpper, height, speed) {

    block_pool.get({
        x: canvas.width,
        y: canvas.height / 2,
        anchor: isUpper ? {x: 0.5, y: 1} : {x: 0.5, y: 0},
        color: isUpper ? DARK_COLOR : LIGHT_COLOR,
        width: BLOCK_WIDTH,
        height: PLAYER_HEIGHT * height,
        dx: speed,
        ttl: canvas.width / Math.abs(speed),
        isUpper: isUpper,
        update: update_block,
    });
}

function get_random_block() {
    let block_num = Math.floor(Math.random() * 2) + 1;

    if (block_num === 1) {
        let isUpper = Math.floor(Math.random() * 2) === 0;
        let height = Math.floor(Math.random() * 3) + 1;
        generate_block(isUpper, height, BLOCK_SPEED)
    } else if (block_num === 2) {
        let height_up = Math.floor(Math.random() * 3) + 1;
        let height_down = (height_up > 1) ? 1 : Math.floor(Math.random() * 3) + 1;
        generate_block(true, height_up, BLOCK_SPEED);
        generate_block(false, height_down, BLOCK_SPEED);
    }
}

function check_collision(block, isUpMode) {
    // if (isUpMode && block.anchor.y === 1) {
    //     // if (block.x - BLOCK_WIDTH / 2 <= player.x + PLAYER_WIDTH / 2 && block.x + BLOCK_WIDTH / 2 >= player.x - PLAYER_WIDTH / 2 && player.y <= HALF_HEIGHT + block.height) {
    //     //     loop.stop();
    //     // }
    //     // if (player.x + PLAYER_WIDTH / 2 >= block.x - BLOCK_WIDTH / 2 && player.x - PLAYER_WIDTH / 2 <= block.x + BLOCK_WIDTH / 2 && player.y <= HALF_HEIGHT + block.height) {
    //     //     alert('player y: '+player.y + ' block h: ' + (HALF_HEIGHT + block.height));
    //     //     loop.stop();
    //     // }
    //     if (player.collidesWith(block)) {
    //         loop.stop();
    //     }
    // }
    if (player.collidesWith(block)) {
        loop.stop()
    }

}

/**
 * Game loop
 */
let frame_count = 0;

let loop = GameLoop({
    update: function () {
        let speed_ratio = BLOCK_SPEED / INIT_BLOCK_SPEED;
        if (frame_count <= 0) {
            if (BLOCK_SPEED > -40) {
                BLOCK_SPEED -= 0.5;
            }
            get_random_block();
            frame_count = 80 / speed_ratio;
        }
        block_pool.update();

        walk();
        player.update();
        player.checkPos();

        frame_count--;
    },
    render: function () {
        fillBackground(isUpMode);
        block_pool.render();
        player.render();
    }
});

loop.start();