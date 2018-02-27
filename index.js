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

    socket.on('username_req', function(){ 
        socket.username = generate_username();
        // emits to everyone but the connecting user
        socket.broadcast.emit('chat', socket.username + " connected");
        //emits back to only the same user
        socket.emit('chat', "You are " + socket.username);
        io.emit('user_list_update',  Object(users));
    });

    socket.on('chat', function(msg){
        var separator = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
        var timestamp = generate_timestamp();
        final_msg = timestamp + separator + msg;
        //console.log(socket.username);
	    io.emit('chat', final_msg);
    });

    socket.on('disconnect', function(){
        //TODO maybe set socket username to undefined???
        io.emit('chat', socket.username + ' disconnected');
        //remove user from list
        users.splice(users.indexOf(socket.username), 1);
    });
});

/** 
 * Generates a random username
*/
function generate_username(){
    var valid_un = false;
    var new_username = null;
    while(!valid_un){
        var rug = require('random-username-generator');
        new_username = rug.generate();
        if(!(new_username in users)){
            valid_un = true;
            users.push(new_username);
        }
    }
    return new_username;
}

function generate_timestamp(){
    var dt = new Date();
    return dt.toLocaleTimeString(); //calculate timestamp and format
}

//TODO store/update chat history