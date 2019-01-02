import root_logger from "./logger";
var pty = require("pty.js");
const logger = root_logger.child({
  tag: "socket"
});
const config = require('config');
const exec = require('child_process').exec;
const get_device_number = require('./lib/utils').get_device_number;
const sleep_wait = require('./lib/utils').sleep_wait;
const is_empty = require('./lib/utils').is_empty;
const get_task_info = require('./lib/utils').get_task_info;
import {
  single_media_tasks
} from './lib/utils';
// const {
//   version
// } = require('./version');
import {
  start_task,
  stop_task
} from "./lib/transcoder.js";
import {
  get_task_status,
  get_single_task_play_status
} from './lib/utils';


import {
  preventBack,
  getplayName,
  getVodName,
  getPlayUrl,
  exchangeForUrl,
  isBackErrorProcessor,
  demandExchangeForUrl,
  sitcomEchhangeForNum,
  getSitcomPlayList

} from './lib/spiderAuto/IptvRemoteControl';

import {
  vodOnLoad,
  vodOnResponse
} from './lib/spiderAuto/vodPage';

import {
  IO
} from "./sks"
let serial_number;
let skc_online = false;
let terms = {};
let remote_password;

//断开连接后重试间隔
let retry_interval = 2;
let socket;
let ping_interval;
let device_id;
let _token;
let remote_data = {};

let iptv = null;
const IptvMocker = require('./lib/spiderAuto/iptvMocker2');
const iptvMock = new IptvMocker({
  url: 'http://iptvauth.online.sh.cn:7001/iptv3a/hdLogAuth.do?UserID=75720573&Action=Login&Mode=MENU.SMG',
  headless: false,
  io: null
})
// const sk_host = "ws://192.168.1.165" 
const sk_host = "ws://47.96.129.127"

const sk_port = "3000"
const version = "1.0.0-version_fix"

