const VOD_KEY_DOWN = 40;
const VOD_KEY_LEFT = 37
const VOD_KEY_UP = 38;
const VOD_KEY_RIGHT = 39;

import root_logger from "../../logger";
const logger = root_logger.child({
	tag: "IptvRemoteControl"
});

function vodKeyProcess(key_code, child) {
	console.log(`key_code ${key_code}, ${child}`);
	child.evaluate(async (key_code) => {
		eventHandler(key_code); //IPTV点播页面自己的方法
	}, key_code)
}

//设置PAGE的按键处理函数
function setPageKeyProcess(thz, child) {

	thz.moveRight = async (step) => {
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_RIGHT, child);
		} 
	}

	thz.moveLeft = async (step) => {
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_LEFT, child);
		}
	}

	thz.moveUp = async (step) => {
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_UP, child);
		}
	}

	thz.moveDown = async (step) => {
		for (let i = 0; i < step; i++) {
			vodKeyProcess(VOD_KEY_DOWN, child);
		}
	}
}

function vodOnResponse(url, resp, thz) {
	logger.info(`mount vod onLoad${url}-${thz.page.frames()}`);

	let child;
	for (let _child of thz.page.frames()) {
		logger.info('child', _child.url())
		if (_child.url().indexOf('frame50/pos') > 0 || _child.url().indexOf('frame50/vod') > 0) {
			child = _child;
		}
	}
	setPageKeyProcess(thz, child);
}

function vodOnLoad(url, resp) {

}

export {
	vodOnLoad,
	vodOnResponse
}