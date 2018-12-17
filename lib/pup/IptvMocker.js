const puppeteer = require('puppeteer');

class IptvMocker {
  constructor(pop) {
    this.headless = pop.headless
    this.browser = null
    this.page = null

  }
  async init() {
    this.browser = await puppeteer.launch({
      headless: this.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // slowMo:500
    })
    
    this.page = await this.browser.newPage()
			await this.page.setViewport({
				width: 1920,
				height: 1080
			});
    await this.global()

    return this.page
  }
  async exposeFunction(){
    await this.page.exposeFunction('readfile123',(data)=>{
      return new Promise((resolve,reject)=>{
        resolve(data)
      })
    })
  }
  //全局修改属性
  async global() {
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'Authentication', {
          value: {
            CTCSetConfig(...agrs) {
              console.log('page.js-改写的方法回调',...agrs)
            },
            CTCStartUpdate() {
              return;
            },
            // CTCGetAuthInfo(...agrs){
            //   console.log('CTCGetAuthInfo',...agrs)
            // }
          }
        }),
        Object.defineProperty(window, 'MediaPlayer', {
          value: (
            class MediaPlayer {
              constructor() {

              }
            }
          )
        }),
        Object.defineProperty(window, window, {
          value: (
            onkeydown = function (data) {
              if (data.keyCode == 13) {
                console.log('page.js-13')
              } else if (data.keyCode == 38) {
                let data = {
                  which: UP
                }
                grabEvent(data)
              } else if (data.keyCode == 40) {
                let data = {
                  which: DOWN
                }
                grabEvent(data)
              } else if (data.keyCode == 37) {
                console.log('page.js-37777777777')
                let data = {
                  which: LEFT
                }
                grabEvent(data)
              } else if (data.keyCode == 39) {
                let data = {
                  which: RIGHT
                }
                grabEvent(data)
              } else if (data.keyCode == 8) {
                let data = {
                  which: BACK
                }
                grabEvent(data)
              }
            }
          )
        }),
        Object.defineProperty(window, 'Utility', {
          value: (
            function getEvent(data) {
              console.log('page.js-Utility')
              return;
            }
          )
        }),
              // mp.setVideoDisplayArea is not a function
      // mp.getChannelNum is not a function
      // top.mp.getVolume is not a function
      // top.mp.stop is not a function
      // top.mp.joinChannel is not a function
      // top.mp.getVolume is not a function
      // jbAdTid2 is not defined
      // Object.defineProperty(window,'top',{
      //   value:('123')
      // }),
      // 此网页需要使用您之前输入的数据才能正常显示。您可以重新发送这些数据，不过，这么做会重复执行此网页之前执行过的所有操作。
        Object.defineProperty(window,'jbAdTid2',{
          value:('123')
        }),
        Object.defineProperty(window, 'mp', {
          value: {
            //方法
            bindNativePlayerInstance(...agrs){
              console.log('bindNativePlayerInstance',...agrs)
            },
            initMediaPlayer(...agrs){
              console.log('initMediaPlayer',...agrs)
            },
            releaseMediaPlayer(...agrs){
              console.log('releaseMediaPlayer',...agrs)
            },
            addSingleMedia(...agrs){
              console.log('addSingleMedia',...agrs)
            },
            addBatchMedia(...agrs){
              console.log('addBatchMedia',...agrs)
            },
            leaveChannel(...agrs){
              console.log('leaveChannel',...agrs)
            },
            removeMediaByEntryID(...agrs){
              console.log('removeMediaByEntryID',...agrs)
            },
            moveMediaByIndex(...agrs){
              console.log('moveMediaByIndex',...agrs)
            },
            moveMediaByOffset(...agrs){
              console.log('moveMediaByOffset',...agrs)
            },
            moveMediaByIndex1(...agrs){
              console.log('moveMediaByIndex1',...agrs)
            },
            moveMediaToNext(...agrs){
              console.log('moveMediaToNext',...agrs)
            },
            moveMediaToPrevious(...agrs){
              console.log('moveMediaToPrevious',...agrs)
            },
            moveMediaToFirst1(...agrs){
              console.log('moveMediaToFirst1',...agrs)
            },
            moveMediaToLast1(...agrs){
              console.log('moveMediaToLast1',...agrs)
            },
            selectNext(...agrs){
              console.log('selectNext',...agrs)
            },
            selectPrevious(...agrs){
              console.log('selectPrevious',...agrs)
            },
            selectFirst(...agrs){
              console.log('selectFirst',...agrs)
            },
            selectLast(...agrs){
              console.log('selectLast',...agrs)
            },

            SelectMediaByEntryID(...agrs){
              console.log('SelectMediaByEntryID',...agrs)
            },
            playByTime(...agrs){
              console.log('playByTime',...agrs)
            },
            pause(...agrs){
              console.log('pause',...agrs)
            },
            selectLast(...agrs){
              console.log('selectLast',...agrs)
            },
            fastForward(...agrs){
              console.log('fastForward',...agrs)
            },
            fastRewind(...agrs){
              console.log('fastRewind',...agrs)
            },
            resume(...agrs){
              console.log('resume',...agrs)
            },
            gotoEnd(...agrs){
              console.log('gotoEnd',...agrs)
            },
            gotoStart(...agrs){
              console.log('gotoStart',...agrs)
            },
            stop(...agrs){
              console.log('stop',...agrs)
            },
            switchAudioChannel(...agrs){
              console.log('switchAudioChannel',...agrs)
            },
            switchAudioTrack(...agrs){
              console.log('switchAudioTrack',...agrs)
            },
            switchSubtitle(...agrs){
              console.log('switchSubtitle',...agrs)
            },
            sendVendorSpecificCommand(...agrs){
              console.log('sendVendorSpecificCommand',...agrs)
            },
            getAudioPID(...agrs){
              console.log('getAudioPID',...agrs)
            },
            getAudioPIDs(...agrs){
              console.log('getAudioPIDs',...agrs)
            },
            setAudioPID(...agrs){
              console.log('setAudioPID',...agrs)
            },
            getSubtitlePID(...agrs){
              console.log('getSubtitlePID',...agrs)
            },
            getSubtitlePIDs(...agrs){
              console.log('getSubtitlePIDs',...agrs)
            },
            setSubtitlePID(...agrs){
              console.log('setSubtitlePID',...agrs)
            },
            setVolume(...agrs){
              console.log('setVolume',...agrs)
            },
            getVolume(...agrs){
              console.log('getVolume',...agrs)
            },set(...agrs){
              console.log('set',...agrs)
            },
            get(...agrs){
              console.log('get',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            }, moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            }, moveMediaByOffset1(...agrs){
              console.log('moveMediaByOffset1',...agrs)
            },
            //在要 点击播放 的页面的时候  会一直调用,在点击播放的时候停止
            playFromStart(...agrs){
              console.log('playFromStart',...agrs)
            },
            //点击播放的时候 它会触发 返回 一个对象(播放的信息)
            setSingleMedia(...agrs){
              console.log('setSingleMedia',...agrs)
            },
            setSingleOrPlaylistMode(...agrs){
              console.log('setSingleOrPlaylistMode',...agrs)
            },
            refreshVideoDisplay(...agrs){
              console.log('refreshVideoDisplay',...agrs)
            },
            stop(...agrs){
              console.log('stop',...agrs)
            },
            setVideoDisplayMode(...agrs){
              console.log('setVideoDisplayMode',...agrs)
            },
            getChannelNum(...agrs) {
              console.log('getChannelNum',...agrs)
            },
            setVideoDisplayArea(...agrs){ 
              console.log('setVideoDisplayArea',...agrs)
            },
            getNativePlayerInstanceID(...agrs) {
              console.log('getNativePlayerInstanceID',...agrs)
            },
            setNativeUIFlag(...agrs) {
              console.log('setNativeUIFlag',...agrs)
            },
            setMuteUIFlag(...agrs) {
              console.log('setMuteUIFlag',...agrs)
            },
            setAudioVolumeUIFlag(...agrs) {
              console.log('setAudioVolumeUIFlag',...agrs)
            },
            setAudioTrackUIFlag(...agrs) {
              console.log('setAudioTrackUIFlag',...agrs)
            },
            setProgressBarUIFlag(...agrs) {
              console.log('setProgressBarUIFlag',...agrs)
            },
            setChannelNoUIFlag(...agrs) {
              console.log('setChannelNoUIFlag',...agrs)
            },
            setAllowTrickmodeFlag(...agrs) {
              console.log('setAllowTrickmodeFlag',...agrs)
            },
            joinChannel(...agrs){
              console.log('joinChannel',...agrs)
            },












            //属性
            getVideoDisplayMode(...args){
              console.log('getVideoDisplayMode',...args)
            },
            setVideoDisplayArea (...args){
              console.log('setVideoDisplayArea ',...args)
            },
            getVideoDisplayLeft(...args){
              console.log('getVideoDisplayLeft',...args)
            },
            getVideoDisplayTop(...args){
              console.log('getVideoDisplayTop',...args)
            },
            getVideoDisplayWidth(...args){
              console.log('getVideoDisplayWidth',...args)
            },
            getVideoDisplayHeight(...args){
              console.log('getVideoDisplayHeight',...args)
            },
            setMuteFlag(...args){
              console.log('setMuteFlag',...args)
            },
            setNativeUIFlag(...args){
              console.log('setNativeUIFlag',...args)
            },
            getMuteFlag(...args){
              console.log('getMuteFlag',...args)
            },
            getNativeUIFlag(...args){
              console.log('getNativeUIFlag',...args)
            },
            setMuteUIFlag(...args){
              console.log('setMuteUIFlag',...args)
            },
            getMuteUIFlag(...args){
              console.log('getMuteUIFlag',...args)
            },
            getAudioVolumeUIFlag(...args){
              console.log('getAudioVolumeUIFlag',...args)
            },

            getAudioTrackUIFlag(...args){
              console.log('getAudioTrackUIFlag',...args)
            },
            getProgressBarUIFlag(...args){
              console.log('getProgressBarUIFlag',...args)
            },
            getChannelNoUIFlag(...args){
              console.log('getChannelNoUIFlag',...args)
            },

            setSubtitileFlag(...args){
              console.log('setSubtitileFlag',...args)
            },
            getSubtitileFlag(...args){
              console.log('getSubtitileFlag',...args)
            },
            setVideoAlpha(...args){
              console.log('setVideoAlpha',...args)
            },

            getVideoAlpha(...args){
              console.log('getVideoAlpha',...args)
            },
            setCycleFlag(...args){
              console.log('setCycleFlag',...args)
            },
            getAllowTrickmodeFlag(...args){
              console.log('getAllowTrickmodeFlag',...args)
            },
            setRandomFlag(...args){
              console.log('setRandomFlag',...args)
            },
            getRandomFlag(...args){
              console.log('getRandomFlag',...args)
            },
            setVendorSpecificAttr(...args){
              console.log('setVendorSpecificAttr',...args)
            },
            getVendorSpecificAttr(...args){
              console.log('getVendorSpecificAttr',...args)
            },
            getMediaDuration(...args){
              console.log('getMediaDuration',...args)
            },
            getCurrentPlayTime(...args){
              console.log('getCurrentPlayTime',...args)
            },
            getPlaybackMode(...args){
              console.log('getPlaybackMode',...args)
            },
            getCurrentAudioChannel(...args){
              console.log('getCurrentAudioChannel',...args)
            },
            getSubtitle(...args){
              console.log('getSubtitle',...args)
            },
            getMediaCount(...args){
              console.log('getMediaCount',...args)
            },
            getCurrentIndex(...args){
              console.log('getCurrentIndex',...args)
            },
            getEntryID(...args){
              console.log('getEntryID',...args)
            },
            getPlaylist(...args){
              console.log('getPlaylist',...args)
            },
          }

        })
    });
  }
}

module.exports = IptvMocker
