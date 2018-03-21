const builder = require('xmlbuilder');
  
const xml2js = require('xml2js');
import {transcoder_json2xml} from '../lib/json2transcodeXml.js';
import {httpPost} from '../lib/http_request_promise.js';
// import {parse_xml} from '../lib/xml_parser_promise';
import {format_json_from_transcode_xml} from '../lib/json2transcodeXml';
const uri = '/ep-get/xmlcommand'
import ERROR from '../lib/error';
import root_logger from '../logger';
import * as util from 'util';
let first_task = true;
const logger = root_logger.child({tag: 'task_func'});

async function start_task(host, port, task_jo,plugin_xml) {
  let str_task_jo = JSON.stringify(task_jo)
  logger.info(str_task_jo);
  task_jo = JSON.parse(str_task_jo.replace(/&/g, '__AND__'));
  let task_xml;
  try {
     task_xml = transcoder_json2xml(task_jo);
  } catch(e) {
     logger.warn('convert json to xml exception:' + e);
     logger.warn(task_jo);
     throw Error('json is not valid');
  }
  console.info(task_xml);
  if (null == task_xml) throw Error('build xml object from json fail');
  //logger.warn(`convert transcode command json to xml error: ${e}`);
  let message = '';
  
  //如果插件xml不为null并且是第一次下发任务就添加插件xml
  if(plugin_xml!=null){
    let task_xmls = task_xml.split('</audio_codec>');
    task_xml = task_xmls[0] + "</audio_codec>\n<service>" + plugin_xml +"</service>" + task_xmls[1];
    first_task = false;

  }
  //打印最终给transcoder的xml
  logger.debug(task_xml);
  let response_data ;
  try {
    response_data = await httpPost(host, port, uri, task_xml);  
  } catch (error) {
    console.info(error);
    logger.info(error);
    return 'httperror';
  }

  let ra = response_data.split('\r\n');
  logger.debug(`start transcoder task resp: ${response_data}`);
  if (ra[0].trim() == 'success') {
    let task_id = ra[1];
    
    return {
      ret: 0,
      task_id: ra[1]
    };
  } else if(ra[0].trim() == 'reject') {
    let error_info = ra[1].split(':');
    let error_code = parseInt(error_info[0]);
    switch(error_code) {
      case 5:
      error_code = ERROR.TASK_OVERFLOW;
      break;
      default:
      error_code = ERROR.TASK_START_FAIL;
    }
    return {
      ret: error_code,
      message: ra[1],
    };
  } else {
    return {
      ret: ERROR.INVALID_TASK_DEFINE,
      message: ra[1]
    };
  }
}

// async function parse_systeminfo(xml_str) {
//   //console.log(xml_str);
//   let jo = await parse_xml(xml_str, {
//       mergeAttrs: true,
//       explicitArray: false,
//     });
//   await format_json_from_transcode_xml(jo);
//   jo.rsp.tasks.in = parseInt(jo.rsp.tasks.in);
//   jo.rsp.tasks.out = parseInt(jo.rsp.tasks.out);
//   if (jo.rsp.tasks.in === 0 && jo.rsp.tasks.out === 0) {
//     jo.rsp.tasks.list = [];
//   }
//   return jo;
// }

// async function parse_systemwork(xml_str){
//   let jo = await parse_xml(xml_str, {
//     mergeAttrs: true,
//     explicitArray: false,
//   });
//   format_json_from_transcode_xml(jo);
//   return jo;
// }

async function full_screen_preview(host, port, ttid) {
  let xml = `
  <?xml version="1.0" encoding="utf-8"?>
  <req version="1.1">
    <task type="transc" target="set">
      <param n="TTID" v="${ttid}"/>
      <param n="display" v="1"/>
    </task>
  </req>`;
  console.log(xml);
  let response_data = await httpPost(host, port, uri, xml, {timeout: 1000});
  if (response_data.match(/success/)) {
    return 0;
  } else {
    logger.warn(`switch fullscreen get message: ${response_data}`);
    return ERROR.GENERAL_ERROR;
  }
}

async function info(host, port) {
  let xml = `
   <?xml version="1.0" encoding="UTF-8" ?> 
   <req version="1.1">
     <task type="transc" target="systeminfo">
        <param n="currtask" v="1" /> 
     </task> 
   </req>`;
  let message = '';
  let response_data = await httpPost(host, port, uri, xml, {timeout: 1000});
  let jo = await parse_systeminfo(response_data);
  //console.log(util.inspect(jo, {depth: 8}));
  return jo.rsp;
}