async function socket_io_client() {
  // _token = await set_token();
  socket = require("socket.io-client")(sk_host + ':' + sk_port, {
    query: {
      token: '00E04C644323', //_token
      version: version
    },
    autoConnect: true
  });

  serial_number = '00E04C644323';
  //open
  socket.on('connect', async (data) => {
    iptv = await iptvMock.init();
    await iptv.auth();
    logger.info('scoket connected');
    socket.emit('login');
  });

  socket.on('loging_reply', async (data) => {
    logger.info('登录完成×××××××××××××××')
    try {

      let img;
      setInterval(() => {
        img = iptv.getScreenshot()
        socket.emit('img', {
          value: img
        })
      }, 1000)

      socket.emit('get_channel_list_reply', {
        channels: iptv.getChannelList()
      })
      socket.on('get_play_url', async (data) => {
        demandExchangeForUrl(iptv, data)
      })

      socket.on('get_vod_episodes', async (data) => {
        sitcomEchhangeForNum(iptv, data)
      })

      //监视按键
      socket.on('key_board', async (key) => {
        switch (key.value) {
          case 'shang':
            iptv.moveUp(1)
            break;
          case 'xia':
            iptv.moveDown(1)
            break;
          case 'zuo':
            iptv.moveLeft(1)
            break;
          case 'you':
            iptv.moveRight(1)
            break;
          case 'enter':
            iptv.pressOkKey(1)
            break;
          case 'back':
            iptv.goBack()
            break;
        }
      })

      // 增加普通按钮
      iptv.addPageProcessor(/frame50\/vod_portal.jsp$/, null, vodOnResponse)
      // 首页阻止返回
      iptv.addPageProcessor(/bg\_index\_club\_new2/, null, preventBack)
      // 获取普通电视 --电影名字
      iptv.addPageProcessor(/detail\_type\/movie\/detail\_code/, null, getplayName)
      // 获取点播 --电影名字
      iptv.addPageProcessor(/get\_vod\_info/, null, getVodName)
      // 获取播放地址
      iptv.addPageProcessor(/get\_vod\_url\.jsp/, null, getPlayUrl)
      // 获取连续剧列表
      iptv.addPageProcessor(/get\_vod\_info\.jsp/, null, getSitcomPlayList)
      // 点击播放时候 换取播放地址
      iptv.addPageProcessor(/frame50\/ad_play.jsp\?adindex\=1&adcount\=/, null, exchangeForUrl)
      // 返回遇到错误的处理
      iptv.addPageProcessor(/5CYII\=/, null, isBackErrorProcessor)
      iptv.addPageProcessor(/http:\/\/222.68.210.43:8080\/static\/es\/entries\/shmgtv\.html/, null, isBackErrorProcessor)



    } catch (e) {
      logger.warn(`init spider error:${e}`);
    };

    skc_online = true;
    device_id = data.device_id;
    remote_password = data.remote_password;
    logger.info(`设备登录成功,修改连接状态 ${skc_online}`);

  });



  socket.on('not found', async () => {
    socket.close();
  });

  socket.on('get_channel_list', () => {
    logger.info('获取直播平道列表')
  });

  //停止点播任务
  socket.on('stop_single_media', async (data) => {
    let task_id = single_media_tasks[`${data.play_url}`];
    logger.info(`下发停止点播任务：${task_id}`)
    let stop_result = await stop_task(config.transcoder.host, config.transcoder.port, task_id);
    if (stop_result.ret === 0) {
      delete single_media_tasks[`${data.play_url}`];
      socket.emit('stop_single_midea_play_replay', {
        'task_id': task_id
      });
      logger.info(`发送定制任务完成通知成功`);
    };
    logger.info(`停止${data.play_url}/${task_id}任务结果:${JSON.stringify(stop_result)}`);
  });


  socket.on('start_channel', async (data) => {
    let responce = await start_task(config.transcoder.host, config.transcoder.port, data.task_json);
    socket.emit('start_channel_reply', responce);
  });

  socket.on('stop_channel', async (data) => {
    logger.info(`停止任务：${data.task_id}`)
    let responce = await stop_task(config.transcoder.host, config.transcoder.port, data.task_id);
    socket.emit('stop_channel_reply', responce);
  });

  socket.on('sync_task_info', async (data) => {
    if (data && data.task_id) {
      let info = await get_task_info(data.task_id);
      if (info.task_id) {
        socket.emit('sync_task_info_reply', info);
      } else {
        socket.emit('task_auto_stop', {
          'task_id': data.task_id
        });
        logger.info(`发送自动停止任务成功`);
      }
    }
  })

  socket.on('get_task_status', async () => {
    //获取转码器上所有的任务状态
    logger.info(`开始查询点播任务状态`);
    let result = await get_task_status();
    socket.emit(`get_task_status_replay`, {
      'status': result
    });
    logger.info(`发送点播任务详情成功:${JSON.stringify(result)}`);
  });

  socket.on('get_single_task_play_status', async (data) => {
    //获取转码器当前任务状态
    logger.info(`查询当前设备点播任务播放状态`);
    let result;
    if (data.type === 'live') {
      result = await get_single_task_play_status(data.task_id, data.play_url);
    } else {
      result = await get_task_status(data.task_id);
    }
    socket.emit('get_single_task_play_status_reply', {
      'status': result
    });
    logger.info(`当前设备点播详情结果:${JSON.stringify(result)}`);
  });

  //远程ssh
  socket.on("rsh", function (data) {
    on_rsh(data);
  });

  socket.on("resize", function (data) {
    try {
      let web_socket_id = data.web_socket_id;
      let term = terms[web_socket_id];
      term.resize(data.col, data.row);
    } catch (e) {
      logger.warn("tty resize exception:" + e);
    }
  });

  socket.on("input", function (data) {
    try {
      let web_socket_id = data.web_socket_id;
      let term = terms[web_socket_id];
      term.write(data.input_value);
    } catch (e) {
      logger.warn("term write exception: " + e);
    }
  });

  socket.on('close_term', function (data) {
    try {
      let web_socket_id = data.web_socket_id;
      let term = terms[web_socket_id];
      term.end();
      term.destroy();
      delete terms.web_socket_id;
      logger.info(`释放term成功`);
    } catch (e) {
      logger.warn("term end exception: " + e);
    }
  });

  //error
  socket.on('error', () => {
    logger.info(`${serial_number}  connect cloud fai`);
    release_term();
    remote_data = {};
  });

  socket.on('disconnect', async function (error) {
    skc_online = false;
    remote_data = {};
    // await wscUtil.send_online_msg(skc_online);
    logger.info(`连接断开,断开原因: ${error}`);
    await sleep_wait(retry_interval);
    retry_interval += retry_interval;
    if (retry_interval > 16) {
      retry_interval = 2;
    };

    release_term();
  });

  socket.on('connect_error', async (error) => {
    skc_online = false;
    // await wscUtil.send_online_msg(skc_online);
    logger.info(`socket连接 ${socket.io.uri} 时错误: ${error}, ${retry_interval}s 后重试....`);
    await sleep_wait(retry_interval);
    retry_interval += retry_interval;
    if (retry_interval > 16) {
      retry_interval = 2;
    }
    release_term();
  });

  socket.on('pong', () => {
    skc_online = true;
  });

  socket.on('reconnect_attempt', async () => {
    logger.info(`设备串号：　${serial_number}`);
  });

  async function set_token() {
    let result;
    while (true) {
      await sleep_wait(2);
      result = await get_device_number();
      if (result && result.autoconf.device.length === 12) {
        break;
      } else {
        logger.warn('获取唯一串号失败');
      };
    };
    serial_number = result.autoconf.device;
    return serial_number;
  }

  function release_term() {
    try {
      if (!is_empty(terms)) {
        for (let web_socket_id in terms) {
          if (terms.hasOwnProperty(web_socket_id)) {
            let term = terms[web_socket_id];
            term.end();
            term.destroy();
            delete terms.web_socket_id;
          }
        }
        logger.info('连接断开，释放term成功');
      }
    } catch (error) {
      logger.warn(`连接断开，释放term失败：${term}`);
    }
  };
};

