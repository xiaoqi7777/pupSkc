/*
  1、进来 到达第一个栏目
    首次 http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId=null
    能获取到第一栏目的总数(一个是null 一个是有值 动态的)
    通过 http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId=
    能获取子栏目的总数
 
    第一个栏目 可以获取子栏目的个数  InfoCount
  发射这个 InfoCount
  但是 刚进来的 第一个栏目的个数要-1

  2、进入 到第一个子栏目 
  //http://101.95.74.121:8084/iptvepg/frame50/get_vod_list.jsp?
    可以查到当前栏目是连续剧还是电影
    playUrlInfo 第一个子栏目的第一个电影信息 查看类型是否为1
    totalCount 
    
    this.InfoCount.totalCount 是查看子栏目的个数

    如果 this.playUrlInfo.programType == 0 是电影 直接往下
    如果 this.playUrlInfo.programType == 1 是连续剧 就执行连续剧的方法









    
    上
		  await	this.clickEvent('ArrowUp',38)
    下
      await	that.clickEvent('ArrowDown',40)
    左
      await that.clickEvent('ArrowLeft',37)
    右
  	  await that.clickEvent('ArrowRight',39)
    back 
      await	this.clickEvent('back')
    enter
      await	this.clickEvent('Enter',13)









*/