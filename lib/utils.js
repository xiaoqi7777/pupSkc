
import root_logger from '../logger';
import * as Transcoder from './transcoder';
import { httpPost, httpGet } from '../lib/http_request_promise.js';
import { parse_xml } from '../lib/xml_parser_promise';
import { format_json_from_transcode_xml } from '../lib/json2transcodeXml';
import { start_task, stop_task } from "./transcoder.js";
const logger = root_logger.child({ tag: 'wsc_util' });
const config = require('config');
import { SOCKET, device_id } from '../skc';
const Url = require('url');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const request = require('request');
const md5 = require('md5');
import ERROR from './error';

let single_media_tasks = {};

let options = {
  host: '127.0.0.1',
  uri: '/api/v1',
  port: config.http_api.port,
  data: {}
};

export async function get_device_number() {
  let result;
  try {
    result = await Transcoder.info(config.transcoder.host, config.transcoder.port);
  } catch (e) {
    logger.warn(`获取设备唯一串码失败，失败原因：　${e}`);
  }
  return result;
};

export function sleep_wait(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  });
}


export function is_empty(obj) {
  for (var value in obj) {
    return false;
  }
  return true;
};

async function parse_systeminfo(xml_str) {
  let jo = await parse_xml(xml_str, {
    mergeAttrs: true,
    explicitArray: false,
  });
  await format_json_from_transcode_xml(jo);
  return jo;
}

export async function get_task_info(task_id) {
  let task_info = {};
  try {
    let xml = `
    <?xml version="1.0" encoding="utf-8"?>
      <req version="1.1">
       <task type="transc" target="list">
        <param n="update" v="1" /> 
        <param n="TTID" v="${task_id}"/>
      </task>
    </req>
    `
    let response_data = await httpPost(config.transcoder.host, config.transcoder.port, '/ep-get/xmlcommand', xml, { timeout: 3000 });
    let jo = await parse_systeminfo(response_data);
    let task_item = jo.rsp.list.item;
    if (!task_item) {
      SOCKET.emit('task_auto_stop', { 'task_id': task_id });
      logger.info(`发送自动停止任务成功`);
      return;
    }
    logger.debug(jo)
    task_info.task_id = task_id;
    task_info.input = task_item.inputpkgs;
    task_info.output = task_item.outputpkgs.split('/')[1];
    return task_info;
  } catch (e) {
    return task_info;
    logger.warn(`请求转码器获取任务输入输出失败:${e}`)
  }
}

