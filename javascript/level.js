function buildLevel_() {
    var level = []
    var lengthOfLevel = 8; //8 is enough to fill canvas, make longer for longer level
    for (var i = 0; i < lengthOfLevel; i++) {
        level.push(100);
    }
    return level;
}

function Level() {
    // Heights are in pixels
    this.level = buildLevel_();
    this.BLOCK_SIZE=100;


    this.image1_ = new Image();
    $(this.image1_).attr('src', 'images/ground1.png');
    this.image2_ = new Image();
    $(this.image2_).attr('src', 'images/ground2.png');

    this.drawLevel = function(context, left_x, width) {
        for (var x = left_x; x <= left_x + width; x += this.BLOCK_SIZE) {
            var index = this.pixelToHeightIndex_(x);
            var height = this.getHeightAtPoint(x);
            context.drawImage(this.image2_, 0, 0, 100, 600,
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
