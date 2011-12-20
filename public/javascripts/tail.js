
$(function() {

  var socket = io.connect('/tail');

  socket.on('log', function (data) {
    //console.log(data);

    var el = $("<div></div>");
    el.addClass(data.type);
    el.html('<span class="log-name">' + data.log + '</span><span class="msg">' + data.msg + '</span>' + '<br/>');
    $('div#stream').append(el);

    //socket.emit('my other event', { my: 'data' });
  });

});



