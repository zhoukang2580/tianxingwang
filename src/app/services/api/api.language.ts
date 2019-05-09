
export class ApiLanguage {
  static getExceptionTip() {
    // if(AppHelper.getLanguage())
    return "接口调用异常";
  }
  static getMobileAppError(){
    return "应用内部错误";
  }
  static getTimeoutTip() {
    return "请求超时";
  }
  static getDoubleClickExit() {
    return "再按一次退出应用";
  }

}
