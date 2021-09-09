import { HttpClient } from "@angular/common/http";
import { IdentityEntity } from "../identity/identity.entity";
import { RequestEntity } from "../api/Request.entity";
import { ApiService } from "../api/api.service";
import { IdentityService } from "../identity/identity.service";
import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { tap, switchMap, map, finalize } from "rxjs/operators";
import { of, throwError } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { IResponse } from "../api/IResponse";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";
import { AccountMobilePage } from "src/app/account/account-mobile/account-mobile.page";
import { AccountPasswordPage } from "src/app/account/account-password/account-password.page";
import { StorageService } from "../storage-service.service";
@Injectable({
  providedIn: "root",
})
export class LoginService {
  identity: IdentityEntity;
  preventAutoLogin = false;
  private checkLoginTime = 2 * 60 * 1000;
  private imageValue: string;
  private isAutoLoginPromise: Promise<boolean>;
  set ImageValue(value: string) {
    this.imageValue = value;
  }
  get ImageValue() {
    return encodeURIComponent(this.imageValue);
  }
  private toPageRouter: string; // 因要授权而不能跳转的页面
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient,
    private storage: StorageService,
    private ngZone: NgZone
  ) {
    this.identityService.getIdentitySource().subscribe((id) => {
      this.identity = id;
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.check();
        }, this.checkLoginTime);
      });
    });
  }
  checkIsDeviceBinded(deviceNumber: string) {
    const req = new RequestEntity();
    console.log("uuid " + deviceNumber);
    // req.IsShowLoading = true;
    req.Method = "ApiPasswordUrl-Device-Check";
    req.Data = {
      DeviceNumber: deviceNumber,
    };
    const sub = this.apiService
      .getResponse<{
        IsActiveMobile: boolean;
        Mobile: string;
      }>(req)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            sub.unsubscribe();
          }, 1000);
        })
      )
      .subscribe((res) => {
        console.log("checkIsDeviceBinded " + JSON.stringify(res, null, 2));
        if (res.Status && res.Data) {
          // 需要绑定
          this.router.navigate([AppHelper.getRoutePath("account-bind")], {
            queryParams: {
              IsActiveMobile: res.Data.IsActiveMobile,
              Mobile: res.Data.Mobile,
              Path: AppHelper.getToPageAfterAuthorize(),
            },
          });
        }
        // else if (res.Message) {
        //   AppHelper.alert(res.Message);
        // }
      });
  }

  checkIsWechatBind() {
    if (this.checkPathIsWechatOrDingtalk()) {
      return;
    }
    if (
      AppHelper.isWechatH5() ||
      AppHelper.isWechatMini() ||
      AppHelper.isApp()
    ) {
      const sdkType = AppHelper.isWechatH5()
        ? ""
        : AppHelper.isWechatMini()
        ? "Mini"
        : AppHelper.isApp()
        ? "App"
        : "";
      const req = new RequestEntity();
      req.Method = `ApiPasswordUrl-Wechat-Check`;
      req.Data = {
        SdkType: sdkType,
      };
      const toRoute = "account-wechat";
      this.apiService.getResponse<any>(req).subscribe((res) => {
        this.processCheckResult(res, toRoute);
      });
    }
  }
  private checkPathIsWechatOrDingtalk() {
    const path: string = AppHelper.getQueryParamers()["path"] || "";
    return (
      path.toLowerCase() == "account-wechat" ||
      path.toLowerCase() == "account-dingtalk"
    );
  }
  checkIsDingtalkBind() {
    const req = new RequestEntity();
    req.Method = `ApiPasswordUrl-DingTalk-Check`;
    req.Data = {
      SdkType: "DingTalk",
    };
    if (this.checkPathIsWechatOrDingtalk()) {
      return;
    }
    if (AppHelper.isDingtalkH5()) {
      const sub = this.apiService
        .getResponse<any>(req)
        .pipe(
          finalize(() => {
            setTimeout(() => {
              sub.unsubscribe();
            }, 1000);
          })
        )
        .subscribe((res) => {
          this.processCheckResult(res, "account-dingtalk");
        });
    }
  }
  private async processCheckResult(
    res: {
      Status: boolean;
      Message: string;
    },
    toRoute: string
  ) {
    if (res.Status) {
      if (res.Message) {
        const ok = await AppHelper.alert(
          res.Message,
          true,
          LanguageHelper.getYesTip(),
          LanguageHelper.getNegativeTip()
        );
        if (ok) {
          this.router.navigate([AppHelper.getRoutePath(toRoute)]);
        }
      }
    }
    // else if (res.Message) {
    //   AppHelper.alert(res.Message);
    // }
  }
  sendMobileCode(mobile: string, imageCode: string = null) {
    const req = new RequestEntity();
    req.Url = AppHelper.getApiUrl() + "/Home/SendLoginMobileCode";
    if (imageCode) {
      req.ImageCode = imageCode;
      req.ImageValue = this.ImageValue;
    }
    req.Data = JSON.stringify({ Mobile: mobile });
    var paramters = AppHelper.getQueryParamers();
    if (paramters) {
      for (var p in paramters) {
        req[p] = paramters[p];
      }
    }
    return this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req);
  }
  getLoading() {
    return this.apiService.getLoading();
  }
  login(method: string, req: RequestEntity) {
    req.Method = method;
    if (!req.Data) {
      req.Data = {};
    }
    req.Data.LoginType = this.getLoginType();
    return this.apiService
      .getResponse<{
        Ticket: string; // "";
        Id: string; // ;
        Name: string; // "";
        IsShareTicket: boolean; // false;
        Token: string;
        Numbers: { [key: string]: string };
      }>(req)
      .pipe(
        tap((r) => console.log("Login", r)),
        switchMap((r) => {
          if (!r.Status) {
            return throwError(r.Message);
          }
          this.identityService.setIdentity(r.Data);
          if (r.Data && r.Data.Token) {
            AppHelper.setStorage("loginToken", r.Data.Token);
          }
          return of(r.Data);
        }),
        tap(() => {
          this.preventAutoLogin = false;
        })
      );
  }
  logout() {
    const ticket = AppHelper.getTicket();
    this.preventAutoLogin = true;
    if (ticket) {
      AppHelper.setStorage("loginToken", null);
      const req = new RequestEntity();
      req.IsShowLoading = true;
      req.Method = "ApiLoginUrl-Home-Logout";
      req.Data = JSON.stringify({
        Ticket: ticket,
        [AppHelper.getTicketName()]: ticket,
      });

      this.apiService.showLoadingView({ msg: "正在退出账号..." });
      const formObj = Object.keys(req)
        .map((k) => `${k}=${req[k]}`)
        .join("&");
      const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
      return this.http
        .post(url, formObj, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body",
        })
        .pipe(
          map((r: IResponse<IdentityEntity>) => r),
          finalize(() => {
            this.apiService.hideLoadingView();
          })
        )
        .subscribe(
          (r) => {
            this.identityService.removeIdentity();
            this.goToLoginPage("");
          },
          (_) => {
            this.identityService.removeIdentity();
            this.goToLoginPage("");
          }
        );
    } else {
      this.identityService.removeIdentity();
      this.goToLoginPage("");
    }
  }
  async checkIfForceAction() {
    let isForceBindMobile = AppHelper.getQueryParamers()["IsForceBindMobile"];
    let isForceModifyPassword =
      AppHelper.getQueryParamers()["IsForceModifyPassword"];
    if (isForceBindMobile == "true") {
      const m = await AppHelper.modalController.create({
        component: AccountMobilePage,
        componentProps: {
          isOpenAsModal: true,
        },
      });
      m.present();
      const d = await m.onDidDismiss();
      isForceBindMobile = AppHelper.getQueryParamers()["IsForceBindMobile"];
      if (isForceBindMobile == "true") {
        await this.checkIfForceAction();
      }
    }
    if (isForceModifyPassword == "true") {
      const m = await AppHelper.modalController.create({
        component: AccountPasswordPage,
        componentProps: {
          isOpenAsModal: true,
          isShowOldPassword: false,
        },
      });
      m.present();
      const d = await m.onDidDismiss();
      isForceModifyPassword =
        AppHelper.getQueryParamers()["IsForceModifyPassword"];
      if (isForceModifyPassword == "true") {
        if (!d.data) {
          await this.checkIfForceAction();
        }
      }
    }
  }
  private goToLoginPage(path: string) {
    AppHelper.setToPageAfterAuthorize({
      path: path == "" || path ? path : this.router.url,
    });
    this.router.navigate([AppHelper.getRoutePath("login")]);
  }
  async check() {
    const ticket = AppHelper.getTicket();
    if (
      !this.identity ||
      !this.identity.Ticket ||
      !this.identity.Id ||
      !ticket ||
      environment.mockProBuild
    ) {
      return;
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "ApiHomeUrl-Identity-Check";
    req.Data = JSON.stringify({
      LoginType: this.getLoginType(),
    });
    let st = Date.now();
    const url = await this.getUrl(req);
    console.log(`ApiHomeUrl-Identity-Check getUrl ${Date.now() - st}`, url);
    if (!url) {
      return;
    }
    const formObj = Object.keys(req)
      .map((k) => `${k}=${req[k]}`)
      .join("&");
    st = Date.now();
    return this.http
      .post(url, formObj, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body",
      })
      .pipe(
        map((r: IResponse<IdentityEntity>) => r),
        finalize(() => {
          console.log(`用时${Date.now() - st}`);
        })
      )
      .subscribe((r) => {
        if (r.Status) {
          AppHelper.alert(r.Message, true, "确定").then((s) => {
            this.preventAutoLogin = true;
            this.identityService.removeIdentity();
            this.router.navigate([AppHelper.getRoutePath("login")]);
          });
        } else {
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.check();
            }, this.checkLoginTime);
          });
        }
      });
  }
  async getUrl(req: RequestEntity): Promise<string> {
    return this.apiService.getUrl(req);
  }
  async checkIdentity() {
    if (!this.identity) {
      const r = await this.autoLogin();
      return r;
    } else {
      return true; // 直接跳转到首页，然后经过授权验证守卫验证
    }
  }
  async autoLogin(showLoading?: { loadingMsg: string }) {
    if (this.preventAutoLogin || !AppHelper.isApp()) {
      return false;
    }
    if (this.isAutoLoginPromise) {
      return this.isAutoLoginPromise;
    }
    try {
      // 需要注意，判断if(isAutoLoginPromise)...到这里之前，不能有 await的代码，否则并发调用就不能得到有效的控制
      this.isAutoLoginPromise = new Promise<boolean>(async (rsv) => {
        console.log("autoLogin dddddd");
        const device = await AppHelper.getDeviceId();
        if (AppHelper.getStorage<string>("loginToken")) {
          const req = new RequestEntity();
          req.IsShowLoading = !!(showLoading && showLoading.loadingMsg);
          if (req.IsShowLoading) {
            req.LoadingMsg = showLoading.loadingMsg;
          }
          // req.Timeout = 10 * 1000; //十秒钟
          req.Method = "ApiLoginUrl-Home-DeviceLogin";
          req.Data = JSON.stringify({
            Device: device,
            Token: AppHelper.getStorage("loginToken"),
          });
          this.apiService
            .getPromiseData<{
              Ticket: string; // "";
              Id: string; // ;
              Name: string; // "";
              IsShareTicket: boolean; // false;
              Numbers: { [key: string]: string };
              Token: string;
            }>(req)
            .then((res) => {
              if (!res) {
                return false;
              }
              this.identityService.setIdentity(res);
              AppHelper.setStorage("logintoken", res.Token || "");
              return !!res;
            })
            .catch((e) => {
              console.error("autoLogin ApiLoginUrl-Home-DeviceLogin ", e);
              return false;
            })
            .then((r) => {
              rsv(r);
            })
            .finally(() => {
              this.isAutoLoginPromise = null;
            });
        }
      });
    } catch (e) {
      console.error("login service autoLogin error", e);
    }
    // 切记，返回一个promise，否则，需要在此之前，await this.isAutoLoginPromise
    return this.isAutoLoginPromise;
  }
  getLoginType() {
    if (AppHelper.isPDA()) {
      return "PDA";
    }
    if (AppHelper.isApp()) {
      return "App";
    }
    if (AppHelper.isDingtalkH5()) {
      return "DingtalkH5";
    }
    if (AppHelper.isWechatH5()) {
      return "WechatH5";
    }
    if (AppHelper.isWechatMini()) {
      return "WechatMini";
    }
    if (AppHelper.isH5()) {
      return "H5";
    }
    return "";
  }
}
