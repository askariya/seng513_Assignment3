var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var current_users = []; // a list of current users
var msg_history = [];
var msg_history_capacity = 200;

http.listen( port, function () {
    console.log('listening on port', port);
});

//TODO change the use of socket.nickname and socket.color to use cookies instead
app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
    /**
     * Handles assigning username and getting message history
     */
    socket.on('initialize', function(cookie_uname, cookie_color){ 
  
        //if there are cookies (returning user)
        if (cookie_uname != "" && cookie_color != ""){
            socket.color = cookie_color;
            //add to list of current users -- if successful...
            if(add_to_users(cookie_uname)){
                socket.nickname = cookie_uname;
                msg_history_req(socket);
                socket.emit('display_msg', "Welcome back, " + socket.nickname.fontcolor(socket.color) + ".");
            }
            // if the username was stolen
            else{
                socket.nickname = generate_nickname();
                msg_history_req(socket);
                socket.emit('display_msg', "Your previous username is in use.\n" + 
                "Your new username is: " + socket.nickname.fontcolor(socket.color));
                socket.emit('assign_cookie', socket.nickname, socket.color);
            }
        }

        //if there are no cookies (new user)
        else{
            socket.nickname = generate_nickname();
            socket.color = generate_colour();
            msg_history_req(socket);
            socket.emit('assign_cookie', socket.nickname, socket.color);
            socket.emit('display_msg', "You are " + socket.nickname.fontcolor(socket.color));
        }
        // emits to everyone but the connecting user
        socket.broadcast.emit('display_msg', socket.nickname.fontcolor(socket.color) + " connected");
        //emits back to only the same user
        io.emit('user_list_update',  Object(current_users));
});

    socket.on('nick_change_request', function(nick_msg){
        var nick = nick_msg.substring(6).trim();
        // if nickname is empty, ignore
        if(nick == ""){
            socket.emit('display_msg', "Request Failed: Invalid Nickname");
        }
        else{
            //check that the nickname isn't already in use.
            if(current_users.indexOf(nick) == -1){
                // assign the new nickname to this user
                current_users[current_users.indexOf(socket.nickname)] = nick;
                socket.nickname = nick; 
                socket.emit('assign_cookie', socket.nickname, socket.color);
                socket.emit('display_msg', "Your nickname is now: " + socket.nickname);
                //update the user list
                io.emit('user_list_update', Object(current_users));
            }
            else{
                socket.emit('display_msg', "Request Failed: Nickname already in use. ");
            }
        }
    });

    socket.on('nick_color_change_request', function(nick_color_msg){
        var nick_color = "#" + nick_color_msg.substring(11).trim();
        //Code for checking valid color from: 
        //https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
        var is_valid_color  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(nick_color);
        //if the colour is valid, assign the color to the nickname
        if(is_valid_color){
            socket.color = nick_color;
            socket.emit('assign_cookie', socket.nickname, socket.color);
            socket.emit('display_msg', "Your nickname is now " + "this color.".fontcolor(nick_color));
        }
        // if the colour is invalid, send an error message 
        else{
            socket.emit('display_msg', "Request Failed: Invalid Color");
        }
    });

    socket.on('chat', function(msg){
        var timestamp = generate_timestamp();
        var separator = '\xa0\xa0\xa0\xa0\xa0';
        final_msg = timestamp + separator + socket.nickname.toString().fontcolor(socket.color) + ": \xa0\xa0" + msg;
        socket.broadcast.emit('chat', final_msg);
        socket.emit('chat', final_msg.bold());
        // msg_history.push(final_msg);
        add_to_msg_history(final_msg);
    });
 
    socket.on('disconnect', function(){
        if (socket.nickname != undefined){
            io.emit('display_msg', socket.nickname.fontcolor(socket.color) + ' disconnected');
            //remove user from list
            current_users.splice(current_users.indexOf(socket.nickname), 1);
            io.emit('user_list_update', Object(current_users));
            //DEBUG: console.log(msg_history.toString());
        }
    });
});


// function send_chat(msg){
//     io.emit('chat', msg); 
//     msg_history.push(msg);
// }

// function send_chat_to_user(msg){
//     socket.emit('chat', msg);
// }

// function send_display_msg(msg){
//     io.emit('chat', msg.italics());
// }

function add_to_msg_history(msg){
    //if the msg_history array is at capacity
    if(msg_history.length == msg_history_capacity){
        //remove first element
        msg_history.shift();
    }
    //add new msg to end of array
    msg_history.push(msg);
}


function msg_history_req(socket){
    for(var msg in msg_history){
        var separator = '\xa0\xa0\xa0\xa0\xa0';
        var nickname = (msg_history[msg].split(separator)[1]).split(":")[0];
        // if the message is from the current user, bold it before sending
        if (nickname == socket.nickname.fontcolor(socket.color)){
            socket.emit('chat', msg_history[msg].bold());
        }
        else{
            socket.emit('chat', msg_history[msg]);
        }
    }
}

/** 
 * Generates a random nickname
*/
function generate_nickname(){
    var valid_un = false;
    var new_nickname = null;
    while(true){
        var rug = require('random-username-generator');
        new_nickname = rug.generate();
        // if username successfully added
        if(add_to_users(new_nickname)){
            break;
        }
    }
    return new_nickname;
}

/**
 * Adds username to list of current users
 * Returns: true if successful, false otherwise
 */
function add_to_users(nickname){
    // if nickname doesn't exist
    if(current_users.indexOf(nickname) == -1){
        // add new nickname to the list and return true
        current_users.push(nickname);
        return true;
    }
    else{
        return false;
    }
}

/* Colour generator from:
https://stackoverflow.com/questions/1484506/random-color-generator
*/
function generate_colour(){
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generate_timestamp(){
    var dt = new Date();
    return dt.toLocaleTimeString(); //calculate timestamp and format
}
