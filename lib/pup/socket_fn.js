class SocketFn {
	constructor(pop) {
		this.child = pop.child;
		this.page = pop.page
	};
	async imgFn() {
		return (
			await this.page.screenshot({
				path: 'screenshot1.png',
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
	checkPageUrl(data) {
		console.log('data2', data,this.child);
		return new Promise(async (resolve, reject) => {
			console.log('send', data.value)
			//websocket 广发事件
			if (data.value == 'shang') {
				//此时多个frame 截获frame的url 包含frame50/vod_portal 处理  pos_manage.jsp
				// 点播 http://101.95.74.121:8084/iptvepg/frame50/vod_portal.jsp
				// 活动 http://222.68.209.8:8090/vasroot/viscore/subject/subject_SH_
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						console.log('123')
						eventHandler(38)
					})
					let rs = await this.imgFn()
					resolve(rs)
				} else if (this.child && this.child.url().indexOf('vasroot/viscore/subject') > 0) {
					this.child.evaluate(async () => {
						console.log('eventHandler(38)')
						// eventHandler(38)
					})
				} else {
					await this.page.keyboard.press('ArrowUp');
					let rs = await this.imgFn()
					resolve(rs)
				}
			} else if (data.value == 'zuo') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(37)
					})
					let rs = await this.imgFn()
					resolve(rs)
				} else {
					await this.page.keyboard.press('ArrowLeft');
					let rs = await this.imgFn()
					resolve(rs)
				}
			} else if (data.value == 'xia') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(40)
					})
					let rs = await this.imgFn()
					resolve(rs)
				} else {
					await this.page.keyboard.press('ArrowDown');
					let rs = await this.imgFn()
					resolve(rs)
				}
			} else if (data.value == 'you') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(39)
					})
					let rs = await this.imgFn()
					resolve(rs)
				} else {
					await this.page.keyboard.press('ArrowRight');
					let rs = await this.imgFn()
					resolve(rs)
				}
			} else if (data.value == 'enter') {
				if (this.child && this.child.url().indexOf('frame50/vod_portal') > 0) {
					this.child.evaluate(async () => {
						eventHandler(13)
					})
					let rs = await this.imgFn()
					resolve(rs)
				} else {
					await this.page.keyboard.press('Enter');
					let rs = await this.imgFn()
					resolve(rs)
				}
			} else if (data.value == 'back') {
				await this.this.page.evaluate(() => {
					window.history.back()
				})
			}
		})
	};
};
module.exports = SocketFn