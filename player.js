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

function Player(x, sprite_sheet, facing_right) {
  this.x = x;
  this.dx = 0;
  this.y = level.getHeightAtPoint(x);
  this.dy = 0;
  this.health = 100;
  this.sprite = new AnimatingSprite(sprite_sheet);

  this.facing_right = facing_right;

  this.other_player = null;
  this.jumped = false;
    
  this.MAX_SPEED = .3;
  this.DX_ACCEL = .05;
  this.DX_DECAY = .02;
  this.PUNCH_TIME = 250;
  this.BLOCK_TIME = 250;
  this.PAIN_TIME = 200;
  this.THROW_TIME = 600;
  this.PUNCH_RANGE = 70;
  this.PUNCH_DAMAGE = 5;
  this.THROW_DAMAGE = 7;
  this.THROW_RANGE = 70;
  this.HIT_MOVE_DISTANCE = 5;
  this.THROWN_SPEED = -.5;
  this.THROWN_TIME = 600;

  this.moveLeft = function() {
    if (this.action != ACTION_IDLE) {
      return;
    }
    // Prevent movement up the landscape
    var nextHeight = level.getHeightAtPoint(this.x - (SPRITE_HALF_WIDTH - 18));
    if (nextHeight > this.y) {
      this.dx = 0;
      return;
    }
    this.dx -= this.DX_ACCEL;
    if (this.dx < -this.MAX_SPEED) {
      this.dx = -this.MAX_SPEED;
    }
  }
  this.moveRight = function() {
    if (this.action != ACTION_IDLE) {
      return;
    }
    // Prevent movement up the landscape.
    var nextHeight = level.getHeightAtPoint(this.x + (SPRITE_HALF_WIDTH - 18));
    if (nextHeight > this.y) {
      this.dx = 0;
      return;
    }
    this.dx += this.DX_ACCEL;
    if (this.dx > this.MAX_SPEED) {
      this.dx = this.MAX_SPEED;
    }
  }
  this.jump = function() {
    // Do not allow a new jump if one is already in progress.
    if (this.jumped) {
      return;
    }
    this.dy = 0.4;  // set some initial upwards velocity
    this.jumped = true;
  }
  this.setAction = function(newAction) {
    this.action = newAction;
    if (newAction == ACTION_PUNCH) {
      var spriteState = (this.facing_right) ? 'punch_l' : 'punch_r';
    } else if (newAction == ACTION_BLOCK) {
      var spriteState = 'block';
    } else if (newAction == ACTION_PAIN) {
      var spriteState = 'pain';
    } else if (newAction == ACTION_THROW) {
      var spriteState = 'throw';
    } else if (newAction == ACTION_THROWN) {
      var spriteState = 'thrown';
    } else {
      var spriteState = 'idle';
    }
    this.sprite.setState(spriteState);
  }
  
  this.punch = function() {
    if (this.action != ACTION_IDLE) {
      return;
    }
    this.setAction(ACTION_PUNCH);
    this.action_timer = this.PUNCH_TIME;
    this.dx = 0;

    if (this.distanceTo(this.other_player) < this.PUNCH_RANGE) {
      this.other_player.hit(this.PUNCH_DAMAGE);
    }
  }

  this.throw_em = function() { // "throw" is a reserved word
    if (this.action != ACTION_IDLE) {
      return;
    }
    this.setAction(ACTION_THROW);
    this.action_timer = this.THROW_TIME;
    this.dx = 0;

    if (this.distanceTo(this.other_player) < this.THROW_RANGE) {
      this.other_player.thrown(this.THROW_DAMAGE);
    }
  }

  this.thrown = function(damage) {
    this.health -= damage;
    this.setAction(ACTION_THROWN);
    this.action_timer = this.THROWN_TIME;
    if (this.facing_right) {
      this.dx = -this.THROWN_SPEED; 
    } else {
      this.dx = this.THROWN_SPEED; 
    }
  }

  this.hit = function(damage) {
    this.dx = 0;
    if (this.isBlocking) {
      this.setAction(ACTION_BLOCK);
      this.action_timer = this.BLOCK_TIME;
      // BUG Player isn't looking the right way now
    } else {
      this.health -= damage;
      this.setAction(ACTION_PAIN);
      this.action_timer = this.PAIN_TIME;
      if (this.facing_right) {  // BUG: not right if player is walking away
        this.x -= this.HIT_MOVE_DISTANCE; 
      } else {
        this.x += this.HIT_MOVE_DISTANCE; 
      }
    }
  }

  this.distanceTo = function(other) {
    return Math.abs(this.x - other.x);
  }

  this.update = function(dt) { 
    // Compute the desired vertical position of the character by moving one
    // time step along the velocity vector in the vertical axis.
    var newY = this.y + this.dy * dt;
    this.dy -= 0.03;

    this.x += this.dx * dt;
    if (Math.abs(this.dx) < this.DX_DECAY) {
      this.dx = 0;
    } else if (this.dx > 0) {
      this.dx -= this.DX_DECAY;
    } else if (this.dx < 0) {
      this.dx += this.DX_DECAY;
    }

    // If the desired position intersects with the landscape then stop the jump.
    var newHeight = level.getHeightAtPoint(this.x);
    if (newY < newHeight) {
      newY = newHeight;
      this.jumped = false;
      this.dy = 0;
    }
    this.y = newY;
    
    if (this.action_timer > 0) {
      this.action_timer -= dt;

      if (this.action_timer <= 0) {
        this.action_timer = 0;
        this.setAction(ACTION_IDLE);
      }
    }

    this.facing_right = (this.x < this.other_player.x);
  }

  this.isAlive = function() {
    return this.health >= 0;
  }

  this.block = function(should_block) {
    this.isBlocking = should_block;
  }
  
  this.action_timer = 0;
  this.setAction(ACTION_IDLE);
}


