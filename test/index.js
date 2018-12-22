const IptvAuth = require('./src/class/iptvAuth');
const config = require('./src/config/config');
const Calculation = require('./src/modify/Calculation');

const Listen = require('./src/climbPlayUrl/listenResponse');
const ClimPlayUrl = require('./src/climbPlayUrl')

const koa = require('koa');
const Router = require('koa-router');
const http = require('http');
const socketIo = require('socket.io');

const app = new koa();
const server = http.createServer(app.callback());
const io = socketIo(server);
const router = new Router();
const spider = new IptvAuth({
	...config,
	io: io
})

let child;
let page;
let listenObj;
let listenResponse;
let IsBack = null;

let climPlayUrl;

	async function init(){
		console.log('index.js-connection 连接成功')
    let data  = await spider.init()
    page = data.pageData.page

		//page对象监听事件，判断是否需要返回child对象
		listenObj = await new Listen({
								page: page,
								calculation: Calculation
							})
		listenResponse = await listenObj.init()
		listenResponse.on('send',(data)=>{
			child = data
    })	
		// 初始化的时候 就传入listenInte实例 在里面做监听
		climPlayUrl = await new ClimPlayUrl({
			page,
			listenResponse
    })
		await page.waitFor(1000);
    
		await page.waitFor(9000);
    try {
      await	climPlayUrl.checkPageUrl(child,listenResponse)
    } catch (error) {
      console.log('error',error)
    }

	}
	init()
//路由配置
router.get('/', (x, next) => {
	x.body = '123'
})

app.use(router.routes(), router.allowedMethods())
server.listen(3000, '0.0.0.0')