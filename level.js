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


function buildLevel_() {
  var level = []
  var previous_height = 0;
  var previous_was_hole = false;
  for (var i = 0; i < 5000; i++) {
    // Pick new height based on previous height
    var new_height = previous_height + parseInt((Math.random() - .5) * 3) * 25;

    // Limit heights
    new_height = Math.max(new_height, 0);
    new_height = Math.min(new_height, 400);

    previous_height = new_height;

    // Randomly put some holes in
    // (Don't put 2 holes in a row. No holes at start of level)
    if (i > 8 && !previous_was_hole && Math.random() > .8) {
      new_height = -900; 
      previous_was_hole = true;
    } else {
      previous_was_hole = false;
    }
    
    level.push(new_height);
  }
  return level;
}

function Level() {
  // Heights are in pixels
  this.level = buildLevel_();
  this.BLOCK_SIZE=100;


  this.image1_ = new Image();
  $(this.image1_).attr('src', 'ground1.png');
  this.image2_ = new Image();
  $(this.image2_).attr('src', 'ground2.png');

  this.drawLevel = function(context, left_x, width) {
    for (var x = left_x; x <= left_x + width; x += this.BLOCK_SIZE) {
      var index = this.pixelToHeightIndex_(x);
      var height = this.getHeightAtPoint(x);
      var image;
      if (index % 2) { image = this.image1_ } else { image = this.image2_};
      context.drawImage(image, 0, 0, 100, 600, 
         index * this.BLOCK_SIZE - left_x, height - 600, 100, 600);
    }
  }
  
  this.getHeightAtPoint = function(x) {
    var index = this.pixelToHeightIndex_(x);
    return this.level[index];
  }
  
  this.pixelToHeightIndex_ = function(x) {
    return parseInt(x / this.BLOCK_SIZE);
  }
}
