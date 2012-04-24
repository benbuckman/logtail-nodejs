#!/usr/bin/env node

// log tailer for multiple files, as a shell script

var spawn = require('child_process').spawn
  , _ = require('underscore')._;


var logs = {}, key, file;

// parse files to tail (see usage below)
var selfPath = process.argv.shift();
  if (selfPath == 'node') selfPath = process.argv.shift();

process.argv.forEach(function(arg, index, ar) {
  var split = arg.split(':');
  file = split.pop();
  key = split.length ? split.pop() : file;
  logs[key] = file;
});

// none requested?
if (_.isEmpty(logs)) {
  process.stdout.write("USAGE: " + selfPath + " key:file key:file file file ...\n" + "e.g. " + selfPath +
      " errors:./error.log out:./out.log other.log\n");
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

process.on('exit', function() {
  console.warn('Caught EXIT.');
  killProcesses();
});


process.on('uncaughtException', function(err) {
  console.error('Caught error: ', err);
  killProcesses();
});


// keep running until exited!
// while(1) maxes out the cpu...
// so set an arbitrary interval to keep running
// (is there a better way to do this?)
setInterval(function(){}, 60000);