async function stop_task(host, port, task_id) {
  let cmd_xml = `<?xml version="1.0" encoding="utf-8"?>
      <req version="1.1">
	<task type="transc" target="stop">
	<param n="TTID" v="${task_id}"/>
      </task>
    </req>`;
  let resp ;
  try {
    resp = await httpPost(host, port, uri, cmd_xml);
  } catch (error) {
    console.info(error);
    logger.info(error);
    return 'httperror';
  }
  if (resp === 'success') {
    return {
      ret: 0,
      msg: resp
    };
  } else {
    let error_msg = resp.split('\r\n')[1];
    let error_info = [];
    let ret = ERROR.GENERAL_ERROR;
    if (error_msg) {
      error_info = error_msg.split(':');
      let error_code;
      error_code = parseInt(error_info[0]);
      switch(error_code) {
        case 4:
        ret = ERROR.TASK_NOT_FOUND;
        break;
      }
    }
    return {
      ret: ret,
      msg: error_msg ? error_msg:resp
    };
  }
}

async function stop_all_task(host, port) { 
  let ti = await info(host, port);
  for (let t of ti.tasks.list) {
    let resp = await stop_task(host, port, t.id);
  }
}

/*
 * 通过transcode自带接口强制停止所有任务
 * 有时通过任务id停止任务也会失败，此时要通过transcode本身的接口停止所有任务
 */
async function focrce_stop_all_task(host, port) {
  let cmd_xml = `<?xml version="1.0" encoding="utf-8"?>
      <req version="1.1">
        <task type="transc" target="stop_all">
        </task>
      </req>`;
  let resp ;
  try {
    resp = await httpPost(host, port, uri, cmd_xml);
  } catch (error) {
    console.info(error);
    logger.info(error);
    return 'httperror';
  }
  logger.debug(`force stop alll task response： ${resp}`);
  if (resp === 'success') {
    return {
      ret: 0,
      msg: resp
    };
  } else {
    return {
      ret: ERROR.GENERAL_ERROR
    };
  } 
}

/**
 * 下发清除logo和文字xml
 */
async function clear_logo(host, port, uri, type, task_id){
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <req version="1.1">
    <task type="transc" target="set" >
	<param n="TTID" v="${task_id}" />
        <complex type="${type}">
	</complex>
  </task>
  </req>`;
  console.info(xml);
  let resp = await httpPost(host, port, uri, xml);
  if (resp === 'success') {
    return {
      ret: 0,
      msg: resp
    };
  } else {
    return {
      ret: ERROR.GENERAL_ERROR
    };
  } 
}

/**
 * 下发更新的logo
 */

 async function reset_logo(host, port, uri, task_id, logos, texts){
  let xml = `<?xml version="1.0" encoding="UTF-8"?><req version="1.1">
  <task type="transc" target="set" >
  <param n="TTID" v="${task_id}" />`
  xml += `
  <complex type="logo_operate">
  </complex>
  <complex type="text_operate">
  </complex>
`;
  logos.forEach(function(element) {
    xml+=`
    <complex type="logo_operate">
      <param n="width" v="${element.width}"/>
      <param n="height" v="${element.height}"/>
      <param n="left" v="${element.x_pos}"/>
      <param n="top" v="${element.y_pos}"/>
      <param n="file" v="/var/www/transcoder/${element.path}"/>
    </complex>`;
  }, this);
  texts.forEach(function(element) {
    xml+=`
    <complex type="text_operate">
      <param n="width" v="${element.width}"/>
      <param n="height" v="${element.height}"/>
      <param n="x_pos" v="0"/>
      <param n="y_pos" v="${element.y_pos}"/>
      <param n="font_size" v="${element.font_size}"/>
      <param n="font_color" v="${element.font_color}ff"/>
      <param n="space" v="${element.space}"/>
      <param n="h_space" v="0"/>
      <param n="left_space" v="${element.x_pos}"/>
      <param n="outl_width" v="2"/>
      <param n="outl_color" v="0x00"/>
      <content>utf8:${element.content}</content>
    </complex>
    `;
  }, this);
  xml +=`
  </task></req>
  `;
  logger.info(xml);
  let resp = await httpPost(host, port, uri, xml);
  if (resp === 'success') {
    return {
      ret: 0,
      msg: resp
    };
  } else {
    return {
      ret: ERROR.GENERAL_ERROR
    };
  } 
 }

export {
  start_task, 
  stop_task, 
  info, 
  //parse_systeminfo, 
  stop_all_task, 
  //parse_systemwork,
  full_screen_preview,
  focrce_stop_all_task,
  clear_logo,
  reset_logo,
};
