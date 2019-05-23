import { HttpClient } from "@angular/common/http";
import { IdentityEntity } from "../identity/identity.entity";
import { BaseRequest } from "../api/BaseRequest";
import { ApiService } from "../api/api.service";
import { IdentityService } from "../identity/identity.service";
import { Injectable } from "@angular/core";
import { LoginEntity } from "./login.entity";
import { Router } from "@angular/router";
import { tap, switchMap, map, finalize } from "rxjs/operators";
import { of, throwError, from, merge } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { Platform, LoadingController } from "@ionic/angular";
import { IResponse } from "../api/IResponse";

@Injectable({
  providedIn: "root"
})
export class LoginService {
  private _imageValue: string;
  set ImageValue(value: string) {
    this._imageValue = value;
  }
  get ImageValue() {
    return encodeURIComponent(this._imageValue);
  }
  private _toPageRouter: string; // 因要授权而不能跳转的页面
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private apiService: ApiService,
    private platService: Platform,
    private http: HttpClient
  ) { }
  setToPageRouter(pageRouter: string) {
    this._toPageRouter = pageRouter;
  }
  getToPageRouter() {
    return this._toPageRouter || "";
  }
  userLogin(entity: LoginEntity) {
    return this.login(
      "ApiLoginUrl-Home-Login",
      entity.Name,
      entity.Password,
      entity.ImageCode,
      this.ImageValue
    );
  }
  checkIsDeviceBinded(deviceNumber: string) {
    const req = new BaseRequest();
    req.IsShowLoading = true;
    req.Method = 'ApiPasswordUrl-Device-Check';
    req.Data = {
      DeviceNumber: deviceNumber
    };
    return this.apiService.getResponse<{
      IsActiveMobile: boolean;
      Mobile: string;
    }>(req);
  }
  deviceLogin(entity: LoginEntity) {
    return from(AppHelper.getUUID()).pipe(
      switchMap(uuid =>
        this.login(
          "ApiLoginUrl-Home-DeviceLogin",
          AppHelper.getStorage("identityId"),
          uuid,
          "",
          ""
        )
      )
    );
  }
  mobileLogin(entity: LoginEntity) {
    return this.login(
      "ApiLoginUrl-Home-MobileLogin",
      entity.Mobile,
      entity.MobileCode,
      entity.ImageCode,
      this.ImageValue
    );
  }
  wechatLogin(entity: LoginEntity) {
    return this.login(
      "ApiLoginUrl-Home-WechatLogin",
      "",
      entity.WechatCode,
      "",
      ""
    );
  }
  dingtalkLogin(entity: LoginEntity) {
    return this.login(
      "ApiLoginUrl-Home-DingTalkLogin",
      "",
      entity.DingtalkCode,
      "",
      ""
    );
  }
  getImage() {
    const req = new BaseRequest();
    req.Method = "Home-CreateCode";
    req.Url = AppHelper.getApiUrl();
    return merge(of("assets/images/loading.gif"),
      this.http.get(`${AppHelper.getApiUrl()}/Home/CreateCode`).pipe(
        map((r: IResponse<{ Code: string; Value: string }>) => {
          console.log("code: " + r.Data.Code + " value: " + r.Data.Value);
          if (r.Data) {
            this.ImageValue = r.Data.Value;
            return `${AppHelper.getApiUrl()}/Home/ImageCode?code=${r.Data.Code}`;
          }
          this.ImageValue = null;
          return r.Message || "网络错误";
        })
      )
    );
  }
  sendMobileCode(mobile: string, imageCode: string = null) {
    const req = new BaseRequest();
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
  login(method: string, name: string, password: string, imageCode: string, imageValue: string) {
    const req = new BaseRequest();
    req.Method = method;
    if (imageCode) {
      req.ImageCode = imageCode;
      req.ImageValue = this.ImageValue;
    }
    req.Data = JSON.stringify({
      Name: name,
      Password: password
    });
    AppHelper.setStorage("loginName", name);
    return this.apiService
      .getResponse<{
        Ticket: string; // "";
        Id: string; // ;
        Name: string; // "";
        IsShareTicket: boolean; // false;
        Numbers: { [key: string]: string };
      }>(req)
      .pipe(
        tap(r => console.log("Login", r)),
        switchMap(r => {
          if (!r.Status) {
            return throwError(r.Message);
          }
          return of(r.Data);
        }),
        tap(rid => {
          const id: IdentityEntity = new IdentityEntity();
          id.Name = name;
          id.Ticket = rid.Ticket;
          id.IsShareTicket = rid.IsShareTicket;
          id.Numbers = rid.Numbers;
          id.Id = rid.Id;
          this.identityService.setIdentity(id);
        })
      );
  }
  logout() {
    debugger;
    const ticket = AppHelper.getTicket();
    if (ticket) {
      const req = new BaseRequest();
      req.IsShowLoading=true;
      req.Method = "ApiLoginUrl-Home-Logout";
      req.Data = JSON.stringify({ Ticket: ticket });
      req.Timestamp = Math.floor(Date.now() / 1000);
      req.Language = AppHelper.getLanguage();
      req.Ticket = AppHelper.getTicket();
      req.Domain = AppHelper.getDomain();
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
          map((r: IResponse<IdentityEntity>) => r)
        ).subscribe(r => {
          if (r.Status) {
            this.identityService.removeIdentity();
            this.router.navigate([AppHelper.getRoutePath("login")]);
            return of(r.Data);
          }
          else if(r.Code.toUpperCase()=="NOLOGIN")
          {
            this.identityService.removeIdentity();
            this.router.navigate([AppHelper.getRoutePath("login")]);
          }
        });
    }
    else
    {
      this.identityService.removeIdentity();
      this.router.navigate([AppHelper.getRoutePath("login")]);
    }

  }
  async checkIdentity() {
    const result = await this.identityService.getIdentity();
    if (!result) {
      const r = await this.autoLogin();
      return r;
    } else {
      return true; // 直接跳转到首页，然后经过授权验证守卫验证
    }
  }
  async autoLogin() {

    if (AppHelper.getStorage<string>("identityId")) {
      const id = AppHelper.getStorage<string>("identityId");
      const req = new BaseRequest();
      req.Method = "ApiLoginUrl-Home-DeviceLogin";
      req.Data = JSON.stringify({
        Id: id,
        Password: await AppHelper.getUUID()
      });

      return new Promise<boolean>((resolve, reject) => {
        this.apiService
          .getResponse<{
            Ticket: string; // "";
            Id: string; // ;
            Name: string; // "";
            IsShareTicket: boolean; // false;
            Numbers: { [key: string]: string };
          }>(req)
          .pipe(
            finalize(() => {
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
