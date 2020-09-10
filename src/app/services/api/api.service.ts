import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
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
} from "rxjs/operators";
import { IResponse } from "./IResponse";
import {
  of,
  Subject,
  BehaviorSubject,
  throwError,
  from,
  Observable,
  TimeoutError,
} from "rxjs";
import { ExceptionEntity } from "../log/exception.entity";
import { Router, ActivatedRoute } from "@angular/router";
import { IdentityService } from "../identity/identity.service";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";
import { Storage } from "@ionic/storage";
interface ApiConfig {
  Urls: { [key: string]: string };
  Token: string;
}
@Injectable({
  providedIn: "root",
})
export class ApiService {
  private reqLoadingStatus: {
    reqMethod: string;
    isShow: boolean;
    msg: string;
  }[] = [];
  private loadingSubject: Subject<{ isLoading: boolean; msg: string }>;
  public apiConfig: ApiConfig;
  private fetchApiConfigPromise: Promise<any>;
  private tryAutoLoginPromise: Promise<IResponse<any>>;
  constructor(
    private http: HttpClient,
    private router: Router,
    private identityService: IdentityService,
    private storage: Storage,
    private route: ActivatedRoute
  ) {
    this.loadingSubject = new BehaviorSubject({ isLoading: false, msg: "" });
    this.storage
      .get(`KEY_API_CONFIG`)
      .then((config) => {
        if (config) {
          this.apiConfig = config;
        }
      })
      .finally(() => {
        this.loadApiConfig(true)
          .then((_) => { })
          .catch(() => { });
      });
  }
  getLoading() {
    return this.loadingSubject.asObservable().pipe(delay(0));
  }
  private setLoading(data: {
    msg: string;
    reqMethod: string;
    isShowLoading?: boolean;
  }) {
    const one = this.reqLoadingStatus.find(
      (it) => it.reqMethod == data.reqMethod
    );
    if (!one) {
      this.reqLoadingStatus.push({
        isShow: data.isShowLoading,
        reqMethod: data.reqMethod,
        msg: data.msg,
      });
    } else {
      one.isShow = data.isShowLoading;
      one.msg = data.msg;
    }
    const show = this.reqLoadingStatus.find((it) => it.isShow);
    if (show) {
      this.loadingSubject.next({ msg: show.msg, isLoading: true });
    } else {
      this.loadingSubject.next({ msg: "", isLoading: false });
    }
  }
  showLoadingView(d: { msg: string }) {
    this.setLoading({
      msg: d.msg,
      reqMethod: "showLoadingView",
      isShowLoading: true,
    });
  }
  hideLoadingView() {
    this.setLoading({
      msg: "",
      reqMethod: "showLoadingView",
      isShowLoading: false,
    });
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
  getPromise<T>(req: RequestEntity): Promise<IResponse<T>> {
    return new Promise((resolve, reject) => {
      const sub = this.getResponse<T>(req).subscribe(
        (r) => {
          resolve(r);
        },
        (e) => {
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
  getPromiseData<T>(req: RequestEntity): Promise<T> {
    return new Promise((resolve, reject) => {
      const sub = this.getResponse<T>(req).subscribe(
        (r) => {
          if (r.Status) {
            resolve(r.Data);
          } else {
            reject(r.Message || r);
          }
        },
        (e) => {
          reject(e.Message || e);
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
    if (this.apiConfig) {
      req.Token = this.apiConfig.Token;
    }
    return req;
  }
  async getUrl(req: RequestEntity): Promise<string> {
    let url: string;
    if (req.Url) {
      url = req.Url;
      return url;
    }
    req.Url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    if (!req.IsForward && !this.apiConfig) {
      await this.loadApiConfig();
    }
    if (url) {
      return url;
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
  async tryAutoLogin(res: IResponse<any>) {
    const req = this.createRequest();
    const device = await AppHelper.getDeviceId();
    req.Method = "ApiLoginUrl-Home-DeviceLogin";
    req.Data = JSON.stringify({
      Device: device,
      Token: AppHelper.getStorage("loginToken"),
    });
    const formObj = Object.keys(req)
      .filter((it) => it != "Url" && it != "IsShowLoading")
      .map((k) => `${k}=${req[k]}`)
      .join("&");
    const url = await this.getUrl(req);
    if (this.tryAutoLoginPromise) {
      return this.tryAutoLoginPromise;
    }
    this.tryAutoLoginPromise = new Promise<IResponse<any>>(
      (resolve, reject) => {
        const subscribtion = this.http
          .post(
            url,
            `${formObj}&Sign=${this.getSign(
              req
            )}&x-requested-with=XMLHttpRequest`,
            {
              headers: { "content-type": "application/x-www-form-urlencoded" },
              observe: "body",
            }
          )
          .subscribe(
            (r: IResponse<any>) => {
              resolve(r);
            },
            (e) => {
              reject(e);
            },
            () => {
              setTimeout(() => {
                if (subscribtion) {
                  subscribtion.unsubscribe();
                }
              }, 1000);
            }
          );
      }
    ).then((r) => {
      if (r && r.Data) {
        const id: IdentityEntity = new IdentityEntity();
        id.Name = r.Data.Name;
        id.Ticket = r.Data.Ticket;
        id.IsShareTicket = r.Data.IsShareTicket;
        id.Numbers = r.Data.Numbers;
        id.Id = r.Data.Id;
        this.identityService.setIdentity(id);
        AppHelper.setStorage("loginToken", r.Data.Token);
      }
      return r;
    });
    return this.tryAutoLoginPromise.finally(() => {
      this.tryAutoLoginPromise = null;
    });
  }
  private post(url: string, req: RequestEntity) {
    req.Token = this.apiConfig.Token;
    const formObj = Object.keys(req)
      .filter((it) => it != "Url" && it != "IsShowLoading")
      .map((k) => `${k}=${encodeURIComponent(req[k])}`)
      .join("&");
    return this.http
      .post(
        url,
        `${formObj}&Sign=${this.getSign(req)}&x-requested-with=XMLHttpRequest`,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          observe: "body",
        }
      )
      .pipe(
        finalize(() => {
          console.log("reqMethod =" + req.Method, this.reqLoadingStatus);
          this.setLoading({
            isShowLoading: false,
            reqMethod: req.Method,
            msg: "",
          });
        })
      );
  }
  private processResponse(
    response: any,
    isCheckLogin: boolean,
    req: RequestEntity
  ) {
    let due = req.Timeout || 30 * 1000;
    due = due < 1000 ? due * 1000 : due;
    return of(response).pipe(
      timeout(due),
      tap((r) => console.log(r)),
      map((r) => r as any),
      switchMap((r: IResponse<any>) => {
        if (
          isCheckLogin &&
          r.Code &&
          r.Code.toUpperCase() === "NOLOGIN" &&
          AppHelper.isApp()
        ) {
          return from(this.tryAutoLogin(r)).pipe(
            map((r) => r as any),
            switchMap((r: IResponse<any>) => {
              if (r && r.Status && r.Data) {
                return this.sendRequest(req, false);
              }
              this.identityService.removeIdentity();
              if (r.Message && req.IsShowMessage) {
                AppHelper.alert(r.Message);
              }
              if (req.IsRedirctLogin != false) {
                AppHelper.setToPageAfterAuthorize({
                  path: this.router.url,
                  queryParams: this.route.snapshot.queryParams,
                });
                this.router.navigate([AppHelper.getRoutePath("login")]);
              }
              return of(r);
            })
          );
        } else if (r.Code && r.Code.toUpperCase() === "NOLOGIN") {
          this.identityService.removeIdentity();
          if (r.Message && req.IsShowMessage) {
            AppHelper.alert(r.Message);
          }
          if (req.IsRedirctLogin != false) {
            AppHelper.setToPageAfterAuthorize({
              path: this.router.url,
              queryParams: this.route.snapshot.queryParams,
            });
            this.router.navigate([AppHelper.getRoutePath("login")]);
          }
        } else if (r.Code && r.Code.toUpperCase() === "NOAUTHORIZE") {
          if (req.IsRedirctNoAuthorize != false) {
            this.router.navigate([AppHelper.getRoutePath("no-authorize")]);
          }
        } else if (r.Code && r.Code.toLowerCase() == "systemerror") {
          if (req.IsShowMessage) {
            AppHelper.alert("接口请求异常，系统错误");
          }
        }
        return of(r);
      }),
      catchError((error: Error | any) => {
        this.setLoading({
          isShowLoading: false,
          reqMethod: req.Method,
          msg: "",
        });
        const entity = new ExceptionEntity();
        entity.Error = error;
        entity.Method = req.Method;
        entity.Message = LanguageHelper.getApiExceptionTip();
        if (error instanceof TimeoutError) {
          entity.Message = LanguageHelper.getApiTimeoutTip();
          return throwError(entity.Message);
        }
        if (error instanceof HttpErrorResponse) {
          return throwError(LanguageHelper.getNetworkErrorTip());
        }
        return throwError(error);
      }),
      // map((r) => r)
    );
  }
  private sendRequest(
    request: RequestEntity,
    isCheckLogin: boolean
  ): Observable<IResponse<any>> {
    const req = { ...request };
    if (req.Data && typeof req.Data != "string") {
      req.Data = JSON.stringify(req.Data);
    }
    this.setLoading({
      msg: req.LoadingMsg,
      isShowLoading: req.IsShowLoading,
      reqMethod: req.Method,
    });
    if (this.apiConfig && this.apiConfig.Urls) {
      return from(this.getUrl(req)).pipe(
        switchMap((url) => this.post(url, req)),
        switchMap((r) => this.processResponse(r, isCheckLogin, req))
      );
    }
    return from(this.loadApiConfig()).pipe(
      switchMap((config) => {
        if (!config) {
          return throwError(LanguageHelper.getNetworkErrorTip());
        }
        return from(this.getUrl(req));
      }),
      switchMap((url) => this.post(url, req)),
      switchMap((r) => this.processResponse(r, isCheckLogin, req))
    );
  }
  private postBodyData(
    url: string,
    req: RequestEntity,
    contentType: string,
    filename: string
  ) {
    req.Token = this.apiConfig.Token;
    return this.http.post(`${url}`, req.Data, {
      params: {
        Data: JSON.stringify({ FileName: filename }).trim(),
        Sign: this.getSign(req),
        Ticket: req.Ticket,
      },
      headers: {
        "Content-Type": contentType || "image/jpeg",
      },
      observe: "body",
    });
  }
  sendBodyData(
    request: RequestEntity,
    isCheckLogin = true,
    contentType = "image/jpeg",
    fileName: string
  ): Observable<IResponse<any>> {
    const req = { ...request };
    this.setLoading({
      msg: req.LoadingMsg,
      isShowLoading: req.IsShowLoading,
      reqMethod: req.Method,
    });
    if (this.apiConfig && this.apiConfig.Urls) {
      return from(this.getUrl(req)).pipe(
        switchMap((url) => this.postBodyData(url, req, contentType, fileName)),
        switchMap((r) => this.processResponse(r, isCheckLogin, req))
      );
    }
    return from(this.loadApiConfig()).pipe(
      switchMap((config) => {
        if (!config) {
          return throwError(LanguageHelper.getNetworkErrorTip());
        }
        return from(this.getUrl(req));
      }),
      switchMap((url) => this.postBodyData(url, req, contentType, fileName)),
      switchMap((r) => this.processResponse(r, isCheckLogin, req))
    );
  }
  private async loadApiConfig(forceRefresh = false): Promise<ApiConfig> {
    if (!forceRefresh) {
      if (!this.apiConfig || !this.apiConfig.Urls) {
        const local = await this.storage.get(`KEY_API_CONFIG`);
        if (local) {
          if (typeof local == "string") {
            this.apiConfig = JSON.parse(local);
          } else {
            this.apiConfig = local;
          }
        }
      }
      if (this.apiConfig && this.apiConfig.Urls) {
        return this.apiConfig;
      }
    }
    if (this.fetchApiConfigPromise) {
      return this.fetchApiConfigPromise;
    }
    const url = AppHelper.getApiUrl() + "/Home/ApiConfig";
    const due = 30 * 1000;
    this.fetchApiConfigPromise = new Promise<ApiConfig>((s) => {
      const sub = this.http
        .get(url)
        .pipe(
          timeout(due),
          finalize(() => {
            this.fetchApiConfigPromise = null;
            setTimeout(() => {
              if (sub) {
                console.log("loadUrls unsubscribe");
                sub.unsubscribe();
              }
            }, 3000);
          })
        )
        .subscribe(
          async (r: IResponse<ApiConfig>) => {
            if (r.Data) {
              const local = r.Data;
              if (typeof local == "string") {
                this.apiConfig = JSON.parse(window.atob(local));
              } else {
                this.apiConfig = local;
              }
              this.storage.set(`KEY_API_CONFIG`, this.apiConfig);
              const identityEntity = await this.identityService.getIdentityAsync();
              if (identityEntity) {
                this.identityService.setIdentity(identityEntity);
              }
              s(this.apiConfig);
            } else {
              s(null);
            }
          },
          () => {
            s(null);
          }
        );
    });
    return this.fetchApiConfigPromise;
  }
  getSign(req: RequestEntity) {
    return md5(
      `${typeof req.Data === "string" ? req.Data : JSON.stringify(req.Data)}${
      req.Timestamp
      }${req.Token}`
    ) as string;
  }
}
