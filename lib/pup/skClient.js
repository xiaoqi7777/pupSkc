const socketIoClient = require('socket.io-client');

class skIoClient {
	constructor(pop) {
		this.io;
	};
	test() {
		console.log('test')
	};
	init() {
		console.log('init进来了')
		this.io = require('socket.io-client')("ws://14.110.9.135:3000", {
			query: {
				token: '00E04C644323'
			}
		});
		return this.io
	};
	on() {
		this.io.on('get_channel_list', (data) => {
			console.log('--------')
		});
		this.io.on('error', async (error) => {
			console.log('连接错误')
		})
	}
}
module.exports = skIoClient