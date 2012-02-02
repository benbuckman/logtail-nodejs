#!/usr/bin/env node

// log tailer for multiple files.
// originally used socket_io, but now just in terminal.

var //http = require('http')
  //,
    spawn = require('child_process').spawn
  //, express = require('express')
  //, app = express.createServer()
  //, io = require('socket.io').listen(app)
  , _ = require('underscore')._
  //, argv = require('optimist').argv


//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');

/*
app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
  res.render('index', {}); 
});
*/

var logs = {}, key, file;
var selfPath = process.argv.shift();
  if (selfPath == 'node') selfPath = process.argv.shift();

process.argv.forEach(function(arg, index, ar) {
//  console.log(arg); //, index, ar);

  split = arg.split(':');
  file = split.pop();
  key = split.length ? split.pop() : file;
  logs[key] = file;

//  console.log('added', key, file, logs);
});

// none requested?
if (_.isEmpty(logs)) {
  process.stdout.write("USAGE: " + selfPath + " key:file key:file file file ...\n" + "e.g. " + selfPath + " errors:./error.log out:./out.log other.log\n");
  process.exit();
}

console.log('Parsing logs:', logs);


var processPool = {};

var startProcesses = function(callback) {
  console.log('Starting tail processes.');

  _(logs).each(function(path, key) {
    console.log('starting process ' + key + ' at ' + path);
    processPool[key] = spawn('tail', ['-f', path ]);
  });

  callback(processPool);
};

var killProcesses = function() {
  console.warn('Killing processes.');

  _(processPool).each(function(process, key) {
    process.kill();
    delete processPool.key;
    console.warn('killed process ' + key);
  });
};

/*
var tail = io
  .of('/tail')
  .on('connection', function(socket) {
    console.log('new socket.');
*/
    startProcesses(function(processPool) {
      _(processPool).each(function(process, key) {
        //console.log('Initialized process ' + key);
        process.stdout.on('data', function(data) {
          //socket.emit('log', { 'log': key, 'msg': data.toString('utf-8'), type: 'stdout' });

          console.log('['+key+'] ', data.toString()); 
        });
        // todo : handle stderr too
      });
    });

    //tail.on('disconnect', function() {
    process.on('exit', function() {
      console.warn('Caught EXIT.');
      killProcesses();
    });

// });


process.on('uncaughtException', function(err) {
  console.error('Caught error: ', err);
  killProcesses();
});


// keep running until exited!
// while(1) maxes out the cpu...
// so set an arbitrary interval to keep running
setInterval(function(){}, 60000);


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
/*
if (!module.parent) {
  app.listen(3001, 'logtail.node.benbuck.net');
  //console.log("Express server listening on port %d", app.address().port);
  //console.log(app.address());
  console.log('Started');
}
*/
