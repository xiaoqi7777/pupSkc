
import { SOCKET } from '../../skc';
import { send_task2transcode } from '../utils';

class Listen {
  constructor(pop) {
    this.page = pop.page;
    this.child = '';
    this.calculation = pop.calculation
    this.io;
    this.movieTitle;
    this.movieUrl;
  }
  init() {

    this.io = SOCKET;

    return new Promise((resolve, reject) => {
      let that = this;
      console.log('init进来了1', this.page.url())
      // console.log('test2--',this.page)


      this.page.on('response', (data) => {
        if (data.url().indexOf('vod_portal.jsp') > 0) {
          function dumpFrameTree(frame, indent) {
            console.log('进来了1')
            //child 指 当前操作的frame
            for (let _child of frame.childFrames()) {
              if (_child.url().indexOf('frame50/pos') > 0) {
                that.child = _child;
                // console.log('---------',that.child)
                resolve(that.child)
                // console.log('that.child1',that.child)
                setTimeout(() => {
                  _child.evaluate(() => {
                    Object.defineProperty(window, 'infoState', {
                      value: 1
                    })
                  })
                }, 1000)
              }
            }
          }
          //   }
          dumpFrameTree(that.page.mainFrame(), '+++?')
          console.log('you**')
        }
        //点播 截获标题
        if (data.url().indexOf('get_vod_info') > 0) {
          console.log('---_child 进来了')
          data.json().then(x => {
            console.log('点播--电影名字', x[0].data.programName)
          })
        }
        //单个电影 播放详情页 detail_type/movie/detail_code
        if (data.url().indexOf('detail_type/movie/detail_code') > 0) {
          //判断 请求的地址 类型
          data.text().then(data => {
            const appointSlice = new this.calculation()
            let title = appointSlice.sliceData(data, 'movie_name=', '&amp;')
            this.movieTitle = title
            console.log('正常情况下--电影名字', title)
          })
          // data.buffer().then((data) => {
          //     // console.log('------bufferbufferbuffer------',typeof data)
          //     fs.writeFile('./sg/sg' + (n++) + '.js', data)
          // })
        }
        if (data.url().indexOf('get_vod_url.jsp') > 0) {
          data.json().then(async (data) => {
            this.movieUrl = data[0].vodUrl
            let movie_data = {
              url: this.movieUrl,
              name: this.movieTitle
            };
            //调用下发转码任务方法，然后发送观看地址到前台
            await send_task2transcode(movie_data);
            // this.io.emit('movie_data', {
            //   url: this.movieUrl,
            //   name: this.movieTitle
            // })
            console.log('播放地址', data[0].vodUrl)
          })
        }
      })
    })

  }
}
module.exports = Listen