const events = require('events')
const rPath = require('querystring')
const fs = require('fs')

class Listen extends events {
	constructor(pop) {
		super();
		this.page = pop.page;
		this.child = '';
		this.movieTitle = new Date().getTime();
		this.movieUrl;
		this.jiaojie;
		this.columnid = null;
		this.programid = null;
		this.AjaxUrl = null;
		this.programtype = null;
		this.appointSlice = new pop.calculation()
		this.isBack = null;
		this.isEmitNumber = 0;
		this.isReload = true;
		this.column = 0;
		this.column_B = 0;
		//第一栏的标题
		this.fristTitle = []
		//第二栏的标题
		this.twoTitle = []
		this.on('isBack', data => {
			this.isBack = data
			this.isEmitNumber === 0 
		})
		this.on('column',data=>{
			this.column = data.column
			this.column_B = data.column_B
		})
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

	interceptBack(data) {
		if (data.url().includes('bg_index_club_new2')) {
			this.emit('firstPage', 'on')
		}
	}
	async isGoBack(data) {
		if (this.isBack === 'back') {
			if (data.url().includes('5CYII=')||this.isReload) {
				this.isReload = false
				// await this.page.goBack()
				await this.page.evaluate(() => {
					// window.history.back()
					location.reload()
				})
			}
		}
	}
	async pup(data){
		//获取点播第一次进入时候 第一层级内容 http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId=null
		if(data.url().includes('http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId=null')){
			let getData  = await data.json()
			let	{pageCount,level,totalCount} = getData[0]
			let titleData = getData[0].data
			let obj = {pageCount,level,totalCount,titleData} 
			titleData.forEach(item => {
				this.fristTitle.push(...item)
			});
			this.emit('fristInfo',obj)
		}
		//获取当前第一层 下的子栏目情况	http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId=0
		if(data.url().includes('http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId=')&&(!data.url().includes('null'))){
			let getData  = await data.json()
			let	{pageCount,level,totalCount} = getData[0]
			let titleData = getData[0].data
			let obj = {pageCount,level,totalCount,titleData} 

			titleData.forEach(item => {
				this.twoTitle.push(...item)
			});
			this.emit('oneColumnInfo',obj)
		}
		//获取点播第二层(次级)内容 http://101.95.74.121:8084/iptvepg/frame50/get_vod_list.jsp?columnId
		if(data.url().includes('http://101.95.74.121:8084/iptvepg/frame50/get_vod_list.jsp?columnId')){
			let getData  = await data.json()
			let	{pageCount,level,totalCount} = getData[0]
			let obj = {pageCount,level,totalCount} 

			// 获取当前的第一个播放数据  主要是获取programType
			let onePlayUrlInfo = getData[0].data[0][0]
			// 判断是否是连续剧 1代表连续剧
			if(!onePlayUrlInfo){
				console.log(`climbPlayurl_listen->数据不存在-------------- 第${this.column}层=>${this.fristTitle[this.column-1].columnName}  第${this.column_B}层级=>${this.twoTitle[this.column_B-1].columnName} ,总计 ${getData[0].totalCount} 条电影`)
				return;
			}

			if(onePlayUrlInfo && (Number(onePlayUrlInfo.programType) == 1)){
				this.emit('onePlayUrlInfo',onePlayUrlInfo)
				this.emit('TwoInfoList',obj)
			}
			// 0代表电影
			if(onePlayUrlInfo && (Number(onePlayUrlInfo.programType) == 0)){
				this.emit('onePlayUrlInfo',onePlayUrlInfo)
				if(this.twoTitle[this.column_B-1]){
					console.log(`climbPlayurl_listen->成功获取数据 第${this.column}层=>${this.fristTitle[this.column-1].columnName}  第${this.column_B}层级=>${this.twoTitle[this.column_B-1].columnName} ,总计 ${getData[0].totalCount} 条电影`)
				}
					// fs.appendFile('5.json',getData,()=>{
					// 	console.log('成功写入数据')
					// })
				// console.log('获取的数据',JSON.parse(getData))
			}
		}
		// 获取单个片(第三级)内容
		if(data.url().includes('http://101.95.74.121:8084/iptvepg/frame50/get_vod_info.jsp?columnId')){
			let getData  = await data.json()
			getData = JSON.stringify(getData)
			console.log('22成功写入数据')
			// let ws = fs.appendFile('1.json')
				// fs.appendFile('6.json',getData,()=>{
				// 	console.log('成功写入数据')
				// })	
		}
	}
	async init(){
		this.page.on('framedetached', () => {
			for (let _child of this.page.frames()) {
				// console.log('地址----------', _child.url())
			}
			//当 iframe 导航到新的 url 时触发。
			this.emit('firstPage', 'ok')
		})
		let arr = []
		return new Promise((resolve, reject) => {
			this.page.on('response', async (data) => {
				// console.log('+-url', data.url())
				//拦截返回
				this.interceptBack(data)
				this.isGoBack(data)
				// 监听 爬取的数据
				this.pup(data)

				if (data.url().includes('http://222.68.210.43:8080/static/es/entries/shmgtv.html')) {
					// console.log('遇到错误刷新')
					await this.page.evaluate(() => {
						location.reload()
					})
				}
				let rs = this.vod_portal(data)
				//返回this  做订阅
				resolve(this)
			})
		})
	}
}
module.exports = Listen