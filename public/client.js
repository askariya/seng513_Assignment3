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

    socket.on('chat', function(msg, nickname, nick_color, timestamp, is_self){
        var separator = '\xa0\xa0\xa0\xa0\xa0';
        final_msg = timestamp + separator + nickname.fontcolor(nick_color) + ": \xa0\xa0" + msg;
        //if the message is from this user, bold the message
        if(is_self)
            final_msg = final_msg.bold();
        $('#messages').append($('<li>').html(final_msg));
        updateScroll();
    });

    socket.on('display_msg', function(msg){
        $('#messages').append($('<li>').html(msg));
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
            socket.emit('display_msg', "Request Failed: Invalid Nickname");
        }
        else{
            socket.emit('nick_change_request', nickname);
        }
    }

    //what to do upon nickname color change request
    else if(msg.startsWith("/nickcolor ")){
        var nick_color = msg.substring(11).trim();
        //Code for checking valid color from: 
        //https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
        var is_valid_color  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test("#" + nick_color);
        if(is_valid_color){
            socket.emit('nick_color_change_request', "#" + nick_color);
        }
        else{
            socket.emit('display_msg', "Request Failed: Invalid Color");
        }
    }

    else{
        //standard chat message
        socket.emit('chat', msg);
    }
}


function check_colour(){
    
}