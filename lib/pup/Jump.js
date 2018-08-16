const Calculation = require('../Calculation');
const skClient = require('./skClient');
import { SOCKET  } from '../../skc';
class test {
	constructor(pop) {
		this.page = pop.page;
		this.crypt = pop.crypt;
		this.Calculation;
		this.skClient;
	}

	async init() {
		this.skClient = SOCKET;
		this.Calculation = new  Calculation();
		return new Promise(async (re, je) => {
			console.log('test方法被调-')
			let result;
			const hmtlDom = await this.page.content()
			const appointSlice =  this.Calculation;
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

      console.log('key####',key);
      console.log('userID@@@@@@@@',userID);
      console.log('Mode^^^^^',Mode);

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
			//注入script代码
			await this.page.addScriptTag({
				content: '<script>content????????</script>',
				type: 'language="javascript"',
			})

			//进入js环境 更改表单数据 提交
			// 通过Promise.resolve方法  可以获取JS环境里面任意值 function 暂时拿不到 renreturn Promise.resolve(audioADOn)
			let a = await this.page.evaluate(obj => {
				if(document.IptvAuthenticationForm){
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
					return Promise.resolve(audioADOn)
				}
			}, obj)
			console.log('test获取page.evaluate的返回值', a)

			//进入首页 处理完后将 result 返回
			// result = await new Promise(async (re, rj) => {
			await this.page.on('load', async () => {
// ChannelID="00000001000000050000000000007105",ChannelName="陕西卫视-2.5M",UserChannelID="220",
// ChannelURL="igmp://239.45.1.232:5140",TimeShift="1",ChannelSDP="rtsp://124.75.33.12:1558/live/ch11110715361404187107.sdp",
// TimeShiftURL="rtsp://124.75.33.12:1558/live/ch11110715361404187107.sdp",ChannelLogoStruct="",ChannelLogoURL="null",
// PositionX="0",PositionY="0",BeginTime="0",Interval="0",Lasting="0",ChannelType="1",ChannelPurchased="1"
				console.log('等待页面', this.page.url(), typeof this.page.url())
				if (this.page.url().indexOf('iptv3a/hdLogin') > 0) {
					let channels = await this.page.evaluate(() => {
						return Promise.resolve(channels)
					})
					// stdId  userId
				let a =	{
						// "stbID": stdId,
						// "userID": userId,
						"channels": []
					}
					channels.forEach(element => {
						a.channels.push({
							// "ChannelID" : this.Calculation.appointSlice(element,'ChannelID=','"'),
							"ChannelName": this.Calculation.appointSlice(element,'ChannelName=','"'),
							// "UserChannelID":this.Calculation.appointSlice(element,'UserChannelID=','"'),
							"ChannelURL":this.Calculation.appointSlice(element,'ChannelURL=','"'),
							// "TimeShift":this.Calculation.appointSlice(element,'TimeShift=','"'),
							// "ChannelSDP":this.Calculation.appointSlice(element,'ChannelSDP=','"'),
							// "TimeShiftURL":this.Calculation.appointSlice(element,'TimeShiftURL=','"'),
							// "ChannelLogoStruct":this.Calculation.appointSlice(element,'ChannelLogoStruct=','"'),
							// "ChannelLogoURL":this.Calculation.appointSlice(element,'ChannelLogoURL=','"'),
							// "PositionX":this.Calculation.appointSlice(element,'PositionX=','"'),
							// "PositionY":this.Calculation.appointSlice(element,'PositionY=','"'),
							// "BeginTime":this.Calculation.appointSlice(element,'BeginTime=','"'),
							// "Interval":this.Calculation.appointSlice(element,'Interval=','"'),
							// "Lasting":this.Calculation.appointSlice(element,'Lasting=','"'),
							// "ChannelType":this.Calculation.appointSlice(element,'ChannelType=','"'),
							// "ChannelPurchased":this.Calculation.appointSlice(element,'ChannelPurchased=','"'),
						})
					});
					this.skClient.emit('get_channel_list_reply',{
						channels : a.channels
					})
					// console.log('channels', 
					// 		this.Calculation.appointSlice(element,'ChannelID=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelName=','"'),
					// 		this.Calculation.appointSlice(element,'UserChannelID=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelURL=','"'),
					// 		this.Calculation.appointSlice(element,'TimeShift=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelSDP=','"'),
					// 		this.Calculation.appointSlice(element,'TimeShiftURL=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelLogoStruct=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelLogoURL=','"'),
					// 		this.Calculation.appointSlice(element,'PositionX=','"'),
					// 		this.Calculation.appointSlice(element,'PositionY=','"'),
					// 		this.Calculation.appointSlice(element,'BeginTime=','"'),
					// 		this.Calculation.appointSlice(element,'Interval=','"'),
					// 		this.Calculation.appointSlice(element,'Lasting=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelType=','"'),
					// 		this.Calculation.appointSlice(element,'ChannelPurchased=','"'),
					// 	)
				}
				// view-source:http://124.75.29.184:7001/iptv3a/hdLogin.do
				// 页面首页的地址 关键字frameset_builder
				if (this.page.url().indexOf('frameset_builder') > -1) {

					console.log('首页进来了-------------')

					var setTime = setInterval(async () => {
						let rs = await this.page.screenshot({
							path: 'screenshot1.png',
							clip: {
								x: 0,
								y: 0,
								width: 1280,
								height: 720
							},
							encoding: "base64"
						})
						//websocket 广发事件
						this.skClient.emit('img', {
							value: rs
						})
					}, 1000)


					console.log('首页显示加载完成-------------')
					re('---------------------------异步回调---------------------------')

				}
			})
		})
	}
}
module.exports = test