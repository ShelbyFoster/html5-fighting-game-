var STATE_BEFORE_START = 'before start';
var STATE_PLAYING = 'playing';
var STATE_GAME_OVER = 'game over';

var INITIAL_PLAYER_SEPARATION = 200;


// Key codes

//Player Control Keys
var KEY_W=87; //Jump
var KEY_A=65; //Left
var KEY_D=68; //Right
var KEY_E=69; //Punch
var KEY_SPACE =32; //Throw

//AI Control Keys
var KEY_COMMA=188;  //AI Punch
var KEY_PERIOD=190;  //AI Throw
var KEY_LEFT=37;  //AI Left
var KEY_RIGHT=39;  //AI Right
var KEY_UP=38; //AI Jump

var ACTION_IDLE = 'idle';
var ACTION_PAIN = 'pain';
var ACTION_PUNCH = 'punch';
var ACTION_BLOCK = 'block';
var ACTION_THROW = 'throw';
var ACTION_THROWN = 'thrown';
var DEBUG = false;

var PIT_DAMAGE = .1;

var win; // The window (I'd call it window but that's a reserved word)
var keys;
var player1;
var player2;
var interval;
var level;
var lastTimeStamp = 0;


function resetGameState() {
    level = new Level();
    win.reset();
    var player_offset = win.width/2 - INITIAL_PLAYER_SEPARATION; //(100)
    player1 = new Player(player_offset, 'images/character.png', true);
    player2 = new Player(win.right() - player_offset, 'images/viking-2.png', false);
    player1.other_player = player2;
    player2.other_player = player1;
    keys = new KeyWatcher();
    lastTimeStamp = 0;
    game_state = STATE_BEFORE_START;
    setTimeout(startRound, 1000);
}

function startRound() {
    game_state = STATE_PLAYING;
    win.startGame();
}

function handleInput() {
    if (keys.isPressed(KEY_SPACE)) {
        player1.punch();
    }
    if (keys.isPressed(KEY_E)) {
        player1.throw_em();
    }
    player1.block(false);
    if (keys.isPressed(KEY_A)) {
        player1.moveLeft();
        player1.block(player1.facing_right);
    }
    if (keys.isPressed(KEY_D)) {
        player1.moveRight();
        player1.block(!player1.facing_right);
    }

    if (keys.isPressed(KEY_COMMA)) {
        player2.punch();
    }
    if (keys.isPressed(KEY_PERIOD)) {
        player2.throw_em();
    }
    player2.block(false);
    if (keys.isPressed(KEY_LEFT)) {
        player2.moveLeft();
        player2.block(player2.facing_right);
    }
    if (keys.isPressed(KEY_RIGHT)) {
        player2.moveRight();
        player2.block(!player2.facing_right);
    }
}

function update() {
    var now = new Date().getTime();
    if (lastTimeStamp == 0) {
        var dt = 0;
    } else {
        dt = now - lastTimeStamp;
    }
    lastTimeStamp = now;

    if (game_state == STATE_PLAYING) {
        handleInput();
        player1.update(dt);
        player2.update(dt);

        if (player1.y < -100) {
            player1.health -= dt * PIT_DAMAGE;
        }

        if (player2.y < -100) {
            player2.health -= dt * PIT_DAMAGE;
        }

        if (!player1.isAlive() || !player2.isAlive()) {
            if(player1.isAlive()) {
                console.log('player2 - dead')
                player1.sprite.setState('idle')
                player2.sprite.setState('dead');
            }
            else{
                console.log('player1 - dead');
                player1.sprite.setState('dead')
                player2.sprite.setState('idle')
            }
            //alert("Game Over. Reset...");
            game_state = STATE_GAME_OVER;
            win.gameOver();
            console.log('game over');
            setTimeout(resetGameState, 2000);
        }
    }

    win.update(dt);
    win.draw();

    if (DEBUG) {
        $('#debug').html('Debug:<br>Key: ' + keys.lastKey);
    }
}

function KeyWatcher() {
    this.keys = {}
    this.lastKey = undefined;

    this.down = function(key) {
        this.keys[key] = true;
        this.lastKey = key;
    }

    this.up = function(key) {
        this.keys[key] = false;
    }

    this.isPressed = function(key) {
        return this.keys[key];
    }
}

$(document).ready(function() {
    win = new Window(800, 600);
    resetGameState();

    $(document).keydown(function(event) {
        // What a horrible hack, only allow the players to when the key is pressed
        // down and ignore hold down jump keys.
        if (event.which == KEY_W && !keys.isPressed(KEY_W)) {
            player1.jump();
        }
        if (event.which == KEY_UP && !keys.isPressed(KEY_UP)) {
            player2.jump();
        }

        keys.down(event.which);

    });

    $(document).keyup(function(event) {
        keys.up(event.which);
    });

    interval = setInterval(update, 30);
});
