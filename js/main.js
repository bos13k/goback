let {init, Sprite, Pool, GameLoop} = kontra;
let {canvas} = init();

canvas.width = 800;
canvas.height = 600;
canvas.backgroundColor = '#F5F5F5';

let DARK_COLOR = '#333333';
let LIGHT_COLOR = '#ffffff';
let GREY = '#9E9E9E';

let GRID = 16;
let PLAYER_HEIGHT = canvas.height / 8;
let DEFAULT_BLOCK_SPEED = 1;

/**
 * player setup
 */
let player = Sprite({
    x: canvas.width / 2,
    y: canvas.height / 2,
    anchor: {x: 0.5, y: 1},
    // width: 20,
    width: canvas.width / GRID,
    height: PLAYER_HEIGHT,
    color: DARK_COLOR,

});

let block = Sprite({
    x: canvas.width,
    y: canvas.height / 2,
    color: GREY,
    width: canvas.width / GRID,
    height: PLAYER_HEIGHT + Math.floor(Math.random() * 3),
    dx: -1,
});

let base = Sprite({
    y: canvas.height / 2,
    color: GREY,
    width: canvas.width,
    height: 5
});


let block_pool = Pool({
    create: Sprite,
    maxSize: 32,
    // fill: true
});


function generate_block(isUpper, height, speed) {
    speed = -Math.abs(speed);

    block_pool.get({
        x: canvas.width,
        y: canvas.height / 2,
        anchor: isUpper ? {x: 0.5, y: 1} : {x: 0.5, y: 0},
        color: GREY,
        width: canvas.width / GRID,
        height: PLAYER_HEIGHT * height,
        dx: speed,
        ttl: canvas.width / Math.abs(speed),
    });
}

window.addEventListener("keydown", function (e) {
    if (e.code === "ArrowUp") {
        player.ddy = 0.5;
        player.dy = -10;

        // if (player.y < canvas.height / 2 ) {
        //     player.dy = 0;
        //     // player.y = canvas.height / 2 + 2.5;
        // } else {
        //     player.dy = -10;
        // }

    }
});


function get_ramdom_block() {
    let block_num = Math.floor(Math.random() * 2) + 1;

    if (block_num === 1) {
        let isUpper = Math.floor(Math.random() * 2) === 0;
        let height = Math.floor(Math.random() * 3) + 1;
        let speed = (Math.random() * 2 + 0.5) * DEFAULT_BLOCK_SPEED;
        generate_block(isUpper, height, speed)
    }
    else if (block_num === 2) {
        let height_up = Math.floor(Math.random() * 3) + 1;
        let speed_up = (Math.random() * 2 + 0.5) * DEFAULT_BLOCK_SPEED;
        let height_down = (height_up > 1) ? 1 : Math.floor(Math.random() * 3) + 1;
        let speed_down = (Math.random() * 2 + 0.5) * DEFAULT_BLOCK_SPEED;
        generate_block(true, height_up, speed_up);
        generate_block(false, height_down, speed_down);
    }
}

/**
 * Game loop
 */
let frame_count = 0;

let loop = GameLoop({
    update: function () {

        if (frame_count % 200 === 0 || frame_count === 0) {
            get_ramdom_block();
        }

        block_pool.update();
        player.update();

        frame_count++;
    },
    render: function () {
        base.render();
        block_pool.render();
        player.render();
    }
});

loop.start();
