
import root_logger from '../logger';
import * as Transcoder from './transcoder';
import { httpPost } from '../lib/http_request_promise.js';
import { parse_xml } from '../lib/xml_parser_promise';
import { format_json_from_transcode_xml } from '../lib/json2transcodeXml';
const logger = root_logger.child({ tag: 'wsc_util' });
const config = require('config');
import { SOCKET } from '../skc'

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