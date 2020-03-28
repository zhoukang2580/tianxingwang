import { HttpClient } from "@angular/common/http";
import { IdentityEntity } from "../identity/identity.entity";
import { RequestEntity } from "../api/Request.entity";
import { ApiService } from "../api/api.service";
import { IdentityService } from "../identity/identity.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { tap, switchMap, map, finalize } from "rxjs/operators";
import { of, throwError } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { IResponse } from "../api/IResponse";
import { LanguageHelper } from "src/app/languageHelper";

@Injectable({
  providedIn: "root"
})
export class LoginService {
  identity: IdentityEntity;
  private imageValue: string;
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
    private http: HttpClient
  ) {
    this.identityService.getIdentitySource().subscribe(id => {
      this.identity = id;
    });
  }
  setToPageRouter(pageRouter: string) {
    this.toPageRouter = pageRouter;
  }
  getToPageRouter() {
    return this.toPageRouter || "";
  }

  checkIsDeviceBinded(deviceNumber: string) {
    const req = new RequestEntity();
    console.log("uuid " + deviceNumber);
    // req.IsShowLoading = true;
    req.Method = "ApiPasswordUrl-Device-Check";
    req.Data = {
      DeviceNumber: deviceNumber
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
      .subscribe(res => {
        console.log("checkIsDeviceBinded " + JSON.stringify(res, null, 2));
        if (res.Status && res.Data) {
          // 需要绑定
          this.router.navigate([
            AppHelper.getRoutePath("account-bind"),
            {
              IsActiveMobile: res.Data.IsActiveMobile,
              Mobile: res.Data.Mobile,
              Path: this.getToPageRouter()
            }
          ]);
        }
        // else if (res.Message) {
        //   AppHelper.alert(res.Message);
        // }
      });
  }

  checkIsWechatBind(mock = false) {
    if (this.checkPathIsWechatOrDingtalk()) {
      return;
    }
    if (
      mock ||
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
        SdkType: sdkType
      };
      const toRoute = "account-wechat";
      this.apiService.getResponse<any>(req).subscribe(res => {
        this.processCheckResult(res, toRoute);
      });
    }
  }
  private checkPathIsWechatOrDingtalk() {
    const path: string = AppHelper.getQueryParamers()['path'] || "";
    return path.toLowerCase() == 'account-wechat' || path.toLowerCase() == 'account-dingtalk';
  }
  checkIsDingtalkBind(mock = false) {
    const req = new RequestEntity();
    req.Method = `ApiPasswordUrl-DingTalk-Check`;
    req.Data = {
      SdkType: "DingTalk"
    };
    if (this.checkPathIsWechatOrDingtalk()) {
      return;
    }
    if (mock || AppHelper.isDingtalkH5()) {
      const sub = this.apiService
        .getResponse<any>(req)
        .pipe(
          finalize(() => {
            setTimeout(() => {
              sub.unsubscribe();
            }, 1000);
          })
        )
        .subscribe(res => {
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
        tap(r => console.log("Login", r)),
        switchMap(r => {
          if (!r.Status) {
            return throwError(r.Message);
          }
          this.identityService.setIdentity(r.Data);
          if (r.Data && r.Data.Token) {
            AppHelper.setStorage("loginToken", r.Data.Token);
          }
          return of(r.Data);
        }),
        tap(rid => {})
      );
  }
  logout() {
    const ticket = AppHelper.getTicket();
    if (ticket) {
      AppHelper.setStorage("loginToken", null);
      const req = new RequestEntity();
      req.IsShowLoading = true;
      req.Method = "ApiLoginUrl-Home-Logout";
      req.Data = JSON.stringify({ Ticket: ticket });
      req.Timestamp = Math.floor(Date.now() / 1000);
      req.Language = AppHelper.getLanguage();
      req.Ticket = AppHelper.getTicket();
      req.Domain = AppHelper.getDomain();
      this.apiService.showLoadingView({msg:"正在退出账号..."});
      const formObj = Object.keys(req)
        .map(k => `${k}=${req[k]}`)
        .join("&");
      const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
      return this.http
        .post(url, formObj, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body"
        })
        .pipe(
          map((r: IResponse<IdentityEntity>) => r),
          finalize(() => {
            this.apiService.hideLoadingView();
          })
        )
        .subscribe(
          r => {
            this.identityService.removeIdentity();
            this.router.navigate([AppHelper.getRoutePath("login")]);
          },
          _ => {
            this.identityService.removeIdentity();
            this.router.navigate([AppHelper.getRoutePath("login")]);
          }
        );
    } else {
      this.identityService.removeIdentity();
      this.router.navigate([AppHelper.getRoutePath("login")]);
    }
  }
  async checkIdentity() {
    if (!this.identity) {
      const r = await this.autoLogin();
      return r;
    } else {
      return true; // 直接跳转到首页，然后经过授权验证守卫验证
    }
  }
  async autoLogin() {
    if (AppHelper.getStorage<string>("loginToken")) {
      const req = new RequestEntity();
      req.Method = "ApiLoginUrl-Home-TokenLogin";
      req.Data = JSON.stringify({
        UUID: await AppHelper.getDeviceId(),
        Token: AppHelper.getStorage("loginToken")
      });

      return new Promise<boolean>((resolve, reject) => {
        const sub = this.apiService
          .getResponse<{
            Ticket: string; // "";
            Id: string; // ;
            Name: string; // "";
            IsShareTicket: boolean; // false;
            Numbers: { [key: string]: string };
          }>(req)
          .pipe(
            finalize(() => {
              setTimeout(() => {
                if (sub) {
                  sub.unsubscribe();
                }
              }, 3000);
            })
          )
          .subscribe(
            rid => {
              if (!rid) {
                return resolve(false);
              }
              const id: IdentityEntity = new IdentityEntity();
              id.Name = rid.Data.Name;
              id.Ticket = rid.Data.Ticket;
              id.IsShareTicket = rid.Data.IsShareTicket;
              id.Numbers = rid.Data.Numbers;
              this.identityService.setIdentity(id);
              return resolve(true);
            },
            e => {
              reject(e);
            }
          );
      });
    }
    return false;
  }
}
