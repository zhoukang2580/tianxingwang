import { AppHelper } from "../appHelper";

export class LoginLanguage {
  static getImageCodeTip() {
    // if(AppHelper.getLanguage())
    return "请输入验证码";
  }
  static getNameTip() {
    return "请输入登入名";
  }
  static getPasswordTip() {
    return "请输入登入密码";
  }
  static getMobileTip() {
    return "请输入手机号码";
  }
  static getMobileCodeTip() {
    return "请输入手机收到的验证码";
  }
}
