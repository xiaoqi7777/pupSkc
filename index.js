const IptvMocker = require('./lib/pup/iptvMocker2'); 
const socketIo = require('socket.io'); 
import {vodOnResponse,vodOnLoad}from './lib/spiderAuto/vodPage'
const vodAuto = require('./lib/spiderAuto/vodPageAuto'); 

// import root_logger from "./logger";
// const logger = root_logger.child({
//   tag: "spiderIptvMove"
// });

const iptvMock = new IptvMocker( {
	url:'http://iptvauth.online.sh.cn:7001/iptv3a/hdLogAuth.do?UserID=75720573&Action=Login&Mode=MENU.SMG',
	headless:false, 
	io:null
})

// const sk_host ="ws://47.96.129.127"
const sk_host ="ws://192.168.1.165"
const sk_port = "3000"
const version = "1.0.0-version_fix"
const clientSocket = require("socket.io-client")(sk_host + ':' + sk_port, {
	query: {
		token: '00E04C644323', //_token
		version: version
	},
	autoConnect: true
});


async function main() {
	let iptv = await iptvMock.init(); 

	// clientSocket.on('connect',data=>console.log(`---success---${data}`))
	// clientSocket.on('error',data=>console.log(`---error---${data}`))
	// clientSocket.on('disconnect',data=>console.log(`---disconnect---${data}`))

	await iptv.auth(); 
	//await iptv.waitFor(9000);
	await iptv.moveRight(7); 
	await iptv.moveUp(1); 
	
	iptv.addPageProcessor(/frame50\/vod_portal.jsp$/, null, vodOnResponse); 
	iptv.addPageProcessor(/iptvepg\/frame50\/get_vod_column.jsp\?columnId\=/, null, vodAuto.vodLevel1Response); 
	await iptv.pressOkKey(); 
	await iptv.waitFor(2000); 

}

main(); 


export { clientSocket}