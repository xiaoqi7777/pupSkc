//const IO = require('../../skc.js');
import {IO} from "../../skc.js";
const events = require('events');
import {send_task2transcode} from '../utils'
class Listen extends events {
	constructor(pop) {
		super();
		this.page = pop.page;
		this.child = '';
		this.io = IO;
		this.movieTitle = new Date().getTime();
		this.movieUrl;
		this.tiaojie;
		this.columnid=null;
		this.programid = null;
		this.AjaxUrl = null;
		this.programtype = null;
		this.appointSlice = new pop.calculation()
		this.isBack = null;
		this.on('isBack',data=>{
			this.isBack = data
		})
	}
	get_vod_url(data) {
		if (data.url().indexOf('get_vod_url.jsp') > 0) {
			data.json().then(r => {
				if (this.movieTitle === this.tiaojie && this.movieUrl !== r[0].vodUrl) {
					this.movieTitle = new Date().getTime() + ''
				}
				this.tiaojie = this.movieTitle
				this.movieUrl = r[0].vodUrl
				
				//panduan
				let str = r[0].vodUrl
				let responseUrl = data.url()
				let responseUrlLeng = responseUrl.length
				if(str && (str.includes('4603')) && responseUrlLeng-1 != responseUrl.lastIndexOf('=')){
					return
				}
				console.log('get play url',this.movieUrl)
				
				let movie = {
					url:this.movieUrl,
					name:this.movieTitle
				}
			         send_task2transcode(movie)
			})
		}
	}
	detail_code(data) {
		if (data.url().indexOf('detail_type/movie/detail_code') > 0) {
			//判断 请求的地址 类型
			data.text().then(a => {
				let title = this.appointSlice.sliceData(a, 'movie_name=', '&amp;')
				if (title) {
					this.movieTitle = title
				} else {
					this.movieTitle = new Date().getTime()
				}
				console.log('listen.js正常情况下--电影名字', title)
			})
		}
	}
	get_vod_info(data) {
		if (data.url().indexOf('get_vod_info') > 0) {
			// console.log('---_child 进来了')
			data.text().then(x => {
				this.movieTitle = x[0].data.programName
				console.log('listen.js点播--电影名字', x[0].data.programName)
			})
		}
	}	
	vod_portal(data) {
		if (data.url().indexOf('vod_portal.jsp') > 0) {
			for (let _child of this.page.frames()) {
				if (_child.url().indexOf('frame50/pos') > 0) {
					this.child = _child;
					//发布
					this.emit('send', this.child)
				}
			}
		}
	}
	getResponse(data){
		//console.log('huoqu xiangy lai l -----------')
		// 点播 截取的 响应地址 http://101.95.74.121:8084/iptvepg/frame50/ad_play.jsp?adindex=1&adcount=1&positionid=01001000
		if(data.url().includes('frame50/ad_play.jsp?adindex=1&adcount=')){
			// data.json() 对付 返回的json 和 data.text() 对付 返回的html 
			data.text().then(a=>{
				this.columnid = this.appointSlice.sliceData(a, 'columnid=', '&')
				this.programid = this.appointSlice.sliceData(a, 'programid=', '&')
				this.programtype = this.appointSlice.sliceData(a, 'programtype=', '&')
				this.AjaxUrl = this.appointSlice.getVodUrl(this.columnid,this.programid,this.programtype,0) 
				//获取到值之后 在js环境下输入一段请求代码
				// this.page.evaluate(url=>this.sendAjax(url),this.AjaxUrl)
				this.page.evaluate(url=>{
						xmlHttp = new XMLHttpRequest();
						xmlHttp.onreadystatechange = (data) => {
							if(xmlHttp.responseText){
								console.log('-',JSON.parse(xmlHttp.responseText)) 
							}
						};
						xmlHttp.open("GET", 'http://101.95.74.121:8084/iptvepg/frame50/' + url, true);
						xmlHttp.send(null);
				},(this.AjaxUrl))

			},err=>{
				console.log('listen.jserr',err)
			})}
	}
	interceptBack(data){
		if (data.url().includes('bg_index_club_new2')) {
			this.emit('firstPage','on')
		}
	}
	 // 首页 地址---------- http://101.95.74.121:8084/iptvepg/function/frameset_builder.jsp
	 // 大片 地址---------- http://101.95.74.121:8084/iptvepg/frame50/frame_portal.jsp
	 //地址---------- http://101.95.74.121:8084/iptvepg/frame50/indexlog.jsp
	 //地址---------- http://101.95.74.121:8084/iptvepg/frame50/frame_portal.jsp?pageParams=2,0,0,0,0,0,0
	async init() {
		// 处理 若是首页不执行back
		this.page.on('framedetached',()=>{
			for (let _child of this.page.frames()) {
				console.log('地址----------',_child.url())
			}
			//当 iframe 导航到新的 url 时触发。
			this.emit('firstPage','ok')
		})
		console.log('keng~~~~~~~~~~~~~`')
		// this.page.on('framedetached',()=>{
		// 	//当 iframe 从页面移除的时候触发。
		// 	console.log('移出 framedetached')
		// })
		// this.page.on('frameattached',()=>{
		// 	//当 iframe 加载的时候触发。
		// 	console.log('加载 frameattached')
		// })

		let arr = []
		console.log('listen.js-init进来了1', this.page.url())
		return new Promise((resolve, reject) => {
			this.page.on('response', async (data) => {
				this.interceptBack(data)
				this.getResponse(data)
				this.get_vod_url(data)
				this.detail_code(data)
				this.get_vod_info(data)

				// this.on('isBack',async a=>{
					// if(this.isBack === 'back'){
					// 	if (data.url().includes('bg_index_club_new2')) {
					// 		this.isBack = 'ok'
					// 		return
					// 	}
					// 	if(data.url().includes('category_hq_11302164')){
					// 		await this.page.evaluate(() => {
					// 			window.history.back()
					// 		})
					// 	}
					// 	if(data.url().includes('data:image/svg+xml;base64,PD94bWwgdmVyc2lvb')){
					// 		await this.page.evaluate(() => {
					// 			window.history.back()
					// 		})
					// 	}
					// }
				// })
				let rs = this.vod_portal(data)
				
				//返回this  做订阅
				resolve(this)
			})
		})
	}
}
module.exports = Listen

