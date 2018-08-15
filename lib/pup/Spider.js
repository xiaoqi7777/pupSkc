const Page = require('./Page')
const Calculation = require('../Calculation');
const Crypt = require('../Crypt');
const Jump = require('./Jump')

class Browser {
	constructor(pop) {
		this.page = null
		this.url = pop.url
		this.config = pop.config
	};
	async init() {
		return new Promise(async (resolve, reject) => {
			const page = await new Page(this.config)
			this.page = await page.init()
			await this.page.goto(this.url)
			await this.page.setViewport({
				width: 1920,
				height: 1080
			});

			//操作 跳转到首页
			await this.page.once('load', async () => {
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
					resolve({page: this.page})
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