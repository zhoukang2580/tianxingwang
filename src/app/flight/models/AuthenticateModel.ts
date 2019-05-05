export class AuthenticateModel {
  token: string;
  timeStamp: string;
  sign: string;
  data: {
    name: string;
    password: string;
    uuid?: string;// 手机uuid登录
    mobile?: string;// 手机登录
    openId?: string;// 微信、钉钉登录
  };
}
