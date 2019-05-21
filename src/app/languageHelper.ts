
export class LanguageHelper {
    static getLoginImageCodeTip() {
      // if(AppHelper.getLanguage())
      return "请输入验证码";
    }
    static getLoginNameTip() {
      return "请输入登入名";
    }
    static getLoginPasswordTip() {
      return "请输入登入密码";
    }
    static getLoginMobileTip() {
      return "请输入手机号码";
    }
    static getMobileCodeTip() {
      return "请输入手机收到的验证码";
    }
    static getApiExceptionTip() {
        // if(AppHelper.getLanguage())
        return "接口调用异常";
      }
      static getApiMobileAppError(){
        return "应用内部错误";
      }
      static getApiTimeoutTip() {
        return "请求超时";
      }
      static getAppDoubleClickExit() {
        return "再按一次退出应用";
      }
  }