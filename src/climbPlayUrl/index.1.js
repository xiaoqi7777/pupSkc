class Automatic {
	constructor(pop) {
		this.child = '';
		this.page = pop.page
		this.playUrlInfo = null
		this.InfoCount = null
		this.x = 1
		this.listenInte = pop.listenInte
		this.listenInte.on('send',data=>{
			this.child = data
			// 初始化的时候 直接拿到监听对象
			// console.log('------------------',data.url())
		})
		this.listenInte.on('playUrlInfo',data=>{
			this.playUrlInfo = data
			// 初始化的时候 直接拿到监听对象
			// console.log('------------------',data.url())
		})
		this.listenInte.on('InfoCount',data=>{
			this.InfoCount = data
		})
	};
	async imgFn() {
		return (
			await this.page.screenshot({
				type:'jpeg',
				path: 'screenshot1.jpeg',
				clip: {
					x: 0,
					y: 0,
					width: 1280,
					height: 720
				},
				encoding: "base64"
			})
		)
	};
	async clickEvent(direction,number){
		if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
			// 走点播的按钮
			await this.child.evaluate(async (number) => {
				eventHandler(number)
				console.log(`eventHandler(${number})`)
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
	console.log('this.fn**************************',this.playUrlInfo.programType)
		await this.clickEvent('ArrowDown',40)
		await this.clickEvent('ArrowRight',39)		
		
		for(var i=0;i<this.x;i++){
			await this.clickEvent('ArrowRight',39)
		}
		await	this.clickEvent('Enter',13)
		await this.page.evaluate(() => {
			window.history.back()
		})
		await this.page.waitFor(1000);
		// console.log('-----------------------------')
	
		if(this.x == this.InfoCount.totalCount){
			return
		}
		console.log('fn1',this.InfoCount.totalCount)

	 	// this.x = this.InfoCount.totalCount;
		 this.x++
		
		await this.fn()
	};
	async fn2(){
		/*		await this.page.goBack() 用这个返回程序不往下走
		*/
			// 下 右 次级栏目 
			console.log('this.fn**************************')
				await this.clickEvent('ArrowDown',40)
				await this.clickEvent('ArrowRight',39)		
				await this.clickEvent('ArrowDown',40)
				
				for(var i=0;i<this.x;i++){
					await this.clickEvent('ArrowRight',39)
				}
				await	this.clickEvent('Enter',13)
				await this.page.evaluate(() => {
					window.history.back()
				})
				await this.page.waitFor(1000);
				// console.log('-----------------------------')
			
				if(this.x == this.InfoCount.totalCount){
					return
				}
				console.log('fn2',this.InfoCount.totalCount)
					//	测试
					// this.x = this.InfoCount.totalCount;
					this.x++
				await this.fn2()
			};
	async fn3(){
		/*		await this.page.goBack() 用这个返回程序不往下走
		*/
			// 下 右 次级栏目 
			console.log('this.fn**************************')
				await this.clickEvent('ArrowDown',40)
				await this.clickEvent('ArrowRight',39)		
				await this.clickEvent('ArrowDown',40)
				await this.clickEvent('ArrowDown',40)
				
				for(var i=0;i<this.x;i++){
					await this.clickEvent('ArrowRight',39)
				}
				await	this.clickEvent('Enter',13)
				await this.page.evaluate(() => {
					window.history.back()
				})
				await this.page.waitFor(1000);
				// console.log('-----------------------------')
			
				if(this.x == this.InfoCount.totalCount){
					return
				}
				console.log('fn3',this.InfoCount.totalCount)
					//	测试
					// this.x = this.InfoCount.totalCount;
					this.x++
				await this.fn3()
			};
	async fn4(){
		/*		await this.page.goBack() 用这个返回程序不往下走
		*/
			// 下 右 次级栏目 
			console.log('this.fn**************************')
				await this.clickEvent('ArrowDown',40)
				await this.clickEvent('ArrowRight',39)		
				await this.clickEvent('ArrowDown',40)
				await this.clickEvent('ArrowDown',40)
				await this.clickEvent('ArrowDown',40)
				
				for(var i=0;i<this.x;i++){
					await this.clickEvent('ArrowRight',39)
				}
				await	this.clickEvent('Enter',13)
				await this.page.evaluate(() => {
					window.history.back()
				})
				await this.page.waitFor(1000);
				// console.log('-----------------------------')
			
				if(this.x == this.InfoCount.totalCount){
					return
				}
				console.log('fn4',this.InfoCount.totalCount)
					//	测试
					// this.x = this.InfoCount.totalCount;
					this.x++
				await this.fn4(resolve)
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
		// console.log('---------123---------',this.child.url())
		// 点播第一层
		// await this.fn(resolve)
		// this.x = 1
		// //点播第二层
		// await this.fn2()
		// this.x = 1
		// //点播第三层
		// await this.fn3()
		// this.x = 1
		// //点播第四层
		// await this.fn4()

		// // 高清剧集 pageCount代表页数  level 一页有行数  默认一行4个  totalCount总个数
		// 	// 下 右 次级栏目 
		// await this.clickEvent('ArrowDown',40)
		// await this.clickEvent('ArrowRight',39)
		// console.log(this.playUrlInfo)
		// console.log('----------',this.InfoCount.totalCount)

		// // 进入单个栏目
		// 	//横四  又 enter goback(退出来 此时在高清电影位子)
		// 	for(var i=0;i<this.InfoCount.totalCount;i++){
		// 		await this.clickEvent('ArrowRight',39)
		// 	}
		// await	this.clickEvent('Enter',13)
		// await this.page.goBack()

		// console.log(this.InfoCount,typeof this.InfoCount)

		// 电影
		// //第一层 1个右 9个下
		await this.clickEvent('ArrowRight',39)
		console.log('this.InfoCount-2',this.InfoCount.totalCount-2)
		for(let i=0;i<this.InfoCount.totalCount-2;i++){
			await	this.clickEvent('ArrowDown',40)
		}
		//退到左边
		await	this.clickEvent('ArrowLeft',37)
		
		//下------------到连续剧
		await	this.clickEvent('ArrowDown',40)
		await this.clickEvent('ArrowRight',39)

		console.log('this.InfoCount-3',this.playUrlInfo.programType)
		if(this.playUrlInfo.programType == 1){

			await	this.clickEvent('ArrowLeft',37)
			await	this.clickEvent('ArrowUp',38)
		}
			//点播第一层
			await this.fn()
			this.x = 1
			//点播第二层
			await this.fn2()
			this.x = 1
			//点播第三层
			await this.fn3()
			this.x = 1
			//点播第四层
			await this.fn4()



		//下------------ 到纪实
		await	this.clickEvent('ArrowDown',40)
		await	this.clickEvent('ArrowDown',40)
		console.log('this.InfoCount-3',this.InfoCount.totalCount)

		
		// //第三层 1个右 5个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<5;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)

		// //下一步
		// await	this.clickEvent('ArrowDown',40)

		// //第四层 1个右 25个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<25;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)
		
		// //下一步
		// await	this.clickEvent('ArrowDown',40)

		// //第五层 1个右 6个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<6;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)

		// //下三步 跳过剧集 娱乐(和高清娱乐重复)
		// await	this.clickEvent('ArrowDown',40)
		// await	this.clickEvent('ArrowDown',40)
		// await	this.clickEvent('ArrowDown',40)


		// //第八层 1个右 6个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<5;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)

		// //下一步
		// await	this.clickEvent('ArrowDown',40)

		// //第九层 1个右 9个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<9;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)


		// //下一步
		// await	this.clickEvent('ArrowDown',40)

		// //第九层 1个右 20个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<20;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)

		// //下一步
		// await	this.clickEvent('ArrowDown',40)

		// //第十层 1个右 20个下
		// await this.clickEvent('ArrowRight',39)
		// for(let i=0;i<1;i++){
		// 	await	this.clickEvent('ArrowDown',40)
		// }
		// await	this.clickEvent('ArrowLeft',37)



	};
	async checkPageUrl(child) {
		this.child = child
		await this.automatic()
	};
};
module.exports = Automatic