// shorthand for $(document).ready(...)
$(function() {
    var socket = io();

   socket.emit('username_req');

    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat', function(msg){
        updateScroll();
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('user_list_update', function(users){
        $('#messages').append($('<li>').text("USERS[0]: " + users[0]));
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