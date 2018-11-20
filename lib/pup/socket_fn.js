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
		console.log(number)
		if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
			this.child.evaluate(async (number) => {
				eventHandler(number)
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
					this.clickEvent('ArrowUp',38,resolve)
					break;
				case 'zuo':
					this.clickEvent('ArrowLeft',37,resolve)
					break;
				case 'xia':
					this.clickEvent('ArrowDown',40,resolve)
				break;
				case 'you':
					this.clickEvent('ArrowRight',39,resolve)
				break;
				case 'enter':
					this.clickEvent('Enter',13,resolve)
				break;
				case 'back':
					await this.page.evaluate(() => {
						window.history.back()
					})
					let thz = this;
					function huidiao(){
						thz.page.once('response',async (data) => {
							if(data.url().indexOf('data:image/png;base64')>=0){
								await thz.page.evaluate(() => {
									window.history.back()
								})
								console.log('socket_fn-执行回调了',data.url().indexOf('data:image/png;base64'))
								if(data.url().indexOf('data:image/png;base64')===0){
									huidiao()
								}else{
									return;
								}
							}else{
								console.log('socket_fn-',data.url())
							}
						})
					}
					huidiao()
				break;
			}
		})
	};
};
module.exports = SocketFn
