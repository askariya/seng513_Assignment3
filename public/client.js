// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    
    // TODO UNCOMMENT   
    socket.emit('nickname_req');

   /*WHat happens when a msg is sent*/
    $('form').submit(function(){
        parse_msg($('#m').val(), socket);
        $('#m').val('');
        return false;
    });

    socket.on('chat', function(msg, nickname, nick_colour, timestamp){
        var separator = '\xa0\xa0\xa0\xa0\xa0';
        final_msg = timestamp + separator + nickname + ": \xa0\xa0" + msg;
        $('#messages').append($('<li>').html(timestamp + separator + nickname.fontcolor(nick_colour) + ": \xa0\xa0" + msg));
        updateScroll();
    });

    socket.on('display_msg', function(msg){
        $('#messages').append($('<li>').text(msg));
        updateScroll();
    });

    socket.on('user_list_update', function(users){
        update_user_list(users);
    });

});


function updateScroll(){
    var element = document.getElementById("msg-display");
    element.scrollTop = element.scrollHeight;
}

function update_user_list(users){
    document.getElementById('users').innerHTML = "";
    for(var user in users){
        $('#users').append($('<li>').text(users[user]));
    }
}

/*
Function to parse the input from the form and decide what 
type of message to send to the server
*/
function parse_msg(msg, socket){

    // what to do upon nickname change request
    if(msg.startsWith("/nick ")){
        var nickname = msg.substring(6).trim();
        if(nickname == ""){
            socket.emit('chat', "Request Failed: Invalid Nickname");
        }
        else{
            socket.emit('nick_change_request', nickname);
            // socket.username = nickname;
        }
    }

    //what to do upon nickname color change request
    else if(msg.startsWith("/nickcolor ")){
        socket.emit('chat', "DEVELOPMENT: You requested to change nickname colour");
    }

    else{
        //standard chat message
        socket.emit('chat', $('#m').val());
    }
}
