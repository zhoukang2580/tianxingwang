import { AppHelper } from './../../appHelper';
import { Platform } from '@ionic/angular';
import { Injectable } from "@angular/core";
import { RequestEntity } from '../api/Request.entity';
import { ApiService } from '../api/api.service';
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
  constructor(private apiService: ApiService, private plt: Platform) {
    plt.ready().then(() => {
      this.ali = window['ali'];
      this.wechat = window['wechat'];
    });
  }

  alipay(method: string, data: any, path: string) {
    if (AppHelper.isApp()) {
      const req = new RequestEntity();
      req.Method = method;
      req.Data = data;
      req.Data.IsApp = true;
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
    else if (AppHelper.isH5() && AppHelper.isWechatMini()) {
      this.paybyh5(method, data, path);
    }

  }
  wechatpay(method: string, data: any, path: string) {
    const req = new RequestEntity();
    if (AppHelper.isApp()) {
      req.Method = method;
      req.Data = data;
      req.Data.IsApp = true;
      return new Promise<any>((resolve, reject) => {
        const sub = this.apiService
          .getResponse<{ appid: string, noncestr: string, package: string, partnerid: string, prepayid: string, timestamp: string, sign: string }>(req).subscribe(r => {
            if (r.Status && r.Data) {
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
            else {
              reject(r.Message);
            }
          }, e => { reject(e); }, () => {
            sub.unsubscribe();
          });
      }).catch(() => null);
    }
    else if (AppHelper.isH5() && AppHelper.isWechatMini()) {
      this.paybyh5(method, data, path);
    }
  }
  paybyh5(method: string, data: any, path: string) {
    var url = AppHelper.getApiUrl() + "/home/Pay?method=" + method + "&path=" + encodeURIComponent(AppHelper.getRedirectUrl() + "?path=" + path)
      + "&data=" + JSON.stringify(data);
    const req = this.apiService.createRequest();
    for (let r in req) {
      url += "&" + r + "=" + req[r];
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
