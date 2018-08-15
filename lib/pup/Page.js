const puppeteer = require('puppeteer');

class Page {
  constructor(pop) {
    this.isShow = pop.isShow
    this.browser = null
    this.page = null

  }
  async init() {
    this.browser = await puppeteer.launch({
      headless: this.isShow
    })
    this.page = await this.browser.newPage()
    await this.global()
    return this.page
  }
  //全局修改属性
  async global() {
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'Authentication', {
          value: {
            CTCSetConfig(key, value) {
              console.log(key, value)
            },
            CTCStartUpdate() {
              return;
            },
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
                console.log('13')
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
                console.log('37777777777')
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
              console.log('Utility')
              return;
            }
          )
        }),
        Object.defineProperty(window, 'mp', {
          value: {
            getNativePlayerInstanceID() {
              return;
            },
            setNativeUIFlag() {
              return;
            },
            setMuteUIFlag() {
              return;
            },
            setAudioVolumeUIFlag() {
              return;
            },
            setAudioTrackUIFlag() {
              return;
            },
            setProgressBarUIFlag() {
              return;
            },
            setChannelNoUIFlag() {
              return;
            },
            setAllowTrickmodeFlag() {
              return;
            },
          }

        })
    });
  }
}

module.exports = Page