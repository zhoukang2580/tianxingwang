import { App } from './../../app.component';
import { AppHelper } from './../../appHelper';
import { Platform } from '@ionic/angular';
import { Injectable } from "@angular/core";
import { RequestEntity } from '../api/Request.entity';
import { ApiService } from '../api/api.service';
import { LanguageHelper } from 'src/app/languageHelper';
import { wechatHelper } from 'src/app/wechatHelper';
export interface Ali {
  pay: (payInfo: string) => Promise<{
    memo: string;
    result: {
      alipay_trade_app_pay_response: {
        code: string;//10000,
        msg: string;// Success,
        app_id: string;// 2014072300007148,
        out_trade_no: string;// 081622560194853,
        trade_no: string;//2016081621001004400236957647,
        total_amount: string;// 0.01,
        seller_id: string;// 2088702849871851,
        charset: string;// utf-8,
        timestamp: string;// 2016-10-11 17:43:36
        sub_code?:string;
        sub_msg?:string;
      },
      sign: string;// ********,
      sign_type: string;// RSA2
    },
    /**
     * 返回码	 含义
        9000	订单支付成功
        8000	正在处理中，支付结果未知（有可能已经支付成功），请查询商户订单列表中订单的支付状态
        4000	订单支付失败
        5000	重复请求
        6001	用户中途取消
        6002	网络连接出错
        6004	支付结果未知（有可能已经支付成功），请查询商户订单列表中订单的支付状态
        其它	 其它支付错误
     */
    resultStatus: "9000"|"8000"|"4000"|"5000"|"6001"|"6002"|"6004"|"其它";// 9000
  }>;
}
interface Wechat {
  pay: (payInfo: any) => Promise<any>;
}
@Injectable({
  providedIn: "root"
})
export class PayService {
  ali: Ali;
  wechat: Wechat;
  iframe:HTMLIFrameElement;
  wx = window['wx'];
  constructor(private apiService: ApiService, private plt: Platform) {
    plt.ready().then(() => {
      this.ali = window['ali'];
      this.wechat = window['wechat'];
    });
    this.iframe=document.createElement("iframe");
    this.iframe.style.display="none";
    document.body.append(this.iframe);
  }

  alipay(req: RequestEntity, path: string) {
    if (AppHelper.isApp()) {
      req.IsShowLoading=true;
      return new Promise<any>((resolve, reject) => {
        const sub = this.apiService
          .getResponse<{ Body: string, out_trade_no: string }>(req).subscribe(r => {
            if (r.Status && r.Data) {
              this.ali.pay(r.Data.Body).then(n => {
                resolve(n);
              }).catch(e => {
                reject(e);
              })
            }
            else {
              reject(r.Message);
            }
          }, e => {
            reject(e);
          }, () => {
            sub.unsubscribe();
          });
      }).catch(() => null);
    }
    else if (AppHelper.isH5()) {
      req.Data.CreateType="Mobile";
     this.payh5(req,path);
    }

  }
  wechatpay(req: RequestEntity, path: string) {
    if (AppHelper.isApp() || AppHelper.isWechatMini() || AppHelper.isWechatH5()) {
      req.Data.OpenId=wechatHelper.openId;
      req.IsShowLoading=true;
      if( AppHelper.isWechatMini())
      {
        req.Data.CreateType="Mini";
        req.Data.DataType="json";
      }
      else if(AppHelper.isWechatH5())
      {
        req.Data.CreateType="JsSdk";
        req.Data.DataType="json";
      }
      return new Promise<any>((resolve, reject) => {
        const sub = this.apiService
          .getResponse<any>(req).subscribe(async r => {
            if (r.Status && r.Data) {
              if(AppHelper.isWechatMini())
              {
                wechatHelper.wx.miniProgram.navigateTo({url: "pages/login/pay?data="+JSON.stringify(r.Data)});
              }
              else if(AppHelper.isWechatH5())
              {
                const ok = await wechatHelper.ready().catch(e => {
                  return false;
                });
                if (!ok) {
                  return;
                }
                wechatHelper.wx.chooseWXPay({
                  timestamp: r.Data.timeStamp, 
                  nonceStr: r.Data.nonceStr, // 支付签名随机串，不长于 32 位
                  package: r.Data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                  signType: r.Data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                  paySign: r.Data.paySign, // 支付签名
                  success: (res)=> {
                    resolve(res);
                  }
                  });
              }
              else
              {
                const payInfo = {
                  appId: r.Data.appid,
                  partnerId: r.Data.partnerid,
                  prepayId: r.Data.prepayid,
                  packageValue: r.Data.package,
                  nonceStr: r.Data.noncestr,
                  timeStamp: r.Data.timestamp,
                  sign: r.Data.sign,
                }
                this.ali.pay(payInfo as any).then(n => {
                  resolve(n);
                }).catch(e => {
                  reject(e);
                });
              }
            
            }
            else {
              reject(r.Message);
            }
          }, e => { reject(e); }, () => {
            sub.unsubscribe();
          });
      }).catch(() => null);
    }
     else if(AppHelper.isH5())
     {
      req.Data.CreateType="H5";
      this.payh5(req,path);
     }
  }

   payh5(req: RequestEntity,path:string)
   {
    let url = AppHelper.getApiUrl() + "/home/Pay?path=" + encodeURIComponent(AppHelper.getRedirectUrl() + "?path=" + path);
    for (let r in req) {
      url += "&" + r + "=" + (typeof req[r]=="string"?req[r]:JSON.stringify(req[r]));
    }
    window.location.href = url;
   }

  process(method: string, data: any) {
    const req = new RequestEntity();
    req.Method = method;
    req.Data = data;
    return new Promise<any>((resolve, reject) => {
      const sub = this.apiService
        .getResponse<{}>(req).subscribe(r => {
          if (r.Status) {
            reject(r);
          }
          else {
            reject(r.Message);
          }
        }, e => {
          reject(e);
        }, () => {
          sub.unsubscribe();
        });
    }).catch(() => null);
  }



}
