var bunyan = require('bunyan');

var bunyan = require('bunyan');

function make_logger(app_name) {
  let logger = bunyan.createLogger({
    name: app_name,
    streams: [{
      type: 'rotating-file',
      path: './logs/'+app_name+'.log',
      period: '1d',   // daily rotation
      count: 3,        // keep 3 back copies
      level: 'trace'
    }
  ]
  });
  return logger;
}

const logger = make_logger('SPIDERIPTV');
export default logger;