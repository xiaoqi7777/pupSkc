
import root_logger from '../logger';
import * as Transcoder from './transcoder';
const logger = root_logger.child({ tag: 'wsc_util' });
const config = require('config');


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