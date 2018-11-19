class Calculation {
	// 需要对单引号做判断 appoint传入的'或者"
	appointSlice(data, target, appoint) {
		//data = form    target = 'action=' appoint = '\''
		let leng = data.indexOf(target);
		//从target开始查找
		let startIndex = data.indexOf(appoint, leng);
		// console.log(startIndex,leng)

		let startNext = data.indexOf(appoint, startIndex + 1);
		let sliceData = data.slice(startIndex + 1, startNext);
		return sliceData;
	};
	//截取一段 数据 data  起点 target1 结束点target2
	sliceData(data, target1, target2) {
		let target = data.indexOf(target1)
		let targetLenght = target1.length
		//截取起始位子
		let targetStart = target + targetLenght
		// 结束位子
		let targetEnd = data.indexOf(target2, targetStart)

		let sliceData = data.slice(targetStart, targetEnd)
		// console.log('sliceData', targetStart, targetEnd)
		return sliceData
	}
	keyFn(str) {
		if (str.length >= 24) {
			return str.substr(0, 24)
		} else {
			let leng = 24 - str.length
			let zeroString = '0'.repeat(leng)
			return str.toString().concat(zeroString)
		}
	}
	getVodUrl(columnId, programId, vodType, breakPoint) {
		return "get_vod_url.jsp?columnId=" + columnId + "&programId=" + programId + "&vodType=" + vodType + "&breakPoint=" + breakPoint;
	}
	tmpRandom() {
		return `${(Math.random()*10000000).toString().substr(0,7)}`
	}
}


module.exports = Calculation