function on_rsh(rsh_req) {
  console.dir(rsh_req);
  logger.info(`rsh_req:${JSON.stringify(rsh_req)}`);
  let sshauth = "password,keyboard-interactive";
  let ssh_user = rsh_req.user_name ? rsh_req.user_name : 'root';
  logger.info("ssh request accepted.");

  let term;
  if (process.getuid() == 0) {
    term = pty.spawn("/usr/bin/env", ["login", "-f", ssh_user], {
      name: "xterm-256color",
      cols: 80,
      rows: 30
    });
  } else {
    term = pty.spawn(
      "ssh", [
        ssh_user + '@' + rsh_req.ssh_host,
        "-p",
        rsh_req.ssh_port,
        "-o",
        "PreferredAuthentications=" + sshauth
      ], {
        name: "xterm-256color",
        cols: 80,
        rows: 30
      }
    );
  };
  let _web_socket_id = rsh_req.web_socket_id;
  term.web_socket_id = _web_socket_id;
  terms[_web_socket_id] = term;
  logger.info(
    " PID=" + term.pid + " STARTED on behalf of user=" + ssh_user
  );
  term.on("data", function (data) {
    let _web_socket_id = term.web_socket_id;
    return socket.emit("forward_web", {
      "cmd": "output",
      "msg": {
        data
      },
      "web_socket_id": _web_socket_id
    });
  });
  term.on("exit", function (code) {
    logger.info(" PID=" + term.pid + " ENDED");
  });
};

export {
  socket as IO,
  socket_io_client,
  skc_online,
  socket as SOCKET,
  serial_number,
  remote_data,
  device_id
};