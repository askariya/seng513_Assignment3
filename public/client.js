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
        $('#messages').append($('<li>').text(utcDate + separator + msg));
    });
});
