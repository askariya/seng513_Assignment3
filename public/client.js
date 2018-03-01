// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    
    // TODO UNCOMMENT   
    socket.emit('nickname_req');
    // set_cookie("username", "meow", 24);
    socket.emit('publish_cookies', get_cookie("username"));

   /*WHat happens when a msg is sent*/
    $('form').submit(function(){
        parse_msg($('#m').val(), socket);
        $('#m').val('');
        return false;
    });

    socket.on('assign_cookie', function(nickname){
        set_cookie("username", nickname, 1)
    });

    socket.on('chat', function(msg, nickname, nick_color, timestamp, is_self){
        var separator = '\xa0\xa0\xa0\xa0\xa0';
        final_msg = timestamp + separator + nickname.toString().fontcolor(nick_color) + ": \xa0\xa0" + msg;
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
        //TODO add additonal checks for the nickname
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

// Cookie set and get code from: https://www.w3schools.com/js/js_cookies.asp
function set_cookie(name, value, exp_days){
    var d = new Date();
    d.setTime(d.getTime() + (exp_days*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function get_cookie(name) {
    name = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}