import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as md5 from "md5";
import { RequestEntity } from "./Request.entity";
import { AppHelper } from "../../appHelper";
import {
  map,
  tap,
  catchError,
  finalize,
  switchMap,
  timeout,
  delay,
  exhaust
} from "rxjs/operators";
import { IResponse } from "./IResponse";
import {
  of,
  Subject,
  BehaviorSubject,
  throwError,
  from,
  Observable,
  TimeoutError
} from "rxjs";
import { ExceptionEntity } from "../log/exception.entity";
import { Router } from "@angular/router";
import { IdentityEntity } from "../identity/identity.entity";
import { IdentityService } from "../identity/identity.service";
import { LoadingController } from "@ionic/angular";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";
interface ApiConfig {
  Urls: { [key: string]: string };
  Token: string;
}
@Injectable({
  providedIn: "root"
})
export class ApiService {
  private loadingSubject: Subject<boolean>;
  public apiConfig: ApiConfig;
  constructor(
    private http: HttpClient,
    private router: Router,
    private identityService: IdentityService,
    private loadingCtrl: LoadingController
  ) {
    this.loadingSubject = new BehaviorSubject(false);
    setTimeout(() => {
      console.log("loadApiConfig");
      this.loadApiConfig()
        .then(_ => {
          console.log("loadApiConfig complete");
        })
        .catch(e => {
          console.log("loadApiConfig error", e);
        });
    }, 0);
  }
  getLoading() {
    return this.loadingSubject.asObservable().pipe(delay(0));
  }
  async setLoading(loading: boolean, isShowLoading: boolean) {
    // if (loading && isShowLoading) {
    //    this.showLoadingView();
    // }
    // if (!loading) {
    //    this.hideLoadingView();
    // }
    this.loadingSubject.next(loading && isShowLoading);
  }
   showLoadingView() {
    // console.log("showLoadingView");
    // const l = document.querySelector("ion-loading");
    // console.log("showLoadingView", l);
    // if (l) {
    //   await this.loadingCtrl.dismiss();
    // }
    // const t = await this.loadingCtrl.create();
    // if (t) {
    //   await t.present();
    // }
    this.loadingSubject.next(true);
  }
   hideLoadingView() {
    // return new Promise(s => {
    //   setTimeout(() => {
    //     this.loadingCtrl.dismiss().catch(_ => {
    //       console.log("hideLoadingView", _);
    //     });
    //     s();
    //   }, 1000);
    // });
    this.loadingSubject.next(false);
  }
  send<T>(
    method: string,
    data: any,
    version: string = "1.0",
    showLoading: boolean = false
  ) {
    const req = new RequestEntity();
    req.Method = method;
    req.Version = version;
    if (data) {
      req.Data = JSON.stringify(data);
    }
    req.IsShowLoading = showLoading;
    return this.getResponse<T>(req);
  }
  getResponse<T>(req: RequestEntity): Observable<IResponse<T>> {
    return this.sendRequest(req, true);
  }
  getPromiseResponse<T>(req: RequestEntity): Promise<T> {
    return new Promise((resolve, reject) => {
      const sub = this.getResponse<T>(req).subscribe(
        r => {
          if (r.Status) {
            resolve(r.Data);
          } else {
            reject(r.Message);
          }
        },
        e => {
          reject(e);
        },
        () => {
          setTimeout(() => {
            if (sub) {
              if (environment.production) {
                console.log("接口调用 sub.unsubscribe();");
              }
              sub.unsubscribe();
            }
          }, 500);
        }
      );
    });
  }
  createRequest() {
    const req = new RequestEntity();
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    if (this.apiConfig) {
      req.Token = this.apiConfig.Token;
    }
    return req;
  }
  async getUrl(req: RequestEntity) {
    req.Url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    if (!req.IsForward && !this.apiConfig) {
      await this.loadApiConfig();
    }
    if (this.apiConfig && !req.IsForward && req.Method) {
      const urls = req.Method.split("-");
      const url = this.apiConfig.Urls[urls[0]];
      if (url) {
        req.Url = url + "/" + urls[1] + "/" + urls[2];
      }
    }
    return req.Url;
  }
  async tryAutoLogin(orgReq: RequestEntity) {
    const req = this.createRequest();
    if (AppHelper.isApp()) {
      const device = await AppHelper.getDeviceId();
      req.Method = "ApiLoginUrl-Home-DeviceLogin";
      req.Data = JSON.stringify({
        Device: device,
        Token: AppHelper.getStorage("loginToken")
      });
    } else if (AppHelper.isWechatH5()) {
      const code = "";
      req.Method = "ApiLoginUrl-Home-WechatLogin";
      req.Data = JSON.stringify({
        Code: code
      });
    } else if (AppHelper.isWechatMini()) {
      const code = "";
      req.Method = "ApiLoginUrl-Home-WechatLogin";
      req.Data = JSON.stringify({
        Code: code,
        SdkType: "Mini"
      });
    } else if (AppHelper.isDingtalkH5()) {
      const code = "";
      req.Method = "ApiLoginUrl-Home-DingtalkLogin";
      req.Data = JSON.stringify({
        Code: code
      });
    }
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");

    const url = await this.getUrl(req);
    return new Promise((resolve, reject) => {
      const subscribtion = this.http
        .post(url, formObj, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body"
        })
        .pipe(
          map(r => r as any),
          switchMap((r: IResponse<any>) => {
            if (r.Status && !r.Data) {
              const id: IdentityEntity = new IdentityEntity();
              id.Name = r.Data.Name;
              id.Ticket = r.Data.Ticket;
              id.IsShareTicket = r.Data.IsShareTicket;
              id.Numbers = r.Data.Numbers;
              id.Id = r.Data.Id;
              this.identityService.setIdentity(id);
              return this.sendRequest(orgReq, false);
            }
            this.identityService.removeIdentity();
            this.router.navigate([AppHelper.getRoutePath("login")]);
            return of(r);
          })
        )
        .subscribe(
          r => {
            resolve(r);
          },
          e => {
            reject(e);
          },
          () => {
            setTimeout(() => {
              if (subscribtion) {
                subscribtion.unsubscribe();
              }
            }, 10);
          }
        );
    });
  }

  private sendRequest(
    request: RequestEntity,
    isCheckLogin: boolean
  ): Observable<IResponse<any>> {
    const req = { ...request };
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    if (req.Data && typeof req.Data != "string") {
      req.Data = JSON.stringify(req.Data);
    }

    this.setLoading(true, req.IsShowLoading);
    const due = 30 * 1000;
    return from(this.loadApiConfig()).pipe(
      switchMap(config => {
        if (!config) {
          return throwError("api config error");
        }
        return from(this.getUrl(req));
      }),
      switchMap(url => {
        req.Token = this.apiConfig.Token;
        const formObj = Object.keys(req)
          .map(k => `${k}=${req[k]}`)
          .join("&");
        return this.http.post(url, `${formObj}&Sign=${this.getSign(req)}`, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body"
        });
      }),
      timeout(due),
      tap(r => console.log(r)),
      map(r => r as any),
      switchMap((r: IResponse<any>) => {
        if (isCheckLogin && r.Code && r.Code.toUpperCase() === "NOLOGIN") {
          return from(this.tryAutoLogin(req));
        } else if (r.Code && r.Code.toUpperCase() === "NOLOGIN") {
          this.router.navigate([AppHelper.getRoutePath("login")]);
        }
        return of(r);
      }),
      catchError((error: Error | any) => {
        const entity = new ExceptionEntity();
        entity.Error = error;
        entity.Method = req.Method;
        entity.Message = LanguageHelper.getApiExceptionTip();
        if (error instanceof TimeoutError) {
          entity.Message = LanguageHelper.getApiTimeoutTip();
        }
        return throwError(error);
      }),
      finalize(() => {
        this.setLoading(false, req.IsShowLoading);
      }),
      map(r => r as any)
    );
  }

  async loadApiConfig(): Promise<ApiConfig> {
    if (this.apiConfig) {
      return Promise.resolve(this.apiConfig);
    }
    const url = AppHelper.getApiUrl() + "/Home/ApiConfig";
    const due = 30 * 1000;
    return new Promise<ApiConfig>(s => {
      const sub = this.http
        .get(url)
        .pipe(
          timeout(due),
          finalize(() => {
            setTimeout(() => {
              if (sub) {
                console.log("loadUrls unsubscribe");
                sub.unsubscribe();
              }
            }, 3000);
          })
        )
        .subscribe(
          (r: IResponse<ApiConfig>) => {
            if (r.Data) {
              this.apiConfig = r.Data;
              s(this.apiConfig);
            }
            s(null);
          },
          e => {
            s(null);
          }
        );
    });
  }
  getSign(req: RequestEntity) {
    return md5(
      `${typeof req.Data === "string" ? req.Data : JSON.stringify(req.Data)}${
        req.Timestamp
      }${req.Token}`
    ) as string;
  }
}
