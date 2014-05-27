/**
 * Created by Shelb on 20/05/14.
 */
$(function() {


    var check = function(){
        if(player1.distanceTo(player2) > 50 && !player2.facing_right){   //Chasing Left
            setTimeout(check, 50);
            player2.moveLeft();
            console.log(player2.facing_right)
        }
        else if (player1.distanceTo(player2) > 50 && player2.facing_right) { //Chasing Right
            setTimeout(check, 50); // check again in a second
            player2.moveRight();
            console.log('else', player2.facing_right)
        }
        else {          //If player within distance punch
            setTimeout(check, 50);
            player2.punch();
        }
    }

    check();


});
