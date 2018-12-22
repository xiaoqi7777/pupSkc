const puppeteer = require('puppeteer');
const crypto = require('crypto');
const CURSOR_MOVE_WAITTIME = 300
import root_logger from "../../logger";
var pty = require("pty.js");
const logger = root_logger.child({
  tag: "iptvMocker"
});


function sleep_wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function crypt_des(param) {
  var key = new Buffer(param.key);
  var iv = new Buffer(param.iv ? param.iv : 0)
  var plaintext = param.plaintext
  var alg = param.alg
  var autoPad = param.autoPad

  //encrypt  
  var cipher = crypto.createCipheriv(alg, key, iv);
  cipher.setAutoPadding(autoPad) //default true      
  var ciph = cipher.update(plaintext, 'utf8', 'hex');
  ciph += cipher.final('hex');
  // console.log(alg, ciph)  
  return ciph
};


// 需要对单引号做判断 appoint传入的'或者"
function appointSlice(data, target, appoint) {
  //data = form    target = 'action=' appoint = '\''
  let leng = data.indexOf(target);
  //从target开始查找
  let startIndex = data.indexOf(appoint, leng);
  // console.log(startIndex,leng)

  let startNext = data.indexOf(appoint, startIndex + 1);
  let sliceData = data.slice(startIndex + 1, startNext);
  return sliceData;
};

//截取一段 数据 data  起点 target1 结束点target2
function sliceData(data, target1, target2) {
  let target = data.indexOf(target1)
  let targetLenght = target1.length
  //截取起始位子
  let targetStart = target + targetLenght
  // 结束位子
  let targetEnd = data.indexOf(target2, targetStart)

  let sliceData = data.slice(targetStart, targetEnd)
  // console.log('sliceData', targetStart, targetEnd)
  return sliceData
}

function keyFn(str) {
  if (str.length >= 24) {
    return str.substr(0, 24)
  } else {
    let leng = 24 - str.length
    let zeroString = '0'.repeat(leng)
    return str.toString().concat(zeroString)
  }
}

function getVodUrl(columnId, programId, vodType, breakPoint) {
  return "get_vod_url.jsp?columnId=" + columnId + "&programId=" + programId + "&vodType=" + vodType + "&breakPoint=" + breakPoint;
}

function tmpRandom() {
  return `${(Math.random()*10000000).toString().substr(0,7)}`
}



class IptvMocker {

  constructor(conf) {
    this.headless = conf.headless;
    this.url = conf.url;
    this.browser = null
    this.page = null
    this.browserWSEndpoint = null;
    this.pageProcessor = [];
    this.responseData = null
    this.preventBack = false
    this.appointSlice = appointSlice
    this.sliceData = sliceData
    this.getVodUrl = getVodUrl
    //
  };

  addPageProcessor(urlReg, onLoad, onResponse) {
    this.pageProcessor.push({
      urlReg,
      onLoad,
      onResponse
    })
  };

  getScreenshot() {
    return this.screenshot
  }

  getChannelList() {
    return this.ChannelList
  }

  removePageProcessor(urlReg, url) {
    for (let i = 0; i < this.pageProcessor.length; i++) {
      let p = this.pageProcessor[i];
      if (p.urlReg.test(url)) {
        logger.info(`remove url process for ${url}`);
        this.pageProcessor.splice(i, 1);
      }
    }
  };

  async waitFor(ms) {
    await this.page.waitFor(ms);
  };

