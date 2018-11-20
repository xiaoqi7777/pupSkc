const socketIoClient = require('socket.io-client');

class skIoClient {
	constructor(pop) {
		this.io;
	};
	test() {
	};
	init() {
		this.io = require('socket.io-client')("ws://14.110.9.135:3000", {
			query: {
				token: '00E04C644323'
			}
		});
		return this.io
	};
	on() {
		this.io.on('get_channel_list', (data) => {
			// console.log('--------')
		});
		this.io.on('error', async (error) => {
			console.log('连接错误')
		})
	}
}
module.exports = skIoClient
