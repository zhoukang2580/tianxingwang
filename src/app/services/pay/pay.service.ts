import { PayEnComponent } from './../../components/pay_en/pay_en.component';
import { LangService } from 'src/app/services/lang.service';
import { App } from "./../../app.component";
import { AppHelper } from "./../../appHelper";
import { Platform, PopoverController } from "@ionic/angular";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../api/Request.entity";
import { ApiService } from "../api/api.service";
import { LanguageHelper } from "src/app/languageHelper";
import { WechatHelper } from "src/app/wechatHelper";
import {
  PayComponent,
  IPayWayItem,
} from "src/app/components/pay/pay.component";
import { finalize } from "rxjs/operators";
import { Router } from "@angular/router";
export const Wechat_Pay_Error_Message_Cancel = "";
@Injectable({
  providedIn: "root",
})
export class PayService {
  ali: Ali;
  wechat: Wechat;
  wx = window["wx"];
  constructor(
    private apiService: ApiService,
    private plt: Platform,
    private router: Router,
    private popoverCtrl: PopoverController,
    private LangService: LangService
  ) {
    plt.ready().then(() => {
      this.ali = window["ali"];
      this.wechat = window["wechat"];
    });
  }
  async selectPayWay(
    paytypes?: { label: string; value: string }[]
  ): Promise<IPayWayItem> {
    const m = await this.popoverCtrl.create({
      component: this.LangService.isEn ? PayEnComponent : PayComponent,
      componentProps: {
        payWays: paytypes,
      },
    });
    m.backdropDismiss = false;
    await m.present();
    const result = await m.onDidDismiss();
    return result && result.data;
  }
  private addPayMessage(message: string, remark?: string) {
    return {
      timeStamp: Date.now(),
      message,
      remark,
    } as IPayMessage;
  }
  async alipay(req: RequestEntity, path: string): Promise<boolean> {
    let result = false;
    const messages: IPayMessage[] = [];
    if (AppHelper.isApp()) {
      const isAlipayAppInstalled = await AppHelper.isAliPayAppInstalled();
      console.log(
        "ail" +
          " " +
          typeof window["ali"] +
          " isAlipayAppInstalled " +
          isAlipayAppInstalled
      );
      if (!isAlipayAppInstalled) {
        result = true;
        req.Data.CreateType = "Mobile";
        this.payMobile(req, path);
        return;
      }
      req.IsShowLoading = true;
      req.Data.DataType = "json";
      req.Data.CreateType = "App";
      await this.plt.ready();
      const r: {
        Body: string;
        Number: string;
        Status: boolean;
        Code: string;
        Message: string;
      } = await this.apiService.getPromiseData<any>(req).catch((_) => {
        messages.push({ timeStamp: Date.now(), message: _, remark: "ali" });
        return null;
      });
      if (r && r.Status != undefined && !r.Status) {
        messages.push(this.addPayMessage(r.Message));
      }
      if (r && r.Body) {
        const payresult: IAliPayPluginPayResult = await this.ali
          .pay(r.Body)
          .catch((_) => {
            messages.push(this.addPayMessage(_));
            return null;
          });
        console.log("支付宝支付，payresult ", payresult);
        if (payresult) {
          if (payresult.resultStatus == "9000") {
            messages.push(this.addPayMessage("订单支付成功"));
            result = true;
          } else {
            const info =
              payresult.memo || payresult.result || payresult.resultStatus;
            if (info) {
              messages.push(this.addPayMessage(`${info}`));
            }
          }
        }
      }
      if (messages.filter((it) => !!it.message).length) {
        messages.sort((a, b) => b.timeStamp - a.timeStamp);
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].message) {
            await AppHelper.alert(messages[i].message, true);
          }
        }
      }
    } else if (AppHelper.isH5()) {
      result = true;
      req.Data.CreateType = "Mobile";
      this.payMobile(req, path);
    }
    return result;
  }
  async wechatpay(req: RequestEntity, path: string, callback?: Function) {
    if (
      AppHelper.isApp() ||
      AppHelper.isWechatMini() ||
      AppHelper.isWechatH5()
    ) {
      req.Data.OpenId = AppHelper.isWechatMini()
        ? WechatHelper.getMiniOpenId()
        : WechatHelper.getOpenId();
      req.IsShowLoading = true;
      if (AppHelper.isApp()) {
        req.Data.CreateType = "App";
        req.Data.DataType = "json";
        const isWecahtInstalled = await AppHelper.isWXAppInstalled()
          .then(() => true)
          .catch(() => false);
        if (!isWecahtInstalled) {
          req.Data.CreateType = "Mobile";
          this.payMobile(req, path);
          return;
        }
      } else if (AppHelper.isWechatMini()) {
        req.Data.CreateType = "Mini";
        req.Data.DataType = "json";
      } else if (AppHelper.isWechatH5()) {
        req.Data.CreateType = "JsSdk";
        req.Data.DataType = "json";
      }
      return new Promise<any>((resolve, reject) => {
        const sub = this.apiService.getResponse<any>(req).subscribe(
          async (r) => {
            if (r.Status && r.Data) {
              if (typeof r.Data.Status == "boolean") {
                if (!r.Data.Status) {
                  reject(r.Data.Message || r.Data.Code);
                  return;
                }
              }
              if (AppHelper.isWechatMini()) {
                const key = AppHelper.uuid();
                const token =
                  (this.apiService.apiConfig &&
                    this.apiService.apiConfig.Token) ||
                  "";
                const url =
                  "/pages/pay/index?timeStamp=" +
                  r.Data.timeStamp +
                  "&nonceStr=" +
                  r.Data.nonceStr +
                  "&package=" +
                  encodeURIComponent(r.Data.package) +
                  "&signType=" +
                  r.Data.signType +
                  "&paySign=" +
                  r.Data.paySign +
                  "&openid=" +
                  WechatHelper.getMiniOpenId() +
                  "&" +
                  AppHelper.getTicketName() +
                  "=" +
                  AppHelper.getTicket() +
                  "&path=" +
                  path +
                  "&number=" +
                  r.Data.Number +
                  "&key=" +
                  key +
                  "&token=" +
                  token;
                WechatHelper.wx.miniProgram.navigateTo({ url: url });
                WechatHelper.checkStep(key, this.apiService, (val) => {
                  try {
                    callback(r.Data.Number || "支付操作完成");
                  } catch (e) {}
                });
                resolve(r.Data.Number || "支付操作完成");
              } else if (AppHelper.isWechatH5()) {
                await WechatHelper.ready().catch(() => false);
                WechatHelper.wx.chooseWXPay({
                  timestamp: r.Data.timeStamp,
                  nonceStr: r.Data.nonceStr, // 支付签名随机串，不长于 32 位
                  package: r.Data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                  signType: r.Data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                  paySign: r.Data.paySign, // 支付签名
                  success: (res) => {
                    resolve(r.Data.Number || "支付操作完成");
                  },
                  cancel: (r) => {
                    reject(Wechat_Pay_Error_Message_Cancel);
                  },
                  fail: (e) => {
                    console.log("wechat h5 pay fail", e);
                    const emsg = e && (e.errMsg as string);
                    if (emsg) {
                      if (emsg.toLowerCase() == "choosewxpay:cancel") {
                        reject(Wechat_Pay_Error_Message_Cancel);
                      } else {
                        reject("支付失败");
                      }
                    } else {
                      reject(e || "支付失败");
                    }
                    if (typeof callback == "function") {
                      const msg =
                        emsg && emsg.includes("cancel")
                          ? Wechat_Pay_Error_Message_Cancel
                          : emsg;
                      callback(msg || "支付失败");
                    }
                  },
                });
              } else {
                if (!r.Data.appid) {
                  return;
                }
                const payInfo = {
                  appId: r.Data.appid,
                  partnerId: r.Data.partnerid,
                  prepayId: r.Data.prepayid,
                  packageValue: r.Data.package,
                  nonceStr: r.Data.noncestr,
                  timeStamp: r.Data.timestamp,
                  sign: r.Data.sign,
                };
                this.wechat
                  .pay(payInfo as any)
                  .then((n) => {
                    console.log(
                      "wechat 支付成功返回结果：" + JSON.stringify(n)
                    );
                    resolve(r.Data.Number || "支付操作完成");
                  })
                  .catch((e) => {
                    console.log("wechat 支付成功返回结果：" + typeof e);
                    console.log(
                      "wechat 支付成功返回结果：" + JSON.stringify(e)
                    );
                    // AppHelper.alert(e.message || e);
                    reject(
                      e.message || `${e}`.includes("-2")
                        ? "用户取消"
                        : `${e}`.includes("-1")
                        ? "签名错误、未注册APPID、项目设置APPID不正确、注册的APPID与设置的不匹配"
                        : `微信支付结果：${e}`.replace(",(null)", "")
                    );
                  });
              }
            } else {
              reject(
                (r && (r.Message || (r.Data && r.Data.Message))) || "操作失败"
              );
            }
          },
          (e) => {
            this.addPayMessage(e, "wechatpay");
            reject(e);
          },
          () => {
            setTimeout(() => {
              sub.unsubscribe();
            }, 1000);
          }
        );
      });
    } else if (AppHelper.isH5()) {
      req.Data.CreateType = "Mobile";
      this.payMobile(req, path);
    }
  }

  payMobile(req: RequestEntity, path: string) {
    if (path && path.includes("?")) {
      path = path.replace("?", "&");
    }
    let url =
      AppHelper.getApiUrl() +
      `/home/Pay?${AppHelper.getTicketName()}=` +
      AppHelper.getTicket() +
      "&path=" +
      path +
      "&openid=" +
      (WechatHelper.getOpenId() || "");
    for (const r in req) {
      if (r.toLowerCase() == AppHelper.getTicketName() || r.toLowerCase() == "path" || r.toLowerCase() == "openid")  {
        continue;
      }
      url +=
        "&" +
        r +
        "=" +
        (typeof req[r] == "string" ? req[r] : JSON.stringify(req[r]));
    }
    if (!AppHelper.isApp()) {
      window.location.href = url;
    } else {
      this.router.navigate(["open-url"], {
        queryParams: {
          url,
          isOpenInAppBrowser: true,
        },
      });
    }
  }

  process(req: RequestEntity) {
    return new Promise<any>((resolve, reject) => {
      const sub = this.apiService.getResponse<{}>(req).subscribe(
        (r) => {
          if (r && r.Status) {
            resolve(r.Data);
          } else {
            reject(r.Message);
          }
        },
        (e) => {
          reject(e);
        },
        () => {
          setTimeout(() => {
            sub.unsubscribe();
          }, 200);
        }
      );
    });
  }
}
export interface IPayMessage {
  timeStamp: number;
  message?: string;
  remark?: string;
}
export interface IAliPayPluginPayResult {
  memo: string;
  result: {
    alipay_trade_app_pay_response: {
      code: string; //10000,
      msg: string; // Success,
      app_id: string; // 2014072300007148,
      out_trade_no: string; // 081622560194853,
      trade_no: string; //2016081621001004400236957647,
      total_amount: string; // 0.01,
      seller_id: string; // 2088702849871851,
      charset: string; // utf-8,
      timestamp: string; // 2016-10-11 17:43:36
      sub_code?: string;
      sub_msg?: string;
    };
    sign: string; // ********,
    sign_type: string; // RSA2
  };
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
  resultStatus:
    | "9000"
    | "8000"
    | "4000"
    | "5000"
    | "6001"
    | "6002"
    | "6004"
    | "其它"; // 9000
}
export interface Ali {
  pay: (payInfo: string) => Promise<IAliPayPluginPayResult>;
}
interface Wechat {
  pay: (payInfo: any) => Promise<any>;
}
