// inspired by http://nodetuts.com/tutorials/2-webtail-nodejs-child-processes-and-http-chunked-encoding.html#video

var //http = require('http'),
    spawn = require('child_process').spawn,
    express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
  res.render('index', {}); 
});


var logs = {
  'benbuckman': '/var/log/apache2/access.log'  /*,
  'newleafdigital': '/var/log/apache2/access-newleafdigital.log',
  'thebuckmans': '/var/log/apache2/access-thebuckmans.com',
  'stephaniegarlow': '/var/log/apache2/access-stephaniegarlow.com.log',
  'phpbakeoff': '/var/log/apache2/access-phpbakeoff.newleafdigital.com.log'
  */
};

var processPool = {};

var startProcesses = function() {
  console.log('Starting processes.');

  logs.each(function(key, path) {
    console.log('starting process ' + key + ' at ' + path);
    processPool.key = spawn('tail', ['-f', path ]);
  });
};

var killProcesses = function() {
  console.log('Killing processes.');

  processPool.each(function(key, process) {
    process.kill();
    delete processPool.key;
    console.log('killed process ' + key);
  });
};


var tail = io
  .of('/tail')
  .on('connection', function(socket) {

    startProcesses();

    tail.on('disconnect', function() {
      killProcesses();
    });

    processPool.each(function(key, process) {
      socket.emit('log', { 'log': key, 'msg': data.toString('utf-8').split("\n"), type: 'stdout' });
    });

    // todo : handle stderr too
  });


/*
app.get('/tail', function(req, res) {
  //res.writeHead(200, {
  //  'Content-Type': 'text/plain'
  //});

  res.write('Streaming...\n');

  var tail_child = spawn('tail', ['-f', '/var/log/apache2/access.log' ]);

  req.connection.on('end', function() {
    tail_child.kill();
  });

  tail_child.stdout.on('data', function(data) {
    res.write(data);
  });
});
*/

if (!module.parent) {
  app.listen(3001, 'logtail.node.benbuck.net');
  //console.log("Express server listening on port %d", app.address().port);
  //console.log(app.address());
  console.log('Started');
}
