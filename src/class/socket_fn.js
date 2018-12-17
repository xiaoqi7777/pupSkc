class SocketFn {
	constructor(pop) {
		this.child = '';
		this.page = pop.page
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
	async clickEvent(direction,number,resolve){
		if(this.child){
			// 打印iframe child
			// console.log('iframe 地址',this.child.url())
		}
		if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
			console.log('socket_fn',number)
			this.child.evaluate(async (number) => {
				eventHandler(number)
				console.log(`eventHandler(${number})`)
			},number)
			let rs = await this.imgFn()
			resolve(rs)
		} else {
			await this.page.keyboard.press(direction);
			let rs = await this.imgFn()
			resolve(rs)
		}
	};
	checkPageUrl(data,child) {
		this.child = child
		return new Promise(async (resolve, reject) => {
			switch(data.value){
				case 'shang':
					try {
						await	this.clickEvent('ArrowUp',38,resolve)
					} catch (error) {
						console.log('clickEvent',error)					
					}
					break;
				case 'zuo':
					try {
						await	this.clickEvent('ArrowLeft',37,resolve)
					} catch (error) {
						console.log('clickEvent',error)					
					}
					break;
				case 'xia':
					try {
						await	this.clickEvent('ArrowDown',40,resolve)
					} catch (error) {
						console.log('clickEvent',error)					
					}
				  break;
				case 'you':
					try {
						await this.clickEvent('ArrowRight',39,resolve)
					} catch (error) {
						console.log('clickEvent',error)					
					}
				  break;
				case 'enter':
					try {
						await	this.clickEvent('Enter',13,resolve)
					} catch (error) {
						console.log('clickEvent',error)					
					}
					break;
				case 'menu':
					try {
						await this.page.evaluate(() => {
							location.reload()
						})
					} catch (error) {
						console.log('clickEvent',error)					
					}
					break;				
				case 'back':
				// 在动画的时候 node有报错
				// Navigation Timeout Exceeded: 30000ms exceeded
					try {
						await this.page.evaluate(() => {
							window.history.back()
						})
					} catch (error) {
						console.log('clickEvent',error)					
					}
					// try {
					// 	await this.page.goBack()
					// } catch (error) {
					// 	reject(error)						
					// }
					break;
				default :
					console.log('传入的空值')
					break;
			}
		})
	};
};
module.exports = SocketFn