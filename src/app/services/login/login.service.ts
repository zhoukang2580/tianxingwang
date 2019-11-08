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

@Injectable({
  providedIn: "root"
})
export class LoginService {
  identity: IdentityEntity;
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
    private http: HttpClient
  ) {
    this.identityService.getIdentitySource().subscribe(id => {
      this.identity = id;
    });
  }
  setToPageRouter(pageRouter: string) {
    this._toPageRouter = pageRouter;
  }
  getToPageRouter() {
    return this._toPageRouter || "";
  }

  checkIsDeviceBinded(deviceNumber: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "ApiPasswordUrl-Device-Check";
    req.Data = {
      DeviceNumber: deviceNumber
    };
    return this.apiService.getResponse<{
      IsActiveMobile: boolean;
      Mobile: string;
    }>(req);
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
        Numbers: { [key: string]: string };
      }>(req)
      .pipe(
        tap(r => console.log("Login", r)),
        switchMap(r => {
          if (!r.Status) {
            return throwError(r.Message);
          }
          this.identityService.setIdentity(r.Data);
          return of( r.Data)
        }),
        tap(rid => {
        })
      );
  }
  logout() {
    const ticket = AppHelper.getTicket();
    if (ticket) {
      const req = new RequestEntity();
      req.IsShowLoading = true;
      req.Method = "ApiLoginUrl-Home-Logout";
      req.Data = JSON.stringify({ Ticket: ticket });
      req.Timestamp = Math.floor(Date.now() / 1000);
      req.Language = AppHelper.getLanguage();
      req.Ticket = AppHelper.getTicket();
      req.Domain = AppHelper.getDomain();
      this.apiService.showLoadingView();
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
