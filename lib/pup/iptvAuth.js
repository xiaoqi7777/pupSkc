const IptvMocker = require('./iptvMocker')
const Calculation = require('../Calculation');
const Crypt = require('../Crypt');
const EventEmitter = require('events')

class Browser extends EventEmitter {
	constructor(pop) {
		this.page = null
		this.url = pop.url
		this.config = pop.config
		this.io = pop.io
		this.crypt = Crypt;
		this.isBack = null;
		this.Calculation = new Calculation();
		this.setTime = null
	};

	async pageAuth() {

		await this.modify()

		await this.page.on('load', async () => {

			if (this.page.url().indexOf('iptv3a/hdLogin') > 0) {
				//节目列表
				await this.getChannel()
			}

			if (this.page.url().indexOf('frameset_builder') > -1) {
				//首页
				this.on('nodeIsBack', (data) => {
					this.isBack = data
				})
				this.setTime = setInterval(async () => {
					await this.builderPage()
				}, 1000)
			}
		})
		return this.page
	}
	
	//第一个页面的操作
	async modify() {
		const hmtlDom = await this.page.content()
		const appointSlice = this.Calculation

		let key = appointSlice.appointSlice(hmtlDom, 'Authentication.CTCGetAuthInfo(', "\'")
		let userID = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.userID', '\"')
		let Mode = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.Mode', '\"')
		let ChannelID = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.ChannelID', '\"')
		let STBAdminStatus = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.STBAdminStatus', '\"')
		let MiniPlatform = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.MiniPlatform', '\"')
		let FCCSupport = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.FCCSupport', '\"')
		let AudioADOn = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.AudioADOn', '\"')
		let DynamicAuthIP = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.DynamicAuthIP', '\"')
		let action = appointSlice.appointSlice(hmtlDom, 'IptvAuthenticationForm.action', '\"')

		let IP = '192.168.1.155'
		let MAC = '00-01-6C-06-A6-29'
		let userId = '75720573'
		let stdId = '0010029900D04940000180A1D7F3599D'
		let password = '123456'
		let cskey = appointSlice.keyFn(password)
		let tmpRandom = appointSlice.tmpRandom()
		let reserve = ''
		let EncryToken = this.crypt({
			alg: 'des-ede3', //3des-ecb  
			autoPad: true,
			key: `${cskey}`,
			plaintext: `${appointSlice.tmpRandom()}$${key}$${userId}$${stdId}$${IP}$${MAC}$${reserve}$CTC`,
			iv: null
		}).toLocaleUpperCase()

		//获取引号里面的东西  截取单个 data 是一串原始字符串  target 是appoint前面的标示   appoint是要两边的引号
		let obj = {
			EncryToken: EncryToken,
			userID: userID,
			Mode: Mode,
			ChannelID: ChannelID,
			STBAdminStatus: STBAdminStatus,
			MiniPlatform: MiniPlatform,
			FCCSupport: FCCSupport,
			AudioADOn: AudioADOn,
			DynamicAuthIP: DynamicAuthIP,
			action: action
		}

		//进入js环境 更改表单数据 提交
		await this.page.evaluate(obj => {
			if (document.IptvAuthenticationForm) {
				document.IptvAuthenticationForm.authenticator.value = obj.EncryToken;
				document.IptvAuthenticationForm.userID.value = obj.userID;
				document.IptvAuthenticationForm.Mode.value = obj.Mode;
				document.IptvAuthenticationForm.ChannelID.value = obj.ChannelID;
				document.IptvAuthenticationForm.STBAdminStatus.value = obj.STBAdminStatus;
				document.IptvAuthenticationForm.MiniPlatform.value = obj.MiniPlatform;
				document.IptvAuthenticationForm.FCCSupport.value = obj.FCCSupport;
				document.IptvAuthenticationForm.AudioADOn.value = obj.AudioADOn;
				document.IptvAuthenticationForm.DynamicAuthIP.value = obj.DynamicAuthIP;

				document.IptvAuthenticationForm.action = obj.action;
				document.IptvAuthenticationForm.submit();
			}
		}, obj)
	}

	//第二个页面的操作
	async getChannel() {
		let channels = await this.page.evaluate(() => {
			return Promise.resolve(channels)
		})

		channels = channels.map(item => {
			let newArr = {}
			newArr['ChannelName'] = this.Calculation.appointSlice(item, 'ChannelName=', '"');
			newArr['ChannelURL'] = this.Calculation.appointSlice(item, 'ChannelURL=', '"');
			newArr['UserChannelID'] = this.Calculation.appointSlice(item, 'UserChannelI', '"')
			return newArr
		})

		this.io.emit('get_channel_list_reply', {
			channels: channels
		})
	}

	//到页面的操作
	async builderPage() {
		try {
			clearInterval(this.setTime)
			let rs = await this.screenshot()
			//websocket 广发事件
			this.io.emit('img', {
				value: rs,
				isBack: this.isBack
			})
		} catch (error) {
			console.log('截图失败', error)
		}
	}

	//截图
	screenshot() {
		let r = this.page.screenshot({
			path: 'screenshot1.jpeg',
			type: 'jpeg',
			clip: {
				x: 0,
				y: 0,
				width: 1280,
				height: 720
			},
			encoding: "base64"
		})
		return r
	}

	async init() {
		// return new Promise(async (resolve, reject) => {
		//Page组件在这儿初始化,进行一些全局配置
		const page = await new IptvMocker(this.config)
		this.page = await page.init()
		await this.page.goto(this.url)

		//操作 跳转到首页
		await this.page.waitForNavigation()
		console.log('Spider start----')

		//执行跳转页面逻辑
		await this.pageAuth()
		//跳转到首页 
		return {
			pageData: this.page,
			EventEmitter: this
		}
	};

}
module.exports = Browser