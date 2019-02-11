import {
  send_task2transcode
} from '../utils'
import {
  IO
} from '../../skc'
import root_logger from "../../logger";
const logger = root_logger.child({
  tag: "IptvRemoteControl"
});

let movieTitle = (new Date().getTime()).toString()

// 首页阻止返回
function preventBack(url, resp, iptv) {
  iptv.preventBack = false
  //正常页面用普通按钮
  iptv.defaultKeyProcess()
}

// 获取普通电视 --电影名字
async function getplayName(url, resp, iptv) {
  let data;
  try{
  	 data = await resp.text()
    }catch(err){
	 data = null
	console.log(`moive1 name  err=> ${err}`)
    }
  let title = iptv.sliceData(data, 'movie_name=', '&amp;')
  if (title) {
    movieTitle = title
  } else {
    movieTitle = (new Date().getTime()).toString()
  }
  logger.info('listen.js 普通电视 --电影名字', title)
}
// 获取点播 --电影名字
async function getVodName(url, resp, iptv) {
  //正常页面用普通按钮
  iptv.defaultKeyProcess()
  let data;
  try{
  	 data = await resp.json()
     }catch(err){
	 data = null
	console.log(`movie2 name err=> ${err}`) 
  }
  let programName;
  if(data){
     programName = data[0].data.programName
  }else{
     programName = (new Date().getTime()).toString()
  }
  logger.info('listen.js 点播--电影名字', programName)
}

// 获取播放地址
async function getPlayUrl(url, resp, iptv) {
  let data;
  try{
      data = await resp.json()
  }catch(err){
      data = null
     console.log(`get play url err =>${err}`)
  }
  if(!data){
    console.log('play url is null')
    return	
  }
  let movieUrl = data[0].vodUrl
  let str = data[0].vodUrl
  let responseUrl = resp.url()
  let responseUrlLeng = responseUrl.length
  if (str && (str.includes('4603')) && responseUrlLeng - 1 != responseUrl.lastIndexOf('=')) {
    return
  }
  let move = {
    url: movieUrl,
    name: movieTitle
  }
  logger.info('发送播放地址', move)

  send_task2transcode(move)
}


// 获取播放列表
async function getSitcomPlayList(url, resp, iptv) {
  let data;
  try{
      data = await resp.json()
  }catch(err){
	console.log(`get play lists err ${err}`)
        return
  }
  IO.emit("get_vod_episodes_replay", data[1])
  logger.info('发送连续剧播放列表', data[1])
}

// 连续剧 换级数
function sitcomEchhangeForNum(iptv, data) {
  let columnId = data.obj.columnId
  let programType = data.obj.programtype
  let programId = data.obj.programId
  let AjaxUrl = iptv.getVodOneData(columnId, programId, programType)
  iptv.page.evaluate(url => {
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = (data) => {

    };
    xmlHttp.open("GET", 'http://101.95.74.121:8084/iptvepg/frame50/' + url, true);
    xmlHttp.send(null);
  }, (AjaxUrl))
}

// 点播 换地址
function demandExchangeForUrl(iptv, data) {
  movieTitle = data.programName
  let columnId = data.columnId
  let programId = data.programId
  let programType = data.programType
  let breakPoint = data.breakPoint
  let AjaxUrl = iptv.getVodUrl(columnId, programId, programType, breakPoint)

  iptv.page.evaluate(url => {
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = (data) => {
      if (xmlHttp.responseText) {
        console.log('listen.js-', JSON.parse(xmlHttp.responseText))
      }
    };
    xmlHttp.open("GET", 'http://101.95.74.121:8084/iptvepg/frame50/' + url, true);
    xmlHttp.send(null);
  }, (AjaxUrl))
}

// 点播时候 换取播放地址
async function exchangeForUrl(url, resp, iptv) {
  let data;
  try{
       data = await resp.text()
  }catch(err){
	consle.log(`get dian play url ${err}`)
 	return
  }
  let columnid = iptv.sliceData(data, 'columnid=', '&')
  let programid = iptv.sliceData(data, 'programid=', '&')
  let programtype = iptv.sliceData(data, 'programtype=', '&')
  let AjaxUrl = iptv.getVodUrl(columnid, programid, programtype, 0)

  iptv.page.evaluate(url => {
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = (data) => {
      if (xmlHttp.responseText) {
       // logger.info('listen.js-', JSON.parse(xmlHttp.responseText))
      }
    };
    xmlHttp.open("GET", 'http://101.95.74.121:8084/iptvepg/frame50/' + url, true);
    xmlHttp.send(null);
  }, (AjaxUrl))
}


// 返回遇到错误的处理
async function isBackErrorProcessor(url, resp, iptv) {
  await iptv.page.evaluate(() => {
    location.reload()
  })
}

export {
  preventBack,
  getplayName,
  getVodName,
  getPlayUrl,
  exchangeForUrl,
  isBackErrorProcessor,
  demandExchangeForUrl,
  sitcomEchhangeForNum,
  getSitcomPlayList
}
