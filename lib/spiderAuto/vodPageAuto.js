let countAllMovie = 0;
let level1Column = [];
// level2栏目数
let level2Column = [];
let level3Column = null;

let isBackLevel1FromLeve2 = false;
let isLevel3FromLeve2 = false
let emitMoveData = null

import root_logger from "../../logger";
const logger = root_logger.child({
	tag: "spiderIptvMove"
});

import {clientSocket} from '../../index'
function extractColumnNameFromUrl(url) {
	let ma = url.match(/columnId\=([A-Znull0-9]{3,15})/);
	if (!ma) {
		// logger.debug('----> cannot find column id match');
		return;
	}
	return ma[1];
}

async function vodLevel2Response(url, resp, iptv) {
	let data = await resp.json();
	data = data[0];
// 发数据
	emitMoveData = data.data[1]
	emitMoveData = emitMoveData.map(item => {
		let obj = {}
			obj['vod'] = {
				programId:item.programId,
				programName: item.programName,
				smallPoster: item.smallPoster,
				programType: item.programType
			},
			obj['programe'] = [{
				programId: item.programId,
				columnId: item.columnId,
				programType: item.programType,
				breakPoint: ''
			}]
		return obj
	})
	logger.debug('send server data',emitMoveData)
	console.log('++++',emitMoveData)
	clientSocket.emit('sync_vod_list', {
		emitMoveData
	})

	// 进入到Level3

	if (data.curPage !== data.pageCount) {
		countAllMovie = countAllMovie + data.data[1].length
		logger.debug('总数-----------', countAllMovie)
		logger.debug('-totalCount data', data)

		if (isLevel3FromLeve2) {
			await iptv.moveDown(3);
		} else {
			await iptv.moveRight(1);
			isLevel3FromLeve2 = true
		}
	} else {
		if (data.pageCount !== 1 && data.pageCount !== 0) {
			isLevel3FromLeve2 = false
			// moveLeft=> Level3 to Level2
			await iptv.moveLeft(1);
		}
		logger.debug(`当前列Level2 ${data.pageCount} 页, ${data.totalCount} 个电影 `);
		// logger.debug(`current column have ${data.pageCount} page, ${data.totalCount} vod `);
		/*
		url like 
		http://101.95.74.121:8084/iptvepg/frame50/get_vod_list.jsp?columnId=0A000C&numPerPage=12&destPage=1&isSearchVod=false respons
		*/
		// logger.debug(`vod level2 response url: ${url}`);

		// columnId 匹配到level2的数据
		let columnId = extractColumnNameFromUrl(url);
		logger.debug(`current column id ${columnId}`);
		for (let i = 0; level2Column && i < level2Column.length; i++) {
			let column = level2Column[i];
			if (column.columnId === columnId) {
				level2Column.splice(i, 1);
				// 不要重要
				// logger.debug
				// 警告
				// logger.warn
				// logger.info(`hit level2 column ${column.columnName} remain ${level2Column.length}`)
				logger.info(`level2 列的名字  ${column.columnName} 循环的次数 ${level2Column.length}`)

			}
		}

		if (level2Column.length > 0) {

			iptv.moveDown(1);
		} else {
			logger.debug(`all level 2 column data processed, back to upper level...`)
			try {
				await iptv.moveLeft(1);
			} catch (error) {
				logger.debug(`Level2 to Level1 err ${error}`)
				await iptv.goBack()
			}
			isBackLevel1FromLeve2 = true;
		}
	}

}

async function vodLevel1Response(url, resp, iptv) {

	if (isBackLevel1FromLeve2) {
		isBackLevel1FromLeve2 = false;
		iptv.moveDown(1);
		return;
	}

	let columnId = extractColumnNameFromUrl(url);
	logger.debug(`process level 1 column ${columnId}`);
	let rd = await resp.json();
	let data = rd[0];


	if (columnId == 'null') {
		for (let i = 0; i < rd[1].data.length; i++) {
			level2Column = level2Column.concat(rd[1].data[i]);
		}

		//第一栏条目具体内容
		/*
		data.data[0] 
		[ { columnName: '高清电影HD', subExist: '1', columnId: '0A00' },
			{ columnName: '高清剧集HD', subExist: '1', columnId: '0A01' },
			{ columnName: '高清纪实HD', subExist: '1', columnId: '0A02' },
			{ columnName: '高清娱乐HD', subExist: '1', columnId: '0A03' },
			{ columnName: '电影', subExist: '1', columnId: '460200' },
			{ columnName: '电视剧', subExist: '1', columnId: '460201' },
			{ columnName: '娱乐', subExist: '1', columnId: '460202' },
			{ columnName: '财经', subExist: '1', columnId: '460207' } ]
			data[1]
			[ { columnName: '纪实', subExist: '1', columnId: '460209' },
			{ columnName: '生活', subExist: '1', columnId: '460205' },
			{ columnName: '音乐', subExist: '1', columnId: '460206' } ]
		*/
		// logger.debug(data.data[1]);
		//level1数据
		for (let i = 0; i < rd[0].data.length; i++) {
			level1Column = level1Column.concat(rd[0].data[i])
		}
		logger.debug('level1Column-----------',level1Column)
		//通过 get_vod_list 监视level2的数据 
		iptv.addPageProcessor(/frame50\/get_vod_list.jsp?/, null, vodLevel2Response);
	} else {
		logger.debug(`2 time level1 data`);
		for (let i = 0; i < rd[0].data.length; i++) {
			level2Column = level2Column.concat(rd[0].data[i]);
		}
	}
	logger.debug(`level 2 的数据数${level2Column}`);


	for (let i = 0; level1Column && i < level1Column.length; i++) {
		let column = level1Column[i];
		if (column.columnId === columnId) {
			level1Column.splice(i, 1);
			logger.info(`hit level 1 column ${column.columnName} remain ${level1Column.length}`)

		}
	}

	//删除 监视level1的方法
	//iptv.removePageProcessor(/frame50\/get_vod_column.jsp\?columnId\=/, resp.url())
	await iptv.moveRight(1);
}


function vodOnLoad(url, thz) {

}











export {
	vodOnLoad,
	vodLevel1Response
}