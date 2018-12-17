class Automatic {
	constructor(pop) {
		this.child = '';
		this.page = pop.page
		this.onePlayUrlInfo = null
		this.oneColumnInfo = null
		this.x = 1
		this.listenInte = pop.listenInte
		this.ONCE = true
		this.ONCE_A = true
		//统计第一层栏目 所在的位子 
		this.column = 0
		//初次进入点播页面 获取当前第一层栏目信息
		this.fristInfo = 0
		//统计第二层栏目 所在的位子 
		this.column_B = 0
		this.TwoInfoList = null
		this.listenInte.on('fristInfo',data=>{
				this.fristInfo = data
				// console.log('climbPlayurl_index->初次进入点播页面 获取当前第一层栏目信息',data)
		})
		this.listenInte.on('oneColumnInfo',data=>{
			//获取第一栏 的数据
			this.oneColumnInfo = data 
			// console.log('climbPlayurl_index->统计第一层栏目 所在的位子',data)
		})
		this.listenInte.on('send',data=>{
			this.child = data
			// 初始化的时候 直接拿到监听对象
			// console.log('------------------',data.url())
		})
		this.listenInte.on('onePlayUrlInfo',data=>{
			this.onePlayUrlInfo = data
			// 初始化的时候 直接拿到监听对象
			// console.log('------------------',data.url())
		})
		this.listenInte.on('TwoInfoList',data=>{
			this.TwoInfoList = data
		})
	};
	async clickEvent(direction,number){
		if(direction == 'back'){
			await this.page.evaluate(() => {
        window.history.back()
      })
		}
		if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
			// 走点播的按钮
			await this.child.evaluate(async (number) => {
				eventHandler(number)
				// console.log(`eventHandler(${number})`)
			},number)
			await this.page.waitFor(1000);

		} else {
			await this.page.keyboard.press(direction);
			await this.page.waitFor(1000);
		}
	};
	async fn(){
/*		await this.page.goBack() 用这个返回程序不往下走
*/
	// 下 右 次级栏目 
		//只执行一次
		// console.log('点播子栏目的个数---->',that.oneColumnInfo.totalCount)
		if(this.ONCE_A){
			await	this.clickEvent('ArrowUp',38)
			this.ONCE_A = false
		}

	console.log('climbPlayurl_index->当前===========电影的总数',this.TwoInfoList.totalCount)
		await this.clickEvent('ArrowDown',40)	
		await this.clickEvent('ArrowRight',39)		
		// console.log('++++++++++++',this.column_B)
		for(var i=0;i<this.column_B;i++){
			await this.clickEvent('ArrowDown',40)
		}

		for(var i=0;i<this.x;i++){
			await this.clickEvent('ArrowRight',39)
		}
		await	this.clickEvent('Enter',13)
		// 在这里保存在当前的子栏目 总数 只要一back 就变动了
		var COLUMN = this.oneColumnInfo.totalCount
		await this.page.evaluate(() => {
			window.history.back()
		})
		await this.page.waitFor(1000);
		// console.log('-----------------------------')
	
		if(this.x == this.TwoInfoList.totalCount){
			this.column_B ++;
			this.listenInte.emit('column',{column:this.column,column_B:this.column_B})
		}
		// console.log('+++++++++++++++++',this.TwoInfoList.totalCount)
		this.x = this.TwoInfoList.totalCount;
		// console.log('++++++++++++++++',this.column_B,COLUMN)
		if(this.column_B == COLUMN){
			return
		}else{
			await this.fn()
			this.x = 1
		}
		//  this.x++
		// console.log('------------当前子栏目 总电影数',this.TwoInfoList.totalCount)
		// console.log('------------当前在第几个子栏',this.column_B)
		// console.log('------------当前总的子栏数',COLUMN)
	};
		
	async automatic(){

		//首页进入到点播  7个右 1个上
		// 横着 
		for(var i = 0;i<7;i++){
			await	this.clickEvent('ArrowRight','39')
		}
		// 竖着
		await	this.clickEvent('ArrowUp',38)
		//enter 进去后的第一层
		await	this.clickEvent('Enter',13)
	
		// 第一层 获取栏目数
		// console.log('子栏目的个数11',this.oneColumnInfo.totalCount)
		// 第二层 获取第一个电影 看他的类型

		let that = this
		async function spi(){
			that.column_B = 1
			that.column ++;
			that.listenInte.emit('column',{column:that.column,column_B:that.column_B})

						console.log('climbPlayurl_index->刚进来获取第一栏的总数')
			await that.clickEvent('ArrowRight',39)
			// 退一步
			await that.clickEvent('ArrowLeft',37)
						console.log('--------------进来了-----------------是单剧还是连续剧',that.onePlayUrlInfo.programType)
						console.log('---------------次级栏目个数------------------------',that.oneColumnInfo.totalCount)
			if(that.onePlayUrlInfo.programType == 0){
					await that.clickEvent('ArrowRight',39)
					// console.log('子栏目的',that.oneColumnInfo.totalCount)
					// 子栏目的个数
					for(let i=0;i<that.oneColumnInfo.totalCount-1;i++){
						// console.log('this.oneColumnInfo.totalCount-1',that.oneColumnInfo.totalCount)
						that.column_B ++
						that.listenInte.emit('column',{column:that.column,column_B:that.column_B})
						await	that.clickEvent('ArrowDown',40)
					}
					try {
						await that.clickEvent('ArrowLeft',37)
					} catch (error) {
						console.log('climbPlayurl_index->生活栏目返回  程序被中断',error)	
						return				
					}
					// 生活 退出来的时候 报错 不能到音乐项目里面
					await	that.clickEvent('ArrowDown',40)
				spi()
			}

			if(that.onePlayUrlInfo.programType == 1){
				await	that.clickEvent('ArrowDown',40)
				//连续剧 只抓第三层
				//上 

				// for(let i=0;i<that.oneColumnInfo.totalCount-1;i++){
				// 	await that.fn()
				// }
				// for(var i=0;i<that.column;i++){
				// 	await	that.clickEvent('ArrowDown',40)
				// }
				 spi()
			}
		}
		spi();                                                                                                                   
	};
	async checkPageUrl(child) {
		this.child = child
		await this.automatic()
	};
};
module.exports = Automatic