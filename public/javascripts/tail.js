
$(function() {

  var socket = io.connect('/tail');

  socket.on('log', function (data) {
    console.log(data);

    $('div#stream').append(data.msg);

    //socket.emit('my other event', { my: 'data' });
  });

});



