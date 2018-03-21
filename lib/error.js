module.exports = {
  'SUCCESS': 0,
  'GENERAL_ERROR': 1000,
  'CONNECT_DB_FAIL': 1100,
  //超时
  'TIMEOUT': 1101,
  //网络错误
  'NETWORK_ERROR': 1102,
  /*
   *  任务启动失败通用代码
   */
  'TASK_START_FAIL': 1201,
  /*
   *  任务已经在运行
   */
  'TASK_ALREAD_RUNNING': 1202,
  /*
   *  任务数溢出
   */
  'TASK_OVERFLOW': 1203,
  /*
   * 任务不存在
   */
  'TASK_NOT_FOUND': 1204,
  /*
   * 已经有任务在运行 
   */
  'HAVE_TASK_RUNNING':1205,
  /*
   * 无效参数，任何接口调用者传入错误参数的情况都可以使用此代码
   */
  'INVALID_PARAMS': 10002,
  'RECORDER_NOT_FOUND': 10003,
  'SMS_CODE_EXPIRED': 10004,
  'SMS_CODE_NOT_MATCH': 10005,
  'INVALID_XML': 10006 ,
  'INVALID_TASK_DEFINE': 10100, 
  'LOGIC_ERROR':10007,
  'CUSTOMER_HAVE_SERVICE':10008,
  'RECORDER_EXIST':10009,
  'EMAIL_EXIST':10010,
  'PHONE_NUMBER_EXIST':10011,

  /*
   * 缺少参数
   */
  'LACK_OF_PARAMS': 10012,

  /*
   * 无效的状态，如频道运行中，不能删除频道
   */
  'INVALID_STATUS': 10013,

  /*无权限，例如不允许删除系统固有的频道*/
  'NOT_PERMIT': 10013,
  
  /* WebSocket连接状态 */
　'REMOTE_DISCONNECTION': 10014,

  /** 超出最大值 */
  'GREATER_THAN_MAXIMUM': 10015,

  /** 请求程总sdi枚举报错 */
  'ENUM_SDI_ERROR':13000,

  /** 请求获取盒子串号出错 */
  'GET_CODE_ERROR':13001,

  /** 获取设备频道出错 */
  'GET_DEVICE_CHANNEL_ERROR': 10016,

  /** 存在没有模板的任务 */
  'TASKS_WITHOUT_TEMPLATES':10017,

  /** 已有转发到云的任务启动 */
  'TASK_RUNNING_TO_CLOUD':10018,

  /** sdi任务模板为透传 */
  'SDI_TASK_TEMP_IS_TRANSPARENT':10019,

  /** 单独启动录制的时候，启动的频道是sdi频道而且录制的模板是透传 */
  'TMEP_IS_TRANSPARENT':10020,

  /**锁屏密码错误 */
  'LOCK_SCREEN_ERROR':10021,
  /**获取设备远程登录地址失败 */
  'GET_DEVICE_LOGIN_ADDRESS_ERROR':10022,
  /** http请求失败 */
  'HTTP_REQUEST_ERROR':10023,
  /** h265能力丢失 */
  "NOT_HAVE_H265_POWER":10024,
}
