// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    
    socket.emit('nickname_req', get_cookie("username"), get_cookie("color"));
    // DEBUGGING
    //delete_cookie("username");
    //delete_cookie("color");

   /*What happens when a msg is sent*/
    $('form').submit(function(){
        parse_msg($('#m').val(), socket);
        $('#m').val('');
        return false;
    });

    socket.on('assign_cookie', function(nickname, color){
        // set color 
        set_cookie("username", nickname, 30);
        set_cookie("color", color, 30);
        //TODO DELETE
        // socket.emit('publish_cookies', get_cookie("username"));
    });

    socket.on('chat', function(msg){
        $('#messages').append($('<li>').html(msg));
        //DEBUG: $('#messages').append($('<li>').html(get_cookie("username")));
        updateScroll();
    });

    socket.on('display_msg', function(msg){
        $('#messages').append($('<li>').html(msg.italics()));
        updateScroll();
    });

    socket.on('user_list_update', function(current_users){
        update_user_list(current_users);
    });

});


function updateScroll(){
    var element = document.getElementById("msg-display");
    element.scrollTop = element.scrollHeight;
}

function update_user_list(current_users){
    document.getElementById('users').innerHTML = "";
    for(var user in current_users){
        $('#users').append($('<li>').text(current_users[user]));
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

// Cookie set, get and delete code modified from: https://www.w3schools.com/js/js_cookies.asp
function set_cookie(name, value, secs){
    var d = new Date();
    d.setSeconds(d.getSeconds() + secs);
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

function delete_cookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

//TODO DELETE
// function read_ul(){
//     var ul = document.getElementById("messages");
//     var items = ul.getElementsByTagName("li");
//     for (var i = 0; i < items.length; ++i) {
//         socket.emit('chat', items[i]);
//     }
// }