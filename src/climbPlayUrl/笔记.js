/*
  
  首页一栏
    img标签控制  img id="buttonFocus"  style = ''
    display 在当前栏目 block 显示  node 隐藏
    left top
    22  -9 
    137 -9  115
    252 -9  115 横着间隔 115

  活动一栏 
    img id="menuFocus" style =''
    display 在当前栏目 block 显示  node 隐藏
    left width
    -210  124
    -95   189
    90 
    点播 坐标 left 535

  1、在第一栏  例如:高清电影    url=http://101.95.74.121:8084/iptvepg/frame50/get_vod_column.jsp?columnId
      可以获取到子栏目的总数  
      pageCount/level  没用  
      totalCount  子栏目数(比如:11) 首页调进来 第一次获取的多了一个 要减掉  后面的正常
      data    是所有的数据
*/