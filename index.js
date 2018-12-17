const Spider = require('./src/class/Spider');
const config = require('./src/config/config');
const socket_fn = require('./src/class/socket_fn');
const Calculation = require('./src/modify/Calculation');

const listen = require('./src/climbPlayUrl/listen');
const ClimPlayUrl = require('./src/climbPlayUrl')

const koa = require('koa');
const Router = require('koa-router');
const http = require('http');
const socketIo = require('socket.io');

const app = new koa();
const server = http.createServer(app.callback());
const io = socketIo(server);
const router = new Router();
const spider = new Spider({
	...config,
	io: io
})

let child;
let page;
let listenFn;
let listenInte;
let IsBack = null;
let testFn;
let pageData
let ischangeIframe;

let climPlayUrl;

	async function init(){
		console.log('index.js-connection 连接成功')
    let data  = await spider.init()
    pageData = data.pageData
    testFn = data.testFn

    page = pageData.page

		//page对象监听事件，判断是否需要返回child对象
		listenFn = await new listen({
								page: page,
								calculation: Calculation
							})
		listenInte = await listenFn.init()
		listenInte.on('send',(data)=>{
			child = data
    })	
    console.log('-----------------------------')
    
		// 初始化的时候 就传入listenInte实例 在里面做监听
		climPlayUrl = await new ClimPlayUrl({
			page,
			listenInte
    })
    console.log('-----------------------------')
		await page.waitFor(1000);
    console.log('-----++++++++++++++++++++++++++')
    
		await page.waitFor(9000);
    console.log('+++++++++++++++++++++++++++++++')
    try {
      await	climPlayUrl.checkPageUrl(child,listenInte)
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