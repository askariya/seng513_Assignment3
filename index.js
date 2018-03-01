var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = []; // a list of current users
var message_history = [200];

http.listen( port, function () {
    console.log('listening on port', port);
});

//TODO change the use of socket.nickname and socket.color to use cookies instead
app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){

    socket.on('publish_cookies', function(cookies){
        console.log(cookies);
    });

    socket.on('nickname_req', function(cookie_uname, cookie_color){ 

        //if there are no cookies (new user)
        if (cookie_uname != "" && cookie_color != ""){
            socket.nickname = cookie_uname;
            socket.color = cookie_color;
        }

        //if there are cookies (returning user)
        else{
            socket.nickname = generate_nickname();
            socket.color = generate_colour();
            socket.emit('assign_cookie', socket.nickname, socket.color);
        }
        // emits to everyone but the connecting user
        socket.broadcast.emit('display_msg', socket.nickname+ " connected");
        //emits back to only the same user
        socket.emit('display_msg', "You are " + socket.nickname);
        io.emit('user_list_update',  Object(users));
});

    socket.on('nick_change_request', function(nick){
        //check that the nickname isn't already in use.
        if(users.indexOf(nick) == -1){
            // assign the new nickname to this user
            users[users.indexOf(socket.nickname)] = nick;
            socket.nickname = nick; 
            socket.emit('display_msg', "Your nickname is now: " + socket.nickname);
            //update the user list
            io.emit('user_list_update', Object(users));
        }
        else{
            socket.emit('display_msg', "Request Failed: Nickname already in use. " + socket.nickname);
        }
    });

    socket.on('nick_color_change_request', function(nick_color){
        socket.color = nick_color;
        socket.emit('display_msg', "Your nickname is now " + "this color.".fontcolor(nick_color));
    });

    socket.on('chat', function(msg){
        var timestamp = generate_timestamp();
        socket.broadcast.emit('chat', msg, socket.nickname, socket.color, timestamp, false);
        socket.emit('chat', msg, socket.nickname, socket.color, timestamp, true);
    });

    socket.on('display_msg', function(msg){
        socket.emit('display_msg', msg);
    });
 
    socket.on('disconnect', function(){
        //TODO maybe set socket nickname to undefined???
        io.emit('display_msg', socket.nickname + ' disconnected');
        //remove user from list
        users.splice(users.indexOf(socket.nickname), 1);
    });
});

/** 
 * Generates a random nickname
*/
function generate_nickname(){
    var valid_un = false;
    var new_nickname = null;
    while(!valid_un){
        var rug = require('random-username-generator');
        new_nickname = rug.generate();
        // if username doesn't exist
        if(users.indexOf(new_nickname) == -1){
            valid_un = true;
            // add new nickname to the list
            users.push(new_nickname);
        }
    }
    return new_nickname;
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


//TODO store/update chat history