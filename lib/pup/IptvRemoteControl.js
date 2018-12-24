import { send_task2transcode } from '../utils'
 
let movieTitle;
 
    // 首页阻止返回
     function preventBack(url, resp, iptv) {
       iptv.preventBack = false
       //正常页面用普通按钮
       iptv.defaultKeyProcess()
     }

     // 获取普通电视 --电影名字
     async function getplayName(url, resp, iptv) {
       let data = await resp.text()
       let title = iptv.sliceData(data, 'movie_name=', '&amp;')
       if (title) {
         movieTitle = title
       } else {
         movieTitle = new Date().getTime()
       }
       console.log('listen.js 普通电视 --电影名字', title)
     }
     // 获取点播 --电影名字
     async function getVodName(url, resp, iptv) {
       //正常页面用普通按钮
       iptv.defaultKeyProcess()
       let data = await resp.json()
       let programName = data[0].data.programName
       console.log('listen.js 点播--电影名字', programName)
     }

     // 获取播放地址
     async function getPlayUrl(url, resp, iptv) {
       let data = await resp.json()
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
       console.log('播放地址---+')

       send_task2transcode(move)
     }

     // 点播 换地址
     function demandExchangeForUrl(iptv,data){
      let columnId = data.columnId
      let programId = data.programId
      let programType = data.programType
      let breakPoint = data.breakPoint
      let AjaxUrl = iptv.getVodUrl(columnId, programId, programType, breakPoint)

      iptv.page.evaluate(url=>{
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = (data) => {
          if (xmlHttp.responseText) {
            console.log('listen.js-', JSON.parse(xmlHttp.responseText))
          }
        };
        xmlHttp.open("GET", 'http://101.95.74.121:8084/iptvepg/frame50/' + url, true);
        xmlHttp.send(null);
      },(AjaxUrl))
     }

     // 点播时候 换取播放地址
     async function exchangeForUrl(url, resp, iptv) {
       let data = await resp.text()
       let columnid = iptv.sliceData(data, 'columnid=', '&')
       let programid = iptv.sliceData(data, 'programid=', '&')
       let programtype = iptv.sliceData(data, 'programtype=', '&')
       let AjaxUrl = iptv.getVodUrl(columnid, programid, programtype, 0)

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
       demandExchangeForUrl
     }