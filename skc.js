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
import { single_media_tasks } from './lib/utils';
const {
  version
} = require('./version');
import {
  start_task,
  stop_task
} from "./lib/transcoder.js";
import {
  get_task_status
} from './lib/utils';

const Spider = require('./lib/pup/Spider');
const socket_fn = require('./lib/pup/socket_fn');
const listen = require('./lib/pup/listen');
const Calculation = require('./lib/Calculation');
//实例化爬虫对象
const spider = new Spider({
  ...config.pup,
})


import {
  IO
} from "./sks"
let serial_number;
let skc_online = false;
let terms = {};
let remote_password;
let remote_control_server_host;
let remote_control_server_port;

//断开连接后重试间隔
let retry_interval = 2;
let socket;
let ping_interval;
let device_id;
let _token;
let remote_data = {};

let page;
let child;
let skFn;
let browser;
let listenFn;
let listenInte;
let IsBack = null;
let ischangeIframe;


async function socket_io_client() {
  // _token = await set_token();
  socket = require("socket.io-client")(config.cloud.sk_host + ':' + config.cloud.sk_port, {
    query: {
      token: '00E04C644323',//_token
      version: version
    },
    autoConnect: true
  });

  serial_number = '00E04C644323';
  //open
  socket.on('connect', async (data) => {
    logger.info('scoket connected');
    socket.emit('login');
  });

  socket.on('loging_reply', async (data) => {
    logger.info('登录完成×××××××××××××××')
    try {
      if (!page) {
        logger.info('init spider-----')
        await spider.init().then(async data => {
          // child = data.child;
          page = data.page;
          browser = data.browser;

          console.log('初始化--执行成功')
        });
      };

      //page对象监听事件，判断是否需要返回child对象
      listenFn = await new listen({
        page: page,
        calculation: Calculation
      });

      listenInte = await listenFn.init()
      listenInte.on('send',(data)=>{
        child = data
      })	
      listenInte.on('firstPage',(data)=>{
        ischangeIframe = data
      })
      
      skFn = await new socket_fn({
        child: child,
        page: page,
      });

    } catch (e) {
      logger.warn(`init spider error:${e}`);
    };

    skc_online = true;
    device_id = data.device_id;
    remote_password = data.remote_password;
    logger.info(`设备登录成功,修改连接状态 ${skc_online}`);
    // IO.sockets.emit('Message', {
    //   "type": "GetChannelList",
    //   "data": {
    //   }
    // });
  });

  socket.on('key_board', async (key) => {
    if(key.value === 'back' && ischangeIframe === 'on'){
			return
		}
    let imgAdress = await skFn.checkPageUrl(key, child,listenInte)

    socket.emit('img', {value: imgAdress})

  });


  socket.on('not found', async () => {
    socket.close();
  });

  socket.on('get_channel_list', () => {
    logger.info('获取直播平道列表')
    // IO.sockets.emit('Message', {
    //   "type": "GetChannelList",
    //   "data": {}
    // });
  });

  //停止点播任务
  socket.on('stop_single_media', async (data) => {
    let task_id = single_media_tasks[`${data.play_url}`];
    logger.info(`下发停止点播任务：${task_id}`)
    let stop_result = await stop_task(config.transcoder.host, config.transcoder.port, task_id);
    if (stop_result.ret === 0) {
      delete single_media_tasks[`${data.play_url}`];
      socket.emit('stop_single_midea_play_replay');
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
    let info = await get_task_info(data.task_id);
    if (info.task_id) {
      socket.emit('sync_task_info_reply', info);
    } else {
      socket.emit('task_auto_stop', {
        'task_id': data.task_id
      });
      logger.info(`发送自动停止任务成功`);
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
    if (browser) {
      browser.close();
    }
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
  socket_io_client,
  skc_online,
  socket as SOCKET,
  serial_number,
  remote_data,
  device_id,
  child
};