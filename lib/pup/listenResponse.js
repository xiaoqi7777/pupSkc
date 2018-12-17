//const IO = require('../../skc.js');
import {IO} from "../../skc.js";
const events = require('events');
import { send_task2transcode } from '../utils'
class Listen extends events {
	constructor(pop) {
		super();
		this.page = pop.page;
		this.child = '';
		this.io = IO;
		this.movieTitle = new Date().getTime();
		this.movieUrl;
		this.tiaojie;
		this.columnid = null;
		this.programid = null;
		this.AjaxUrl = null;
		this.programtype = null;
		this.appointSlice = new pop.calculation()
		this.isBack = null;
		this.isReload = true;
		this.isEmitNumber = 0;
		this.on('isBack', data => {
			this.isBack = data
			this.isEmitNumber = 0
		})
	}

	async get_vod_url(data) {
		if (data.url().indexOf('get_vod_url.jsp') > 0) {
			let getData = await data.json()
			if (this.movieTitle === this.tiaojie && this.movieUrl !== getData[0].vodUrl) {
				this.movieTitle = new Date().getTime() + ''
			}
			this.tiaojie = this.movieTitle
			this.movieUrl = getData[0].vodUrl

			let str = getData[0].vodUrl
			let responseUrl = data.url()
			let responseUrlLeng = responseUrl.length
			if (str && (str.includes('4603')) && responseUrlLeng - 1 != responseUrl.lastIndexOf('=')) {
				return
			}

			let movie = {
				url: this.movieUrl,
				name: this.movieTitle
			}

			if (this.isEmitNumber === 0) {
				this.isEmitNumber = 1;
				send_task2transcode(movie)
			}

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
				console.log('listen.js 普通电视 --电影名字', title)
			})
		}
	}

	get_vod_info(data) {
		if (data.url().indexOf('get_vod_info') > 0) {
			data.text().then(x => {
				this.movieTitle = x[0].data.programName
				console.log('listen.js 点播--电影名字', this.movieTitle)
			})
		}
	}

	emitVodFrame(data) {
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

	getResponse(data) {
		if (data.url().includes('frame50/ad_play.jsp?adindex=1&adcount=')) {
			data.text().then(a => {
				this.columnid = this.appointSlice.sliceData(a, 'columnid=', '&')
				this.programid = this.appointSlice.sliceData(a, 'programid=', '&')
				this.programtype = this.appointSlice.sliceData(a, 'programtype=', '&')
				this.AjaxUrl = this.appointSlice.getVodUrl(this.columnid, this.programid, this.programtype, 0)

				//获取到值之后 在js环境下输入一段请求代码
				this.page.evaluate(url => {
					xmlHttp = new XMLHttpRequest();
					xmlHttp.onreadystatechange = (data) => {
						if (xmlHttp.responseText) {
							console.log('listen.js-', JSON.parse(xmlHttp.responseText))
						}
					};
					xmlHttp.open("GET", 'http://101.95.74.121:8084/iptvepg/frame50/' + url, true);
					xmlHttp.send(null);
				}, (this.AjaxUrl))

			}, err => {
				console.log('listen.js-err', err)
			})
		}
	}

	interceptBack(data) {
		if (data.url().includes('bg_index_club_new2')) {
			this.emit('firstPage', 'on')
			this.io.emit('isBack', {
				isBack: 'on'
			})
		}
	}
	
	async isGoBack(data) {
		if (this.isBack === 'back') {
			if (data.url().includes('5CYII=') || this.isReload) {
				this.isReload = false

				await this.page.evaluate(() => {
					location.reload()
				})
			}

		}
	}

	async autoReload(data) {
		if (data.url().includes('http://222.68.210.43:8080/static/es/entries/shmgtv.html')) {
			await this.page.evaluate(() => {
				location.reload()
			})
		}
	}

	async init() {
		// 处理 若是首页不执行back
		this.page.on('framedetached', () => {
			//当 iframe 导航到新的 url 时触发。
			this.emit('firstPage', 'ok')
			this.io.emit('isBack', {
				isBack: 'ok'
			})
		})

		return new Promise((resolve, reject) => {
			this.page.on('response', async (data) => {
				try {
					// 拦截返回处理
					this.interceptBack(data)
					// 截获response
					this.getResponse(data)
					// 获取播放地址
					this.get_vod_url(data)
					// 播放名字
					this.detail_code(data)
					// 获取点播的信息(不包括点播)
					this.get_vod_info(data)
					// 返回拦截处理
					this.isGoBack(data)
					// 遇到错误刷新
					this.autoReload(data)
					// 发射点播的frame对象
					this.emitVodFrame(data)
				} catch (err) {
					console.log('listen response', err)
				}
				//返回this  做订阅
				resolve(this)
			})
		})
	}
}
module.exports = Listen