  async auth() {
    const hmtlDom = await this.page.content()

    let key = appointSlice(hmtlDom, 'Authentication.CTCGetAuthInfo(', "\'")
    let userID = appointSlice(hmtlDom, 'IptvAuthenticationForm.userID', '\"')
    let Mode = appointSlice(hmtlDom, 'IptvAuthenticationForm.Mode', '\"')
    let ChannelID = appointSlice(hmtlDom, 'IptvAuthenticationForm.ChannelID', '\"')
    let STBAdminStatus = appointSlice(hmtlDom, 'IptvAuthenticationForm.STBAdminStatus', '\"')
    let MiniPlatform = appointSlice(hmtlDom, 'IptvAuthenticationForm.MiniPlatform', '\"')
    let FCCSupport = appointSlice(hmtlDom, 'IptvAuthenticationForm.FCCSupport', '\"')
    let AudioADOn = appointSlice(hmtlDom, 'IptvAuthenticationForm.AudioADOn', '\"')
    let DynamicAuthIP = appointSlice(hmtlDom, 'IptvAuthenticationForm.DynamicAuthIP', '\"')
    let action = appointSlice(hmtlDom, 'IptvAuthenticationForm.action', '\"')
    let IP = '192.168.1.155'
    let MAC = '00-01-6C-06-A6-29'
    let userId = '75720573'
    let stdId = '0010029900D04940000180A1D7F3599D'
    let password = '123456'
    let cskey = keyFn(password)
    let reserve = ''
    let EncryToken = crypt_des({
      alg: 'des-ede3', //3des-ecb  
      autoPad: true,
      key: `${cskey}`,
      plaintext: `${tmpRandom()}$${key}$${userId}$${stdId}$${IP}$${MAC}$${reserve}$CTC`,
      iv: null
    }).toLocaleUpperCase();

    //获取引号里面的东西  截取单个 data 是一串原始字符串  target 是appoint前面的标示   appoint是要两边的引号
    let obj = {
      EncryToken: EncryToken,
      userID: userID,
      Mode: Mode,
      ChannelID: ChannelID,
      STBAdminStatus: STBAdminStatus,
      MiniPlatform: MiniPlatform,
      FCCSupport: FCCSupport,
      AudioADOn: AudioADOn,
      DynamicAuthIP: DynamicAuthIP,
      action: action
    };

    //进入js环境 更改表单数据 提交
    let auth_ret = await this.page.evaluate(obj => {
      if (document.IptvAuthenticationForm) {
        document.IptvAuthenticationForm.authenticator.value = obj.EncryToken;
        document.IptvAuthenticationForm.userID.value = obj.userID;
        document.IptvAuthenticationForm.Mode.value = obj.Mode;
        document.IptvAuthenticationForm.ChannelID.value = obj.ChannelID;
        document.IptvAuthenticationForm.STBAdminStatus.value = obj.STBAdminStatus;
        document.IptvAuthenticationForm.MiniPlatform.value = obj.MiniPlatform;
        document.IptvAuthenticationForm.FCCSupport.value = obj.FCCSupport;
        document.IptvAuthenticationForm.AudioADOn.value = obj.AudioADOn;
        document.IptvAuthenticationForm.DynamicAuthIP.value = obj.DynamicAuthIP;
        document.IptvAuthenticationForm.action = obj.action;
        document.IptvAuthenticationForm.submit();
        return Promise.resolve(true);
      }
    }, obj).catch((e) => {
      logger.info(`authenticate evalute exception ${e}`);
    });

    if (auth_ret) {
      logger.info('authen ok...');
    } else {
      logger.info('authen fail...');
      return false;
    }

    let is_home_loaded = false;
    let thz = this;
    await this.page.on('load', async () => {
      logger.info(`-- ${this.page.url()} load`);
      if (this.page.url().indexOf('frameset_builder') > -1) {
        setInterval(async() => {
          let r = await this.page.screenshot({
            path: 'screenshot.jpeg',
            type: 'jpeg',
            clip: {
              x: 0,
              y: 0,
              width: 1280,
              height: 720
            },
            encoding: "base64"
          })
          this.screenshot = r
        }, 1000)
      }
      for (let _child of this.page.frames()) {
        logger.info(`- load ${_child.url()}`);
      }
      for (let i = 0; i < this.pageProcessor.length; i++) {
        let p = this.pageProcessor[i];
        if (p.urlReg.test(this.page.url())) {
          if (p.onLoad) {
            p.onLoad(this.page.url(), thz);
            return;
          }
        }
      }

      if (this.page.url().indexOf('iptv3a/hdLogin') > 0) {
        this.parseLiveChannel();
      }

      // 页面首页的地址 关键字frameset_builder
      if (this.page.url().indexOf('frameset_builder') > -1) {
        logger.info('home page load ok');
        is_home_loaded = true;
      }

    });
    try {
      this.page.on('framedetached', () => {
        this.preventBack = true
        //当 iframe 导航到新的 url 时触发。
        console.log('页面跳动了-------------')
      })   
    } catch (error) {
      logger.info('on framedetached error',error)
    }

    this.page.on('response', async (resp) => {
      if (!/\.jpg|\.png$/.test(resp.url())) {
        logger.info(`-  ${resp.url()} response`);
      }
      for (let i = 0; i < this.pageProcessor.length; i++) {
        let p = this.pageProcessor[i];
        if (p.urlReg.test(resp.url())) {
          if (p.onResponse) {
            await p.onResponse(resp.url(), resp, thz);
          }
        }
      }

    });

    while (!is_home_loaded) {
      await sleep_wait(500);
    }

  }