export function random_signature_key(len) {
  len = len || 32;
  let chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz1234567890';
  let maxPos = chars.length;
  let signatureKey = '';
  for (let i = 0; i < len; i++) {
    signatureKey += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return signatureKey;
};

export async function get_task_status() {
  try {
    logger.info('-------------------------------------------------')
    let result;
    let xml = `
    <?xml version="1.0" encoding="utf-8"?>
      <req version="1.1">
       <task type="transc" target="list">
      </task>
    </req>
    `
    let response_data = await httpPost(config.transcoder.host, config.transcoder.port, '/ep-get/xmlcommand', xml, { timeout: 3000 });
    let jo = await parse_systeminfo(response_data);
    logger.info(`-----查询结果：${JSON.stringify(jo)}`);
    let tasks = jo.rsp.list.item;
    if (tasks) {
      if (Array.isArray(tasks)) {
        for (let task of tasks) {
          result = get_single_media_task(task);
          return result;
        }
      } else {
        result = get_single_media_task(tasks);
        return result;
        logger.info(`××××${JSON.stringify(result)}`);
      }
    };
    logger.info(`查询获取后的结果:${JSON.stringify(result)}`);
    // return result;
  } catch (e) {
    logger.warn(`获取转码器上的任务列表失败`);
  }
}

function get_single_media_task(task) {
  try {
    let result = {};
    let _src = decodeURIComponent(task.src + "");
    logger.info(`转码后的url: ${_src}`);
    if (!_src.includes('udp://')) {
      let _dst = decodeURIComponent(task.dst).split('://')[1];
      let src_aplit_array = _src.split('://');
      let input_protocol = src_aplit_array[0].split('i=')[1];
      if (input_protocol == 'rtsp') {
        let _outputpages = task.outputpkgs.split('/')[0];
        result.play_url = `rtmp://${_dst}`;
        result.play_status = false;
        if (parseInt(_outputpages) > 20) {
          result.play_status = true;
        }
        logger.info(`查询点播任务状态${JSON.stringify(result)}`);
      }
    }
    return result;
  } catch (e) {
    logger.warn(`获取点播任务详情失败${e}`);
  }
}

export async function get_single_media_name(url) {
  let name;
  try {
    name = await request_get(url);
    logger.info(`节目名称：${name}`);
    return name;
  } catch (e) {
    logger.warn(`请求地址获取播放页源码失败：${e}`);
  }
};


function request_get(url) {
  return new Promise((resolve, reject) => {
    request.get(url).pipe(iconv.decodeStream('gbk')).collect(function (err, body) {
      let html = body;
      let $ = cheerio.load(html);
      let input = $('html').find('input');
      let inputs = input.nextAll();
      inputs.each(function (i, elem) {
        if (elem.attribs.name === 'upc_history_ext') {
          let str = elem.attribs.value.split('movie_name=')[1];
          let movie_name = str.split('&')[0];
          logger.info(`获取url: ${url}节目名称为：${movie_name}`);
          resolve(movie_name)
        }
      });
    });
  })
};

export async function send_task2transcode(movie) {
  try {
    logger.info(`点播信息${JSON.stringify(movie)}`);
    let task_id = single_media_tasks[`${movie.url}`];
    if (task_id) {
      logger.info(`任务已存在：${task_id}/${movie.url}`);
    };
    let play_url = movie.url;
    let task_json = config.task_json;
    task_json.input.url = play_url;
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
    logger.info(`下发点播转码任务结果:${JSON.stringify(responce)}`);
    if (responce.ret === 0) {
      let play_url = `${_output_address}/${_stream_name}`;
      single_media_tasks[`${play_url}`] = responce.task_id;
      logger.info(`点播播放地址:${play_url}`);
      //发送播放地址
      SOCKET.emit('single_media', { 'play_url': play_url, 'name': movie.name, 'device_id': device_id, task_id: responce.task_id });
    }else{
     SOCKET.emit('single_media', { 'error': responce, 'name': movie.name, });
     logger.info(`下发任务${movie.name} 失败：${JSON.stringify(responce)}`);
    };
    //发送播放地址
  } catch (e) {
    logger.warn(`下发转码任务到转码器失败：${e}`);
  }
};

function get_live_task_status(task, play_url) {
  try {
    let result = {
      ret: ERROR.SUCCESS,
      data: {}
    };
    let output_pakgs = task.outputpkgs.split('/')[0];
    result.data.play_url = play_url;
    result.data.play_status = false;
    if (parseInt(output_pakgs) > 20) {
      result.data.play_status = true;
    }
    logger.info(`查询点播任务状态${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    logger.warn(`获取点播任务详情失败${e}`);
  }
}


export async function get_single_task_play_status(task_id, play_url) {
  try {
    let xml = `
    <?xml version="1.0" encoding="utf-8"?>
      <req version="1.1">
       <task type="transc" target="list">
        <param n="update" v="1" /> 
        <param n="TTID" v="${task_id}"/>
      </task>
    </req>
    `
    let response_data = await httpPost(config.transcoder.host, config.transcoder.port, '/ep-get/xmlcommand', xml, { timeout: 3000 });
    let jo = await parse_systeminfo(response_data);
    logger.info(`-----查询结果：${JSON.stringify(jo)}`);
    let task = jo.rsp.list.item;
    logger.info(`查询转码器任务结果：${task}`);
    if (!task) {
      let result = {
        ret: ERROR.TASK_NOT_FOUND
      }
      return result;
    }
    let result = get_live_task_status(task, play_url);
    logger.info(`查询当前任务详情结果：${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    logger.warn(`查询单个任务状态失败:${e}`);
  }
}

export { single_media_tasks };


// get_task_status();
