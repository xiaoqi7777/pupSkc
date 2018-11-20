class Socket {
	constructor(pop) {
		this.child = pop.child;
		this.socket = pop.socket;
		this.page = pop.page;
	}
	async init() {

		// 定义 截图方法
		let imgFn = async function () {
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
		}
		let ioFn = function (rs) {
			io.sockets.emit('msg', {
				value: rs,
			})
		}
		//前端发送键盘
		this.socket.on('send', async (data) => {
			console.log('send', data.value)
			//websocket 广发事件
			if (data.value == 'shang') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(38)
					})
					let rs = await imgFn()
					ioFn(rs)
				} else {
					await this.page.keyboard.press('ArrowUp');
					let rs = await imgFn()
					ioFn(rs)
				}
			} else if (data.value == 'zuo') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(37)
					})
					let rs = await imgFn()
					ioFn(rs)
				} else {
					await this.page.keyboard.press('ArrowLeft');
					let rs = await imgFn()
					ioFn(rs)
				}
			} else if (data.value == 'xia') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(40)
					})
					let rs = await imgFn()
					ioFn(rs)
				} else {
					await this.page.keyboard.press('ArrowDown');
					let rs = await imgFn()
					ioFn(rs)
				}
			} else if (data.value == 'you') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(39)
					})
					let rs = await imgFn()
					ioFn(rs)
				} else {
					await this.page.keyboard.press('ArrowRight');
					let rs = await imgFn()
					ioFn(rs)
				}
			} else if (data.value == 'enter') {

				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(13)
					})
					let rs = await imgFn()
					ioFn(rs)
				} else {
					await this.page.keyboard.press('Enter');
					let rs = await imgFn()
					ioFn(rs)
				}
			} else if (data.value == 'back') {
				await this.page.evaluate(() => {
					window.history.back()
				})
			}
		});

	}
}
module.exports = Socket
