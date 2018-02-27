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

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
    //console.log("connected");

    socket.on('nickname_req', function(){ 
        socket.nickname = generate_nickname();
        // emits to everyone but the connecting user
        socket.broadcast.emit('chat', socket.nickname + " connected");
        //emits back to only the same user
        socket.emit('chat', "You are " + socket.nickname);
        io.emit('user_list_update',  Object(users));
    });

    socket.on('nick_change_request', function(nick){
        socket.emit('chat', "DEVELOPMENT: You requested to change nickname");
        console.log(users.toString());
        //check that the nickname isn't already in use.
        if(users.indexOf(nick) == -1){
            // assign the new nickname to this user
            users[users.indexOf(socket.nickname)] = nick;
            socket.nickname = nick; 
            socket.emit('chat', "Your nickname is now: " + socket.nickname);
            //update the user list
            io.emit('user_list_update',  Object(users));
        }
        else{
            socket.emit('chat', "Request Failed: Nickname already in use. " + socket.nickname);
        }
    });

    socket.on('chat', function(msg){
        var separator = '\xa0\xa0\xa0\xa0\xa0';
        var timestamp = generate_timestamp();
        final_msg = timestamp + separator + socket.nickname + ": \xa0\xa0" + msg;;
	    io.emit('chat', final_msg);
    });
 
    socket.on('disconnect', function(){
        //TODO maybe set socket nickname to undefined???
        io.emit('chat', socket.nickname + ' disconnected');
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

function generate_timestamp(){
    var dt = new Date();
    return dt.toLocaleTimeString(); //calculate timestamp and format
}

//TODO store/update chat history