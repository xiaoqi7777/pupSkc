const builder = require('xmlbuilder');
import root_logger from '../logger';
const util = require('util');
const md5 = require('md5');

const logger = root_logger.child({ tag: 'xml2json' });

//复杂形式的tag,其下还包含有多个子段
const complexTag = [
  '/characters',
  '/characters/ext_output/',
  '/character/service',
  '/character/service/complex',
  '/character/label/complex',
];


//折叠到一行的tag, 如<param n="src" v="l=comp&i=comp://8ba7c3a7bef9d56fa9f8f252503f9eef"/>
const paramsTag = ['taskname'];

//以下定义的path路径相符的元素，其子元素都会被转成params的形式
const paramsTagChild = [
  '/character/video_capture',
  '/character/audio_capture',
  '/character/video_codec',
  '/character/audio_codec',
  '/character/miscellaneous',
  '/character/ext_output/item',
  '/character/service/complex/render',
  '/character/recording',
];

/*
 * json属性名到xml 标签的映射，如input映射成src
 */
const tagMap = {
  input: 'src',
  output: 'dst',
  protocol: 'l',
}

const tag_func = {
  "/input": convertInput,
  "/output": convertOutput
}

/*
 * 转换特殊的input/output标签
 */
function convertInput(path, jo, xo) {
  let v = `l=${jo.protocol}`;
  if(jo.url){
    v += `&i=${jo.url}`;
  }
  let o = {
    '@n': 'src',
    '@v': v
  };

  if ('undefined' == typeof (xo['param'])) {
    xo['param'] = [];
  }
  xo['param'].push(o);
}

/*
 * 转换特殊的output标签
 */
function convertOutput(path, jo, xo) {
  let v = `l=${jo.protocol}`;
  if(jo.url){
    v += `&i=${jo.url}`;
  }
  //console.log(jo);
  let o = { '@n': 'dst' };
  try {
    switch (jo.protocol) {
      case 'mp4':
        /*if (jo.url.match('^file:\/\/')) {
    jo.url = jo.url.replace(/^file:\/\//,  '');
        }*/
        o['@v'] = `l=${jo.protocol}`;//&save2file=${jo.filename}`;
        break;

      case 'rtmp':
        /* if (jo.url.match('^rtmp:\/\/')) {
     jo.url = jo.url.replace(/^rtmp:\/\//,  '');
         }
         let stream_name = jo.url.match(/[^\/]+$/)[0];
         jo.url = jo.url.replace(/\/[^\/]+$/, '');
         */
        let stream_address = jo.detail.stream_address;
        let stream_name = jo.detail.stream_name;
        if(stream_address!=null && stream_address!=''){
          if(stream_address.charAt(stream_address.length-1) == '/'){
            stream_address = stream_address.substring(0,stream_address.length-1);
          }
          if(stream_name.charAt(0) == '/'){
            stream_name = stream_name.substring(1,stream_name.length);
          }
          let li = `l=${jo.protocol}&i=${stream_address}`;
          if(stream_name!=null && stream_name!=''){
            li += `/${stream_name}`;
          }
          o['@v'] = li;
        }else{
          o['@v'] = `l=${jo.protocol}&i=${jo.detail.host}:${jo.detail.port}/${jo.detail.app_name}&EXT=stream:${jo.detail.stream_name}`;
        }
        break;

      case 'ts':
        /*if (jo.url.match('^ts:\/\/')) {
    jo.url = jo.url.replace(/^ts:\/\//,  '');
        }*/
        o['@v'] = `l=${jo.protocol}&i=${jo.detail.host}:${jo.detail.port}`;
        break;

      case 'hls_over_http':
        /*if (jo.url.match('^hls_over_http:\/\/')) {
    jo.url = jo.url.replace(/^hls_over_http:\/\//,  '');
        }*/
        o['@v'] = `l=${jo.protocol}&i=${jo.detail.host}:${jo.detail.port}/${jo.detail.channel_name}`;
        break;

      case 'multiconn_transfer':
        o['@v'] = `l=ts&rand=${md5(JSON.stringify(jo))}`;
        break;
      case 'multiconn_transfer_to_cloud':
        o['@v'] = `l=ts&rand=${md5(JSON.stringify(jo))}`;
        break;

      default:
        o['@v'] = v;
    }
  } catch (e) {
    throw e;
  }
  if ('undefined' == typeof (xo['param'])) {
    xo['param'] = [];
  }
  xo['param'].push(o);
}


/*
 * 将简单的参数配置转为一行的params
 */
function collaps2params(key, jo, xo) {
  let o = {
    '@n': key,
    '@v': jo
  }
  if ('undefined' == typeof (xo['param'])) {
    xo['param'] = [];
  }
  xo['param'].push(o);
}

/*
 * jo: 当前层级的json对象
 * xo: 当前层级的xml对象
 * path: 当前解析key的完整路径，如/input/output/character
 */

