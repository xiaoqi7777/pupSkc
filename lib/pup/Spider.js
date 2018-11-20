const Page = require('./Page')
const Calculation = require('../Calculation');
const Crypt = require('../Crypt');
const Jump = require('./Jump')

class Browser {
	constructor(pop) {
		this.page = null
		this.url = pop.url
		this.config = pop.config
		this.io = pop.io
	};
	async init() {
		// return new Promise(async (resolve, reject) => {
			//Page组件在这儿初始化,进行一些全局配置
			const page = await new Page(this.config)
			this.page = await page.init()
			await this.page.goto(this.url)

			//操作 跳转到首页
			await this.page.waitForNavigation()
			console.log('Spider.js-@@@@@@页面加载')
				//执行跳转页面逻辑
			let testFn = await new Jump({
				page: this.page,
				calculation: Calculation,
				crypt: Crypt,
				io: this.io
			})

			//跳转到首页 
			await	testFn.init()
			return this.page
	};

}
module.exports = Browser
