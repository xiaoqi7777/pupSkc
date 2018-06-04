var WebSocketServer = require('ws')
  , path = require('path')
  , net = require('net')
  , process = require('child_process')
  , config = require('config')
import root_logger from './logger';
const logger = root_logger.child({ tag: 'wsc' });
import { start_task, stop_task } from "./lib/transcoder.js";
import { single_media_tasks } from './sks'
import { device_id } from './skc'

let wsc;
let stream;
let is_ponged;
let wsc_online = false;
function on_open() {
  logger.info('socket connected')
  wsc.ping('', true, false);
  let res = {
    'cmd': 'login',
    'type': 'backend',
    'device_id': device_id
  }

  wsc.send(JSON.stringify(res));

  stream = net.connect({
    port: 1717
  })

  stream.on('error', function () {
    console.error('Be sure to run `adb forward tcp:1717 localabstract:minicap`')
    process.exit(1)
  })

  let readBannerBytes = 0
  let bannerLength = 2
  let readFrameBytes = 0
  let frameBodyLength = 0
  let frameBody = new Buffer(0)
  let banner = {
    version: 0
    , length: 0
    , pid: 0
    , realWidth: 0
    , realHeight: 0
    , virtualWidth: 0
    , virtualHeight: 0
    , orientation: 0
    , quirks: 0
  }

  function tryRead() {
    for (var chunk; (chunk = stream.read());) {
      console.info('chunk(length=%d)', chunk.length)
      for (var cursor = 0, len = chunk.length; cursor < len;) {
        if (readBannerBytes < bannerLength) {
          switch (readBannerBytes) {
            case 0:
              // version
              banner.version = chunk[cursor]
              break
            case 1:
              // length
              banner.length = bannerLength = chunk[cursor]
              break
            case 2:
            case 3:
            case 4:
            case 5:
              // pid
              banner.pid +=
                (chunk[cursor] << ((readBannerBytes - 2) * 8)) >>> 0
              break
            case 6:
            case 7:
            case 8:
            case 9:
              // real width
              banner.realWidth +=
                (chunk[cursor] << ((readBannerBytes - 6) * 8)) >>> 0
              break
            case 10:
            case 11:
            case 12:
            case 13:
              // real height
              banner.realHeight +=
                (chunk[cursor] << ((readBannerBytes - 10) * 8)) >>> 0
              break
            case 14:
            case 15:
            case 16:
            case 17:
              // virtual width
              banner.virtualWidth +=
                (chunk[cursor] << ((readBannerBytes - 14) * 8)) >>> 0
              break
            case 18:
            case 19:
            case 20:
            case 21:
              // virtual height
              banner.virtualHeight +=
                (chunk[cursor] << ((readBannerBytes - 18) * 8)) >>> 0
              break
            case 22:
              // orientation
              banner.orientation += chunk[cursor] * 90
              break
            case 23:
              // quirks
              banner.quirks = chunk[cursor]
              break
          }

          cursor += 1
          readBannerBytes += 1

          if (readBannerBytes === bannerLength) {
            console.log('banner', banner)
          }
        }
        else if (readFrameBytes < 4) {
          frameBodyLength += (chunk[cursor] << (readFrameBytes * 8)) >>> 0
          cursor += 1
          readFrameBytes += 1
          console.info('headerbyte%d(val=%d)', readFrameBytes, frameBodyLength)
        }
        else {
          if (len - cursor >= frameBodyLength) {
            console.info('bodyfin(len=%d,cursor=%d)', frameBodyLength, cursor)

            frameBody = Buffer.concat([
              frameBody
              , chunk.slice(cursor, cursor + frameBodyLength)
            ])

            // Sanity check for JPG header, only here for debugging purposes.
            if (frameBody[0] !== 0xFF || frameBody[1] !== 0xD8) {
              console.error(
                'Frame body does not start with JPG header', frameBody)
              process.exit(1)
            }

            wsc.send(frameBody, {
              binary: true
            })

            cursor += frameBodyLength
            frameBodyLength = readFrameBytes = 0
            frameBody = new Buffer(0)
          }
          else {
            console.info('body(len=%d)', len - cursor)

            frameBody = Buffer.concat([
              frameBody
              , chunk.slice(cursor, len)
            ])

            frameBodyLength -= len - cursor
            readFrameBytes += len - cursor
            cursor = len
          }
        }
      }
    }
  }

  stream.on('readable', tryRead)
}


let touch_ns;
async function on_message(message) {
  console.log('---------> ' + message);
  let req_msg = JSON.parse(message);
  switch (req_msg.cmd) {
    case 'key':
      if (req_msg.code > 0) {
        logger.info(`遥控器转发信息：${JSON.stringify(req_msg)}`)
        let _shell = `adb shell input keyevent ${req_msg.code}`;
        process.exec(_shell, function (error, stdout, stderr) {
          if (error !== null) {
            logger.warn('exec error: ' + error);
          };
          logger.info(`stdout: ${stdout}`);
          logger.info(`stderr: ${stderr}`);
        });
      } else {
        if (!touch_ns) {
          touch_ns = net.connect({
            port: 1111
          })

          touch_ns.on('error', function () {
            console.error('Be sure to run `adb forward tcp:1111 localabstract:minitouch`')
            process.exit(1)
          })
        }
        let msg = JSON.parse(message);
        let touch_cmd = 'd 0 ' + msg.x + ' ' + msg.y + ' 50\nc\nu 0\nc\n';
        console.log(touch_cmd);
        touch_ns.write(touch_cmd);
      }
      break;
    case "stop_play":
      //下发停止转码器任务
      let task_id = single_media_tasks[`${req_msg.play_url}`];
      logger.info(`下发停止点播任务：${task_id}`)
      let stop_result = await stop_task(config.transcoder.host, config.transcoder.port, task_id);
      if (stop_result.ret === 0) {
        delete single_media_tasks[`${req_msg.play_url}`];
        wsc.send(JSON.stringify({'cmd':'stop_play_replay'}));
        logger.info(`发送定制任务完成通知成功`);
      }
      logger.info(`停止${req_msg.play_url}/${task_id}任务结果:${JSON.stringify(stop_result)}`);
      break;

    default:
      break;
  }
}

function on_pong() {
  is_ponged = true;
}

function on_close() {
  logger.info(`client   close`)
  stream.end();
  wsc_online = false;

  retry_interval += retry_interval;
  if (retry_interval > 20000) {
    retry_interval = 1000;
  }
  logger.info(`closed, retry in ${retry_interval / 1000} second`);
  setTimeout(connect_server, retry_interval);
}


let retry_interval = 1000;
let ping_interval;
async function connect_server() {
  wsc = new WebSocketServer(config.ws.address, 'minicap')

  wsc.on('message', on_message);
  wsc.on('open', on_open);
  wsc.on('close', on_close);
  wsc.on('pong', on_pong);
  wsc.on('error', function (error) {
    logger.info(`error ${error}`);
  })
  if (!ping_interval) {
    ping_interval = setInterval(function ping() {
      console.log('ping');
      if (is_ponged && wsc_online) {
        try {
          wsc.ping('', true, false);
        } catch (e) {
          logger.warn('websocket send ping exception:' + e);
          wsc_online = false;
        }
        is_ponged = false;
      } else {
        if (wsc_online) {
          logger.info('websocket connection timout');
          wsc_online = false;
          try {
            wsc.close();
          } catch (e) {
          }
        }
      }
    }, config.ws.heart_beat ? config.ws.heart_beat : 10000);
  }
}


export { wsc, connect_server as connect_websocket_server, }
