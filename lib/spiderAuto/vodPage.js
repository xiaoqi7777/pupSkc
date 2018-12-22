const VOD_KEY_DOWN = 40;
const VOD_KEY_LEFT = 37
const VOD_KEY_UP = 38;
const VOD_KEY_RIGHT = 39;

function vodKeyProcess(key_code, child) {
	console.log()
	console.log(`key_code ${key_code}, ${child}`);
	child.evaluate(async (key_code) => {
		eventHandler(key_code); //IPTV点播页面自己的方法
	}, key_code)
}

//设置PAGE的按键处理函数
function setPageKeyProcess(thz, child) {

	thz.moveRight = async (step) => {
		// console.log(`vod move right ${step}`);
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_RIGHT, child);
		}
	}

	thz.moveLeft = async (step) => {
		// console.log(`vod move left ${step}`);
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_LEFT, child);
		}
	}

	thz.moveUp = async (step) => {
		// console.log(`vod move up ${step}`);
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_UP, child);
		}
	}

	thz.moveDown = async (step) => {
		// console.log(`vod move down ${step}`);
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_DOWN, child);
		}
	}
}

function vodOnResponse(url, resp, thz) {
	console.log(`mount vod onLoad${url}-${thz.page.frames()}`);
	
	let child;
	for (let _child of thz.page.frames()) {
		console.log('child',_child.url())
		if (_child.url().indexOf('frame50/pos') > 0||_child.url().indexOf('frame50/vod') > 0) {
			child = _child;
		}
	}
    setPageKeyProcess(thz, child);
}

function vodOnLoad(url, resp) {
    
}

export {vodOnLoad, vodOnResponse}