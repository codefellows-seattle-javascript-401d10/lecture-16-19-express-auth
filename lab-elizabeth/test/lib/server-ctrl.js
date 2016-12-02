'use strict';

const debug = require('debug')('bookstagram:server-ctrl');

module.exports = exports = {};

exports.serverUp = function(server, done){
  if (!server.isRunning){
    server.listen(process.env.PORT, () => {
      server.isRunning = true;
      debug('server up! <(0.0)>');
      done();
    });
    return;
  }
  done();
};

exports.serverDown = function(server, done){
  if(server.isRunning){
    server.close(err => {
      if (err) return done(err);
      server.isRunning = false;
      debug('server down... <(-.-)>');
      done();
    });
    return;
  }
  done();
};