function addItem(jo, xo, xo_parent, path) {
  for (let key in jo) {
    let path_key = `${path}/${key}`;
    //console.log(`-------------- ${path_key}`);
    if (tag_func[path_key]) {
      tag_func[path_key](path_key, jo[key], xo);
      continue;
    }
    if (paramsTag.indexOf(key) != -1) {
      collaps2params(key, jo[key], xo);
      continue;
    }

    if (paramsTagChild.indexOf(path) != -1 && !key.startsWith('@')) {
      collaps2params(key, jo[key], xo);
      continue;
    }

    if ('object' == typeof (jo[key])) {
      //console.log('>' + key + ' ' + complexTag.indexOf(key) );
      if (jo[key].length != null ) {
        xo[key] = [];
        //} else if (complexTag.indexOf(key) != -1) {
      } else if (complexTag.indexOf(path) != -1) {
        xo[key] = {};
      } else {
        xo[key] = {};
      }
      if (key == 'characters' || key == 'character') {
        xo[key]['@version'] = '1.0';
      }

     //if( key == 'complex' ){
     //   console.info(jo);
     //    xo[key]['@type'] = 'logo_oprate';
     //}
      addItem(jo[key], xo[key], xo, `${path}/${key}`);
    } else {
      if(key == 'oprate_type'){
	//@**格式为在行内加   
	xo['@type'] = jo[key];
        continue;
      }
      if (xo.param) {
        if (undefined === xo.param) {
          xo.param = [];
        }
        if(key == 'content'){
          xo['content'] = jo[key];
          continue; 
        }
        let p = {
          '@n': `${key}`,
          '@v': `${jo[key]}`
        }
        xo.param.push(p);
      }else if(path!='/character/label/complex'&&path.indexOf('/character/label/complex')>-1){
	      if(key!='content'){
          xo.param = [];
          let p = {
            '@n': `${key}`,
            '@v': `${jo[key]}`
          }
          xo.param.push(p);
        }else{
          xo[key] = jo[key];
        }
      } else {
        xo[key] = jo[key]
      }
    }
  }
}

function transcoder_json2xml(jo) {
  //let input_protocol = jo.input.protocol;
  let xj = {
    req: {
      '@version': '1.1',
      task: {
        '@type': 'transc',
        '@target': 'start',
      }
    }
  }
  addItem(jo, xj.req.task, xj.req, '');
  //打印转换的中间过程的json
  //console.log(util.inspect(xj, false, null));
  //console.log('----------------------------------------');
  let xo;
  try {
    xo = builder.create(xj);
  } catch (e) {
    logger.warn(`create xml object from json failed e:${e.message}`);
    logger.warn(xj);
    return;
  }
  let xml_xo = xo.end({ pretty: true });
  xml_xo = xml_xo.replace(/__AND__/g,'&');
  //console.log(xml_xo);
  return xml_xo;
}

/*
 * 整理由transcode xml转换来的json.
 * 将params 缩进
例如:
{ rsp:
   { version: '1.1',
     transcoder:
      { param:
         [ { n: 'name', v: '00E04C644323.tranc@wskj.anystreaming.net' },
           { n: 'version', v: '6.30.7.708' },
           { n: 'clock', v: '2017-09-23 12:51:50' },
           { n: 'license', v: '1/3' },
           { n: 'tasks', v: '0/0' },
           { n: 'capture', v: '1' },
           { n: 'cocktail', v: '1' },
           { n: 'notification', v: '0' } ] },
     autoconf:
      { param:
         [ { n: 'provider', v: 'wskj' },
           { n: 'device', v: '00E04C644323' },
           { n: 'conf_url', v: '' } ] },
     tasks: { in: '0', out: '0' } } }
转换为

{ rsp:
   { version: '1.1',
     transcoder:
      { name: '00E04C644323.tranc@wskj.anystreaming.net',
        version: '6.30.7.708',
        clock: '2017-09-23 12:51:50',
        license: '1/3',
        tasks: '0/0',
        capture: '1',
        cocktail: '1',
        notification: '0' },
     autoconf: { provider: 'wskj', device: '00E04C644323', conf_url: '' },
     tasks: { in: '0', out: '0' } } }

 */
//指定将某些属性转化为数组形式，那怕只有一个元素
const array_keys = ['/rsp/not_exists'];
function format_json_from_transcode_xml(raw_jo, path) {
  if (!path) path = '';
  //console.log(path);
  for (let i in raw_jo) {
    let full_path_key = `${path}/${i}`;
    if (typeof (raw_jo[i]) === 'object') {
      if (i == 'param') {
        let params = raw_jo[i];
        /*把params合到上一级中*/
        for (let p of params) {
          if ('/rsp/tasks' === path) {
            if (undefined === raw_jo['list']) {
              raw_jo['list'] = [];
            }
            if ('TTID' === p.n.trim()) {
              raw_jo['list'].push({
                id: p.v
              });
              //console.dir(raw_jo['list']);
            }
            if ('score' === p.n.trim()) {
              raw_jo['list'][raw_jo['list'].length - 1].score = p.v
            }
          } else {
            //原先的写法 raw_jo[p.n] = p.v;
            if(raw_jo[p.n]!=null){
              if(typeof(raw_jo[p.n])=='object'&&raw_jo[p.n].length!=null){
                raw_jo[p.n].push(p.v); 
              }else{
                let array = new Array();
                array.push(raw_jo[p.n]);
                array.push(p.v);
                raw_jo[p.n] = array;
              }
            }else{
              raw_jo[p.n] = p.v;
            }
          }
        }
        delete raw_jo[i];
      } else {
        format_json_from_transcode_xml(raw_jo[i], full_path_key);
      }
      if (array_keys.indexOf(full_path_key) >= 0) {
        //console.log('found ' + i);
        let o = raw_jo[i];
        if (!Array.isArray(o)) {
          raw_jo[i] = [o];
        }
      }
    }
  }
}

export { transcoder_json2xml, format_json_from_transcode_xml };
