const Url = require('url');
const config = require('config');
import root_logger from '../logger';
const logger = root_logger.child({ tag: 'wsc_util' });
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const request = require('request');

let html;

async function get_single_media_name(url) {
  
  let name ;
  try {
    name = await request_get(url);
    return name;
  } catch (e) {
    logger.warn(`请求地址获取播放页源码失败：${e}`);
  }
}

let url = 'http://222.68.209.8:8090/vasroot/viscore/portal/biz_hq_11302080_hd/detail/category_hq_11302485/detail_type/movie/detail_code/bW92aWVfaHFfMTE1OTQ0OTM_';

get_single_media_name(url);

function request_get(url) {
  return new Promise((resolve, reject) => {
    request.get(url).pipe(iconv.decodeStream('gbk')).collect(function (err, body) {
      console.log(body);
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
}

