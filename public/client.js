// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat', function(msg){
        var dt = new Date();
        var utcDate = dt.toLocaleTimeString(); //calculate timestamp and format
        var separator = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
        updateScroll();
        $('#messages').append($('<li>').text(utcDate + separator + msg));
        //updateScroll();
    });

});


function updateScroll(){
    var element = document.getElementById("msg-display");
    element.scrollTop = element.scrollHeight;
}