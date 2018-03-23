let socket_io = require('socket.io');
import root_logger from "./logger";
const logger = root_logger.child({ tag: "socket" });
const config = require('config');


let io;
let is_login = false;

function socket_io_server(server) {
  io = require("socket.io")(server, {
    pingInterval: config.socket_io.ping_interval,
    pingTimeout: config.socket_io.ping_timeout,
  });

  io.on('connection', function (socket) {
    logger.info('clent socket connect')

    socket.on('login', (msg) => {
      let params = JSON.parse(msg);
      if (params.name) {
        socket['device_id'] = msg.name;
        is_login = true;
      };
      if (is_login) {
        let data = {
          type: 'audth',
          data: {
            Vendor: 'minchuang',
            StbID: '0010029900D04940000180A1D7F3599D',
            mac: '',
            UserID: '75720573',
            Password: '123456',
            AuthUrl: 'http://iptvauth.online.sh.cn:7001/iptv3a/hdLogAuth.do',
            AuthUriBackup: 'http://iptvauth.online.sh.cn:7001/iptv3a/hdLogAuth.do'
          }
        }
        socket.emit('Message', data);
        console.log('发送认证消息成功')
      }
    });


    socket.on('login_reply', (msg) => {
      let result = JSON.parse(msg);
      console.log(result);
      if (result.data.status == 'OK') {
        logger.info('认证成功');
        socket.emit('Message', {
          "type": "GetChannelList",
          "data": {
          }
        });
      } else {
        logger.info('认证失败');
      }
    });

    socket.on('channelList', (data) => {
      let result = JSON.parse(data);
      console.dir('获取频道列表成功', result, '*********************');
      logger.info(result);
    })

    socket.on('disconnect', (msg) => {
      logger.info(`client socket 断开连接`);
    });

    socket.on('message', (data) => {
      socket.emit('login_reply', { 'name': '123456' })
    })

    socket.on('error', (msg) => {
      logger.warn(`clent socket error: ${msg}`)
    })

  })
}

function notify_web(msg) {
  try {
    io.sockets.emit('notify', msg);
    logger.info(`send event: ${msg.type} to client success`)
  } catch (e) {
    logger.warn(`send event: ${msg.type} to client success`)
  }
}

export { socket_io_server, notify_web }