let socket_io = require('socket.io');
import root_logger from "./logger";
const logger = root_logger.child({ tag: "socket_s" });
const config = require('config');
import { SOCKET } from "./skc";
import { start_task, stop_task } from "./lib/transcoder.js";
import { random_signature_key } from "./lib/utils";
const md5 = require('md5');


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
      logger.info(`client send event login --------------`)
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
      logger.info(`发送认证消息成功`)
      console.log('发送认证消息成功')
      // }
    });


    socket.on('login_reply', (msg) => {
      let result = JSON.parse(msg);
      // console.log(result);
      if (result.data.status == 'OK') {
        logger.info('认证成功');
        // socket.emit('Message', {
        //   "type": "GetChannelList",
        //   "data": {
        //   }
        // });
      } else {
        logger.info('认证失败');
      }
    });

    socket.on('channelList', (data) => {
      let result = JSON.parse(data);
      SOCKET.emit('get_channel_list_reply', result);
      logger.info(`获取设备频道列表成功,${result.channels.length}`);
    });

    socket.on('SingleMedia', async (data) => {
      try {
        let single_media_play_url = JSON.parse(data);
        logger.info(`点播播放地址:${data}`);
        if (single_media_play_url.mediaCode.length > 8) {
          return;
        }
        socket.emit('open_iframe');
        // let play_url = 'udp://' + single_media_play_url.mediaUrl.split('//')[1];
        let play_url = single_media_play_url.mediaUrl;
        let task_json = config.task_json;
        task_json.input.url = play_url;
        // task_json.input.protocol = 'udp';
        task_json.input.protocol = 'rtsp';
        task_json.output.protocol = config.transcoder.out_type;
        let stream_random = random_signature_key(6);
        let _stream_name = md5(stream_random);
        let _output_address = config.transcoder.out_address + '/live';
        task_json.output.detail.stream_name = _stream_name;
        task_json.output.detail.stream_address = _output_address;
        task_json.output.protocol = config.transcoder.out_type;
        logger.info(`点播转码任务：${task_json}`)
        let responce = await start_task(config.transcoder.host, config.transcoder.port, task_json);
        logger.info(`下发点播转码任务结果:${responce}`);
        if (responce.ret === 0) {
          let play_url = `${_output_address}/${_stream_name}`;
          logger.info(`点播播放地址:${play_url}`);
          socket.emit('single_media', { 'play_url': play_url });
        }
        //发送播放地址
        logger.info(`下发点播转码任务成功`);
      } catch (e) {
        logger.warn(`点播地址格式化错误：${e}`);
      }
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

export { socket_io_server, notify_web, io as IO }