  async parseLiveChannel() {
    // 获取 直播列表
    let channels = await this.page.evaluate(() => {
      return Promise.resolve(channels)
    });

    channels = channels.map(item => {
      let newArr = {}
        newArr['ChannelName'] = appointSlice(item, 'ChannelName=', '"');
        newArr['ChannelURL'] = appointSlice(item, 'ChannelURL=', '"');
        newArr['UserChannelID'] = appointSlice(item, 'UserChannelI', '"')
      return newArr
    });

    this.ChannelList = channels
    // console.log('+++++++',this.ChannelList)
    logger.info(`total live channel's num ${channels.length}`);
  }

  defaultKeyProcess() {
    console.log('----------+-+')
    this.moveRight = async (step) => {
      console.log(`move right ${step}`);
      for (let i = 0; i < step; i++) {
        await this.page.keyboard.press("ArrowRight");
        await this.page.waitFor(CURSOR_MOVE_WAITTIME);
      }
    };

    this.moveLeft = async (step) => {
      console.log(`move left ${step}`);
      for (let i = 0; i < step; i++) {
        await this.page.keyboard.press("ArrowLeft");
        await this.page.waitFor(CURSOR_MOVE_WAITTIME);
      }
    };

    this.moveUp = async (step) => {
      console.log(`move up ${step}`);
      for (let i = 0; i < step; i++) {
        await this.page.keyboard.press("ArrowUp");
        await this.page.waitFor(CURSOR_MOVE_WAITTIME);
      }
    };

    this.moveDown = async (step) => {
      console.log(`move down ${step}`);
      for (let i = 0; i < step; i++) {
        await this.page.keyboard.press("ArrowDown");
        await this.page.waitFor(CURSOR_MOVE_WAITTIME);
      }
    };

    this.pressOkKey = async () => {
      console.log(`enter`);
      await this.page.keyboard.press("Enter");
      await this.page.waitFor(CURSOR_MOVE_WAITTIME);
    };

    this.goBack = async () => {
      console.log(`goBack`)
      //首页不让返回
      if(this.preventBack){
        await this.page.evaluate(() => {
          window.history.back()
        })
      }
      
    }
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    this.browserWSEndpoint = this.browser.wsEndpoint();
    this.page = await this.browser.newPage()

    await this.page.setViewport({
      width: 1920,
      height: 1080
    });

    // 注入全局方法
    await this.global();

    await this.page.goto(this.url)
    console.log(`goto the home page`);
    //操作 跳转到首页
    await this.page.waitForNavigation();
    console.log(`finished navigation`)
    //增加 控制按键
    this.defaultKeyProcess();
    return this;
  }

