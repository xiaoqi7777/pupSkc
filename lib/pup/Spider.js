const Page = require('./Page')
const Calculation = require('../Calculation');
const Crypt = require('../Crypt');
const Jump = require('./Jump')

class Browser {
  constructor(pop) {
    this.page = null
    this.url = pop.url
    this.config = pop.config
    this.browser = null
  };
  async init() {
    return new Promise(async (resolve, reject) => {
      const page = await new Page(this.config)
      let { browser } = await page.init();
      this.page = page;
      this.browser = browser;
      await this.page.goto(this.url)
      await this.page.setViewport({
        width: 1920,
        height: 1080
      });

      //操作 跳转到首页
      this.page.on('load', async () => {
        console.log('@@@@@@页面加载')
        //执行跳转页面逻辑
        let testFn = await new Jump({
          page: this.page,
          calculation: Calculation,
          crypt: Crypt,
        })

        //跳转到首页       
        testFn.init().then((a) => {
          console.log(a)
          resolve({ page: this.page, browser: this.browser });
          // console.log('test1--',this.page)
          // let listenFn = new listen({
          // 	page: this.page,
          // 	calculation: Calculation
          // })

          // listenFn.init().then(child => {
          // 	resolve({
          // 		child: child,
          // 		page: this.page
          // 	})
          // })
        }).catch(e => {
          console.log(e)
        })
      })
    })
  };

}
module.exports = Browser