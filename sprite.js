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

/**
 * A rock-hard animating sprite class.
 */
  
function AnimatingSprite(resource) {
  var that = this;

  // The containing Image HTMLElement
  this.image_ = new Image();
  $(this.image_).load(function() {
    that.setState('idle');
  }).attr('src', resource)
}

AnimatingSprite.states = {
 'idle': [0],
 'pain': [1],
 'punch_l': [2, 0],
 'punch_r': [3, 0],
 'block': [4],
 'throw': [5],
 'thrown': [7, 8, 9, 10, 10, 0, 0, 0],
}
AnimatingSprite.FRAME_TIME = 150;  // milliseconds spent on each frame

AnimatingSprite.prototype.drawAt = function(dest_context, x, y, flip_x) {
  dest_context.save();
  coords = this.getFrameSpriteCoords_();
  var flip_factor = (flip_x) ? -1 : 1;

  dest_context.translate(x - (flip_factor*48), y + 96);
  dest_context.scale(flip_factor, -1);
  dest_context.drawImage(this.image_,
                         coords.x, coords.y, 96, 96,
                         0, 0, 96, 96);
  dest_context.restore();
};

AnimatingSprite.prototype.setState = function(state) {
  if (AnimatingSprite.states[state] === undefined) {
    return;
  }
  this.currentStateString_ = state;
  this.currentState_ = AnimatingSprite.states[state];
  this.stateStartTime_ = new Date().getTime();
};

AnimatingSprite.prototype.getStateFrameNum_ = function() {
  var now = new Date().getTime();
  var elapsed = now - this.stateStartTime_;
  var frameNum = elapsed / AnimatingSprite.FRAME_TIME;
  frameNum = frameNum % this.currentState_.length;
  return parseInt(frameNum);
};

AnimatingSprite.prototype.getFrameSpriteCoords_ = function() {
  if (this.currentStateString_ == 'punch_l') {
    //debugger;
  }
  var spriteIndex = this.currentState_[this.getStateFrameNum_()];
  var x = parseInt(spriteIndex % 4) * 96;
  var y = parseInt(spriteIndex / 4) * 96;
  return {x: x, y: y};
}