  //全局修改属性
  async global() {
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'Authentication', {
          value: {
            CTCSetConfig(...agrs) {
              console.log('page.js-改写的方法回调', ...agrs)
            },
            CTCStartUpdate() {
              return;
            },
            CTCGetConfig() {
              console.log('CTCGetConfig')
            }
            // CTCGetAuthInfo(...agrs){
            //   console.log('CTCGetAuthInfo',...agrs)
            // }
          }
        }),
        Object.defineProperty(window, 'MediaPlayer', {
          value: (
            class MediaPlayer {
              constructor() {}
            }
          )
        }),
        Object.defineProperty(window, 'NotifyCation', {
          value: (
            function SetLogInfo() {
              console.log(arguments, '+++++++')
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
        Object.defineProperty(window, 'jbAdTid2', {
          value: ('123')
        }),
        Object.defineProperty(window, 'mp', {
          value: {
            //方法
            bindNativePlayerInstance(...agrs) {
              console.log('bindNativePlayerInstance', ...agrs)
            },
            initMediaPlayer(...agrs) {
              console.log('initMediaPlayer', ...agrs)
            },
            releaseMediaPlayer(...agrs) {
              console.log('releaseMediaPlayer', ...agrs)
            },
            addSingleMedia(...agrs) {
              console.log('addSingleMedia', ...agrs)
            },
            addBatchMedia(...agrs) {
              console.log('addBatchMedia', ...agrs)
            },
            leaveChannel(...agrs) {
              console.log('leaveChannel', ...agrs)
            },
            removeMediaByEntryID(...agrs) {
              console.log('removeMediaByEntryID', ...agrs)
            },
            moveMediaByIndex(...agrs) {
              console.log('moveMediaByIndex', ...agrs)
            },
            moveMediaByOffset(...agrs) {
              console.log('moveMediaByOffset', ...agrs)
            },
            moveMediaByIndex1(...agrs) {
              console.log('moveMediaByIndex1', ...agrs)
            },
            moveMediaToNext(...agrs) {
              console.log('moveMediaToNext', ...agrs)
            },
            moveMediaToPrevious(...agrs) {
              console.log('moveMediaToPrevious', ...agrs)
            },
            moveMediaToFirst1(...agrs) {
              console.log('moveMediaToFirst1', ...agrs)
            },
            moveMediaToLast1(...agrs) {
              console.log('moveMediaToLast1', ...agrs)
            },
            selectNext(...agrs) {
              console.log('selectNext', ...agrs)
            },
            selectPrevious(...agrs) {
              console.log('selectPrevious', ...agrs)
            },
            selectFirst(...agrs) {
              console.log('selectFirst', ...agrs)
            },
            selectLast(...agrs) {
              console.log('selectLast', ...agrs)
            },

            SelectMediaByEntryID(...agrs) {
              console.log('SelectMediaByEntryID', ...agrs)
            },
            playByTime(...agrs) {
              console.log('playByTime', ...agrs)
            },
            pause(...agrs) {
              console.log('pause', ...agrs)
            },
            selectLast(...agrs) {
              console.log('selectLast', ...agrs)
            },
            fastForward(...agrs) {
              console.log('fastForward', ...agrs)
            },
            fastRewind(...agrs) {
              console.log('fastRewind', ...agrs)
            },
            resume(...agrs) {
              console.log('resume', ...agrs)
            },
            gotoEnd(...agrs) {
              console.log('gotoEnd', ...agrs)
            },
            gotoStart(...agrs) {
              console.log('gotoStart', ...agrs)
            },
            switchAudioChannel(...agrs) {
              console.log('switchAudioChannel', ...agrs)
            },
            switchAudioTrack(...agrs) {
              console.log('switchAudioTrack', ...agrs)
            },
            switchSubtitle(...agrs) {
              console.log('switchSubtitle', ...agrs)
            },
            sendVendorSpecificCommand(...agrs) {
              console.log('sendVendorSpecificCommand', ...agrs)
            },
            getAudioPID(...agrs) {
              console.log('getAudioPID', ...agrs)
            },
            getAudioPIDs(...agrs) {
              console.log('getAudioPIDs', ...agrs)
            },
            setAudioPID(...agrs) {
              console.log('setAudioPID', ...agrs)
            },
            getSubtitlePID(...agrs) {
              console.log('getSubtitlePID', ...agrs)
            },
            getSubtitlePIDs(...agrs) {
              console.log('getSubtitlePIDs', ...agrs)
            },
            setSubtitlePID(...agrs) {
              console.log('setSubtitlePID', ...agrs)
            },
            setVolume(...agrs) {
              console.log('setVolume', ...agrs)
            },
            getVolume(...agrs) {
              console.log('getVolume', ...agrs)
            },
            set(...agrs) {
              console.log('set', ...agrs)
            },
            get(...agrs) {
              console.log('get', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            moveMediaByOffset1(...agrs) {
              console.log('moveMediaByOffset1', ...agrs)
            },
            //在要 点击播放 的页面的时候  会一直调用,在点击播放的时候停止
            playFromStart(...agrs) {
              console.log('playFromStart', ...agrs)
              return
            },
            //点击播放的时候 它会触发 返回 一个对象(播放的信息)
            setSingleMedia(...agrs) {
              console.log('setSingleMedia', ...agrs)
            },
            setSingleOrPlaylistMode(...agrs) {
              console.log('setSingleOrPlaylistMode', ...agrs)
            },
            refreshVideoDisplay(...agrs) {
              console.log('refreshVideoDisplay', ...agrs)
            },
            stop(...agrs) {
              console.log('stop', ...agrs)
            },
            setVideoDisplayMode(...agrs) {
              console.log('setVideoDisplayMode', ...agrs)
            },
            getChannelNum(...agrs) {
              console.log('getChannelNum', ...agrs)
            },
            setVideoDisplayArea(...agrs) {
              console.log('setVideoDisplayArea', ...agrs)
            },
            getNativePlayerInstanceID(...agrs) {
              console.log('getNativePlayerInstanceID', ...agrs)
            },
            setNativeUIFlag(...agrs) {
              console.log('setNativeUIFlag', ...agrs)
            },
            setMuteUIFlag(...agrs) {
              console.log('setMuteUIFlag', ...agrs)
            },
            setAudioVolumeUIFlag(...agrs) {
              console.log('setAudioVolumeUIFlag', ...agrs)
            },
            setAudioTrackUIFlag(...agrs) {
              console.log('setAudioTrackUIFlag', ...agrs)
            },
            setProgressBarUIFlag(...agrs) {
              console.log('setProgressBarUIFlag', ...agrs)
            },
            setChannelNoUIFlag(...agrs) {
              console.log('setChannelNoUIFlag', ...agrs)
            },
            setAllowTrickmodeFlag(...agrs) {
              console.log('setAllowTrickmodeFlag', ...agrs)
            },
            joinChannel(...agrs) {
              console.log('joinChannel', ...agrs)
            },
            //属性
            getVideoDisplayMode(...args) {
              console.log('getVideoDisplayMode', ...args)
            },
            setVideoDisplayArea(...args) {
              console.log('setVideoDisplayArea ', ...args)
            },
            getVideoDisplayLeft(...args) {
              console.log('getVideoDisplayLeft', ...args)
            },
            getVideoDisplayTop(...args) {
              console.log('getVideoDisplayTop', ...args)
            },
            getVideoDisplayWidth(...args) {
              console.log('getVideoDisplayWidth', ...args)
            },
            getVideoDisplayHeight(...args) {
              console.log('getVideoDisplayHeight', ...args)
            },
            setMuteFlag(...args) {
              console.log('setMuteFlag', ...args)
            },
            setNativeUIFlag(...args) {
              console.log('setNativeUIFlag', ...args)
            },
            getMuteFlag(...args) {
              console.log('getMuteFlag', ...args)
            },
            getNativeUIFlag(...args) {
              console.log('getNativeUIFlag', ...args)
            },
            setMuteUIFlag(...args) {
              console.log('setMuteUIFlag', ...args)
            },
            getMuteUIFlag(...args) {
              console.log('getMuteUIFlag', ...args)
            },
            getAudioVolumeUIFlag(...args) {
              console.log('getAudioVolumeUIFlag', ...args)
            },

            getAudioTrackUIFlag(...args) {
              console.log('getAudioTrackUIFlag', ...args)
            },
            getProgressBarUIFlag(...args) {
              console.log('getProgressBarUIFlag', ...args)
            },
            getChannelNoUIFlag(...args) {
              console.log('getChannelNoUIFlag', ...args)
            },

            setSubtitileFlag(...args) {
              console.log('setSubtitileFlag', ...args)
            },
            getSubtitileFlag(...args) {
              console.log('getSubtitileFlag', ...args)
            },
            setVideoAlpha(...args) {
              console.log('setVideoAlpha', ...args)
            },

            getVideoAlpha(...args) {
              console.log('getVideoAlpha', ...args)
            },
            setCycleFlag(...args) {
              console.log('setCycleFlag', ...args)
            },
            getAllowTrickmodeFlag(...args) {
              console.log('getAllowTrickmodeFlag', ...args)
            },
            setRandomFlag(...args) {
              console.log('setRandomFlag', ...args)
            },
            getRandomFlag(...args) {
              console.log('getRandomFlag', ...args)
            },
            setVendorSpecificAttr(...args) {
              console.log('setVendorSpecificAttr', ...args)
            },
            getVendorSpecificAttr(...args) {
              console.log('getVendorSpecificAttr', ...args)
            },
            getMediaDuration(...args) {
              console.log('getMediaDuration', ...args)
            },
            getCurrentPlayTime(...args) {
              console.log('getCurrentPlayTime', ...args)
            },
            getPlaybackMode(...args) {
              console.log('getPlaybackMode', ...args)
            },
            getCurrentAudioChannel(...args) {
              console.log('getCurrentAudioChannel', ...args)
            },
            getSubtitle(...args) {
              console.log('getSubtitle', ...args)
            },
            getMediaCount(...args) {
              console.log('getMediaCount', ...args)
            },
            getCurrentIndex(...args) {
              console.log('getCurrentIndex', ...args)
            },
            getEntryID(...args) {
              console.log('getEntryID', ...args)
            },
            getPlaylist(...args) {
              console.log('getPlaylist', ...args)
            },
          }

        })
    });
  }
}

module.exports = IptvMocker