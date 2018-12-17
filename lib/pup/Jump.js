const Calculation = require('../Calculation');
const Eevents = require('events')
import {IO} from "../../skc.js";
//const Eevents = require('events')

class Jump extends Eevents {
	constructor(pop) {
		super(pop)
		this.page = pop.page;
		this.calculation = pop.calculation;
		this.crypt = pop.crypt;
		this.ioo = pop.io;
		this.isBack = null;
		this.Calculation = new Calculation();
		console.log('jinlail*---------')
	}
	async init() {
		// 加密+修改数据 验证=> 首页 
		// 修改这个 http://124.75.29.185:7001/iptv3a/hdLogAuth.do
		await this.modify()
		 
		await this.page.on('load', async () => {
			console.log('jump.js跳转的---------页面', this.page.url())
			if (this.page.url().indexOf('iptv3a/hdLogin') > 0) {
				//节目列表
				await this.hdLoginPage()
			}
			// view-source:http://124.75.29.184:7001/iptv3a/hdLogin.do
			// 页面首页的地址 关键字frameset_builder
			if (this.page.url().indexOf('frameset_builder') > -1) {
				console.log('jump.js首页进来了-------------')
					//首页
			this.on('nodeIsBack',(data)=>{
			    this.isBack = data
			})
			var setTime = setInterval(async ()=>{
			    await this.builderPage()
			},1000)
			}
		})
		return this.page

	}
	//第一个页面的操作
	async modify() {
		const hmtlDom = await this.page.content()
		const appointSlice = new this.calculation()

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
	async hdLoginPage() {
		let channels = await this.page.evaluate(() => {
			return Promise.resolve(channels)
		})
		//console.log('所有的直播列表',channels[0])
		channels = channels.map(item => {
			let newArr = {}
			newArr['ChannelName'] = this.Calculation.appointSlice(item, 'ChannelName=', '"');
			newArr['ChannelURL'] = this.Calculation.appointSlice(item, 'ChannelURL=', '"');
			newArr['UserChannelID'] = this.Calculation.appointSlice(item,'UserChannelI','"')
			return newArr
		})
		console.log('get channelList-----------')
		this.ioo.emit('get_channel_list_reply', {
			channels: channels
		})
	}
	//到页面的操作
	async builderPage() {
		let rs = await this.screenshot()
		//websocket 广发事件
		this.ioo.emit('img', {
			value: rs,
			isBack:this.isBack
		})
	}
	//截图
	screenshot() {
		let r = this.page.screenshot({
			path: 'screenshot1.jpeg',
			type:'jpeg',
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


}
module.exports = Jump
