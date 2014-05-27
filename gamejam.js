/*
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0
     
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var STATE_BEFORE_START = 'before start';
var STATE_PLAYING = 'playing';
var STATE_GAME_OVER = 'game over';

var INITIAL_PLAYER_SEPARATION = 200;

// Key codes
var KEY_SPACE=32;
var KEY_W=87;
var KEY_A=65;
var KEY_S=83;
var KEY_D=68;
var KEY_X=88;
var KEY_R=82;
var KEY_ESC=27;
var KEY_O=79;
var KEY_T=84;
var KEY_P=80;
var KEY_COMMA=188;
var KEY_PERIOD=190;
var KEY_LEFT=37;
var KEY_RIGHT=39;
var KEY_UP=38;
var KEY_DOWN=40;

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

var JUMP_TIME_MS = 800;  // jump time in milliseconds
var JUMP_HEIGHT = 100;  // in pixels

function resetGameState() {
  level = new Level();
  win.reset();
  var player_offset = win.width/2 - INITIAL_PLAYER_SEPARATION;
  player1 = new Player(player_offset, 'character.png', true);
  player2 = new Player(win.right() - player_offset, 'character_2.png', false);
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
  if (keys.isPressed(KEY_R)) {
    player1.punch();
  }
  if (keys.isPressed(KEY_T)) {
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
      //alert("Game Over. Reset...");
      game_state = STATE_GAME_OVER;
      win.gameOver();
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
    if (event.which == KEY_P) {
      DEBUG=!DEBUG;
      $('#debug').text('');
    }
    if (event.which == KEY_O) {
      win.should_scroll = !win.should_scroll;
    }
    //if (event.which == KEY_X) {  // Suicide, for testing "game over"
    //  player1.health = -1;
    //}
    if (event.which == KEY_ESC) { // Stop the game (helpful when developing)
      clearInterval(interval);
    }
  });
  
  $(document).keyup(function(event) {
    keys.up(event.which);
  });

  interval = setInterval(update, 30);
});
