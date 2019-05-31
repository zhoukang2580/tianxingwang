import { AppHelper } from './../../appHelper';
import { Platform } from '@ionic/angular';

import { RequestEntity } from "../api/BaseRequest";
import { Injectable } from "@angular/core";
import { ApiService } from '../api/api.service';
interface Ali {
  pay: (payInfo: string) => Promise<any>;
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
          }, e => { }, () => {
            sub.unsubscribe();
          });
      }).catch(() => null);
    }
    else if (AppHelper.isH5() && AppHelper.isWechatMini()) {
      this.paybyh5(method,data,path);
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
              })
            }
            else {
              reject(r.Message);
            }
          }, e => { }, () => {
            sub.unsubscribe();
          });
      }).catch(() => null);
    }
    else if (AppHelper.isH5() && AppHelper.isWechatMini()) {
      this.paybyh5(method,data,path);
    }
  }
  paybyh5(method: string, data: any, path: string)
  {
    var url = AppHelper.getApiUrl() + "/home/Pay?method="+method+"&path=" + encodeURIComponent(AppHelper.getRedirectUrl() + "?path=" + path)
    +"&data="+JSON.stringify(data);
    const req=this.apiService.createRequest();
      for(let r in req)
      {
        url+="&"+r+"="+req[r];
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
        }, e => { }, () => {
          sub.unsubscribe();
        });
    }).catch(() => null);
  }

}
