module.exports = {
  'SUCCESS':{ 
    code: 0,
    cn:"成功",
    en:"success"
  },
  'GENERAL_ERROR': {
    code:1000,
    cn:"常规错误",
    en:"general error"
  },
  'CONNECT_DB_FAIL': {
    code:1100,
    cn:"数据库连接失败",
    en:"connect db fail"
  },
  //超时
  'TIMEOUT': {
    code:1101,
    cn:"超时",
    en:"timeout"
  },
  //网络错误
  'NETWORK_ERROR': {
    code:1102,
    cn:"网络错误",
    en:"network error"
  },
  /*
   *  任务启动失败通用代码
   */
  'TASK_START_FAIL': {
    code:1201,
    cn:"任务启动失败",
    en:"task start fail"
  },
  /*
   *  任务已经在运行
   */
  'TASK_ALREAD_RUNNING': {
    code:1202,
    cn:"任务已经运行",
    en:"task alread running"
  },
  /*
   *  任务数溢出
   */
  'TASK_OVERFLOW':{
    code:1203,
    cn:"任务数溢出",
    en:"task overflow"
  } ,
  /*
   * 任务不存在
   */
  'TASK_NOT_FOUND': {
    code:1204,
    cn:"任务不存在",
    en:"task node found"
  },
  /*
   * 已经有任务在运行 
   */
  'HAVE_TASK_RUNNING':{
    code:1205,
    cn:"已经有任务在运行",
    en:"have task running"
  },
  /*
   * 无效参数，任何接口调用者传入错误参数的情况都可以使用此代码
   */
  'INVALID_PARAMS': {
    code:10002,
    cn:"无效参数",
    en:"invalid params"
  },
  'RECORDER_NOT_FOUND': {
    code:10003,
    cn:"记录未找到",
    en:"recorder not found"
  },
  'SMS_CODE_EXPIRED': {
    code:10004,
    cn:"短信验证码已过期",
    en:"sms code expired"
  },
  'SMS_CODE_NOT_MATCH': {
    code:10005,
    cn:"验证码不正确",
    en:"sms code not match"
  },
  'INVALID_XML': {
    code:10006,
    cn:"无效的xml",
    en:"inavlid xml"
  } ,
  'INVALID_TASK_DEFINE': {
    code:10100,
    cn:"任务描述参数不合法，转码器拒绝执行",
    en:"invalid task define" 
  }, 
  'LOGIC_ERROR':{
    code:10007,
    cn:"程序逻辑报错",
    en:"logic error"
  },
  'CUSTOMER_HAVE_SERVICE':{
    code:10008,
    cn:"客户有关联的应用，无法删除",
    en:"customer have service"
  },
  'RECORDER_EXIST':{
    code:10009,
    cn:"记录已存在，无法插入",
    en:"recorder exist"
  },
  'EMAIL_EXIST':{
    code:10010,
    cn:"邮箱已存在",
    en:"email exist"
  },
  'PHONE_NUMBER_EXIST':{
    code:10011,
    cn:"手机号码已存在",
    en:"phone number exist"
  },

  /*
   * 缺少参数
   */
  'LACK_OF_PARAMS': {
    code:10012,
    cn:"缺少参数",
    en:"lack of params"
  },

  /*
   * 无效的状态，如频道运行中，不能删除频道
   */
  'INVALID_STATUS': {
    code:10013,
    cn:"无效的状态",
    en:"invalid status"
  },

  /*无权限，例如不允许删除系统固有的频道*/
  'NOT_PERMIT': {
    code:10013,
    cn:"缺少权限",
    en:"node permit"
  },
  
  /* WebSocket连接状态 */
　'REMOTE_DISCONNECTION': {
    code:10014,
    cn:"websocket连接断开",
    en:"remote disconnection"
  },

  /** 超出最大值 */
  'GREATER_THAN_MAXIMUM': {
    code:10015,
    cn:"超出最大值",
    en:"greater than maximum"
  },

  /** 请求sdi枚举报错 */
  'ENUM_SDI_ERROR':{
    code:13000,
    cn:"请求sdi枚举出错",
    en:"enum sdi error"
  },

  /** 请求获取盒子串号出错 */
  'GET_CODE_ERROR':{
    code:13001,
    cn:"请求盒子串号出错",
    en:"get code error"
  },

  /** 获取设备频道出错 */
  'GET_DEVICE_CHANNEL_ERROR': {
    code:10016,
    cn:"获取设备频道出错",
    en:"get device channel error"
  },

  /** 存在没有模板的任务 */
  'TASKS_WITHOUT_TEMPLATES':{
    code:10017,
    cn:"存在没有模板的任务",
    en:"tasks without templates"
  },

  /** 已有转发到云的任务启动 */
  'TASK_RUNNING_TO_CLOUD':{
    code:10018,
    cn:"已有转发到云的任务启动",
    en:"task running to cloud"
  },

  /** sdi任务模板为透传 */
  'SDI_TASK_TEMP_IS_TRANSPARENT':{
    code:10019,
    cn:"sdi任务模板为透传",
    en:"sdi task temp is transparent"
  },

  /** 单独启动录制的时候，启动的频道是sdi频道而且录制的模板是透传 */
  'TMEP_IS_TRANSPARENT':{
    code:10020,
    cn:"单独启动录制的时候，启动的频道是sdi频道而且录制的模板是透传",
    en:"tmep is transparent"
  },

  /**锁屏密码错误 */
  'LOCK_SCREEN_ERROR':{
    code:10021,
    cn:"锁屏密码错误",
    en:"lock screen error"
  },
  /**获取设备远程登录地址失败 */
  'GET_DEVICE_LOGIN_ADDRESS_ERROR':{
    code:10022,
    cn:"获取设备远程登录地址失败",
    en:"get device login address error" 
  },
  /** http请求失败 */
  'HTTP_REQUEST_ERROR':{
    code:10023,
    cn:"http请求失败",
    en:"http request error"
  },
  /** h265能力丢失 */
  "NOT_HAVE_H265_POWER":{
    code:10024,
    cn:"h265能力丢失",
    en:"node have h265 power"
  },
}
