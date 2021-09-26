import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
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
import { LogService } from "../log/log.service";
import { CONFIG } from "src/app/config";
import { Platform } from "@ionic/angular";
import { StorageService } from "../storage-service.service";
const KEY_API_CONFIG = "KEY_API_CONFIG_CACHE_KEY";
interface ApiConfig {
  Urls: { [key: string]: string };
  Token: string;
}
interface IPopMessage {
  results?: any[];
  messageCount?: number;
  msg?: {
    Id: string;
    Title: string; // "测试标题:" + i,
    Detail: string; // "消息消息消息消息消息消息",
    IsRead: boolean;
    IsSelected?: boolean;
    Url: string; //
    InsertTime: string;
  };
}
@Injectable({
  providedIn: "root",
})
export class ApiService {
  private reqLoadingStatus: {
    reqId: string;
    isShow: boolean;
    msg: string;
    reqDateTime: number;
  }[] = [];
  private loadingSubject: Subject<{ isLoading: boolean; msg: string }>;
  private notifyMessageSource: Subject<IPopMessage>;
  private webSocketIsOkSource: Subject<boolean>;
  public apiConfig: ApiConfig;
  private fetchApiConfigPromise: Promise<any>;
  private tryAutoLoginPromise: Promise<IResponse<any>>;
  private popMessage: IPopMessage = {};
  private websocketInterval: any;
  private identity: IdentityEntity;
  private isGetingMessageCount = false;
  constructor(
    private http: HttpClient,
    private router: Router,
    private identityService: IdentityService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private logService: LogService,
    private plt: Platform,
    private ngZone: NgZone
  ) {
    this.loadingSubject = new BehaviorSubject({ isLoading: false, msg: "" });
    this.webSocketIsOkSource = new BehaviorSubject(true);
    this.notifyMessageSource = new BehaviorSubject({});
    this.loadApiConfig(true).catch();
    identityService.getIdentitySource().subscribe((it) => {
      this.identity = it;
      if (!this.identity || !this.identity.Ticket) {
        if (this.websocketInterval) {
          clearInterval(this.websocketInterval);
        }
      }
    });

    if (this.plt.is("android")) {
      document.addEventListener(
        "backbutton",
        () => {
          console.log("api service backbutton");
          this.backButtonAction();
        },
        false
      );
    }
  }
  private backButtonAction() {
    const arr =
      this.reqLoadingStatus &&
      this.reqLoadingStatus
        .slice(0)
        .filter((it) => it.isShow)
        .sort((a, b) => b.reqDateTime - a.reqDateTime);
    if (arr.length) {
      arr[0].isShow = false;
      this.setLoading({
        isShowLoading: false,
        reqId: arr[0].reqId,
        msg: "",
      });
    }
  }
  getNotifyMessageSource() {
    return this.notifyMessageSource.asObservable();
  }
  getWebSocketIsOkSource() {
    return this.webSocketIsOkSource.asObservable();
  }
  getLoading() {
    return this.loadingSubject.asObservable().pipe(delay(0));
  }
  private setLoading(data: {
    msg: string;
    reqId: string;
    isShowLoading?: boolean;
  }) {
    const one = this.reqLoadingStatus.find((it) => it.reqId == data.reqId);
    if (one) {
      one.isShow = data.isShowLoading;
    } else {
      this.reqLoadingStatus.push({
        isShow: data.isShowLoading,
        reqId: data.reqId,
        msg: data.msg,
        reqDateTime: Date.now(),
      });
    }
    const show = this.reqLoadingStatus.find((it) => it.isShow);
    if (show) {
      this.loadingSubject.next({ msg: show.msg, isLoading: true });
    } else {
      this.loadingSubject.next({ msg: "", isLoading: false });
    }
    if (data.reqId == "clearall") {
      this.loadingSubject.next({ msg: "", isLoading: false });
    }
    this.reqLoadingStatus = this.reqLoadingStatus.filter((it) => it.isShow);
  }
  showLoadingView(d: { msg: string }) {
    this.setLoading({
      msg: d.msg,
      reqId: "showLoadingView",
      isShowLoading: true,
    });
  }
  hideLoadingView() {
    this.setLoading({
      msg: "",
      reqId: "showLoadingView",
      isShowLoading: false,
    });
  }
  private dismissLoadingView() {
    if (this.reqLoadingStatus) {
      this.reqLoadingStatus.forEach((l) => {
        l.isShow = false;
      });
      this.loadingSubject.next({ msg: "", isLoading: false });
    }
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
    if (this.tryAutoLoginPromise) {
      return this.tryAutoLoginPromise;
    }
    let due = req.Timeout || CONFIG.apiTimemoutTime * 1000;
    due = due < 1000 ? due * 1000 : due;
    console.log("apiservice tryAutoLogin");
    this.tryAutoLoginPromise = new Promise<IResponse<any>>(
      async (resolve, reject) => {
        const url = await this.getUrl(req);
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
          .pipe(timeout(due))
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
  private getNetWorkConnection() {
    const connection =
      navigator["connection"] ||
      navigator["mozConnection"] ||
      navigator["webkitConnection"];
    if (connection) {
      return {
        网络下行速度: connection.downlink,
        网络类型: connection.effectiveType,
        有值代表网络状态变更: connection.onchange,
        估算的往返时间: connection.rtt,
        "打开/请求数据保护模式": connection.saveData,
      };
    }
    return {};
  }
  private post(url: string, req: RequestEntity) {
    req.Token = this.apiConfig.Token;
    const formObj = Object.keys(req)
      .filter((it) => it != "Url" && it != "IsShowLoading")
      .map((k) => `${k}=${encodeURIComponent(req[k])}`)
      .join("&");
    let st = Date.now();
    const logTime = CONFIG.apiExcceedlogtime;
    const logtimeex = new ExceptionEntity();
    logtimeex.Method = req.Method;
    const t = new Date().toLocaleDateString();
    const connection = this.getNetWorkConnection();
    const reqId = AppHelper.uuid();
    this.setLoading({
      msg: req.LoadingMsg,
      isShowLoading: req.IsShowLoading,
      reqId,
    });
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
        tap(() => {
          const delta = Date.now() - st;
          logtimeex.Message = `方法：${req.Method},url=${
            req.Url
          }耗时：${delta}ms,请求时间：${t},当前网络状态,${Object.keys(
            connection
          )
            .map((k) => `【${k}=${connection[k]}】`)
            .join("|")}`;
          if (delta > logTime) {
            this.logService.addException(logtimeex);
          }
        }),
        finalize(() => {
          console.log("reqMethod =" + req.Method, this.reqLoadingStatus);
          this.setLoading({
            isShowLoading: false,
            reqId,
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
    let due = req.Timeout || CONFIG.apiTimemoutTime * 1000;
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
          reqId: "clearall",
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
      })
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
    const reqId = AppHelper.uuid();
    this.setLoading({
      msg: req.LoadingMsg,
      isShowLoading: req.IsShowLoading,
      reqId,
    });
    return this.http
      .post(`${url}`, req.Data, {
        params: {
          Data: JSON.stringify({ FileName: filename }).trim(),
          Sign: this.getSign(req),
          Ticket: req.Ticket,
        },
        headers: {
          "Content-Type": contentType || "image/jpeg",
        },
        observe: "body",
      })
      .pipe(
        finalize(() => {
          this.setLoading({
            msg: req.LoadingMsg,
            isShowLoading: false,
            reqId,
          });
        })
      );
  }
  sendBodyData(
    request: RequestEntity,
    isCheckLogin = true,
    contentType = "image/jpeg",
    fileName: string
  ): Observable<IResponse<any>> {
    const req = { ...request };
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
      // if (!this.apiConfig || !this.apiConfig.Urls) {
      //   const local = await this.storage.get(`KEY_API_CONFIG`);
      //   if (local) {
      //     if (typeof local == "string") {
      //       this.apiConfig = JSON.parse(local);
      //     } else {
      //       this.apiConfig = local;
      //     }
      //   }
      // }
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
              this.storageService.set(KEY_API_CONFIG, this.apiConfig);
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
  setWebSocket(websocketUrl: string) {
    try {
      if (this.websocketInterval) {
        clearInterval(this.websocketInterval);
      }
      if (!websocketUrl || !WebSocket) {
        return false;
      }
      const self = this;
      function closeWebSocket(url) {
        url = url.replace("/ws", "/").replace("/wss", "/");
        url += (url.indexOf("?") ? "&" : "?") + "IsCloseWebSocket=true";
        self.http.get(url).subscribe();
      }
      this.popMessage.results = [];
      // 创建一个webSocket对象
      var lastAccessTime = new Date();
      var ws = websocketUrl.replace("https", "wss");
      ws = ws.replace("http", "ws");
      const createWebSocket = () => {
        var socket = new WebSocket(ws);
        socket.onopen = (e) => {
          if (socket.readyState == WebSocket.OPEN) {
            this.popMessage.results = [];
            this.webSocketIsOkSource.next(true);
          }
        };
        socket.onmessage = (data) => {
          console.log("socket onmessage", data);
          if (data.data == "") {
            lastAccessTime = new Date();
            return;
          }
          var info = JSON.parse(data.data);
          if (info) {
            if (!self.popMessage.results) {
              self.popMessage.results = [];
            }
            switch (info.Type) {
              case "AccountMessage":
                self.popMessage.results.push(info);
                // self.getMessageCount();
                this.popMessage.msg = info;
                this.notifyMessageSource.next(this.popMessage);
                break;
              case "CheckForceLogout":
                self.checkForceLogout(true);
                break;
              case "MessageCount":
                if (info.Count != null) {
                  // $("*[message=count]").html(info.Count);
                  self.popMessage.messageCount = info.Count;
                  self.notifyMessageSource.next(this.popMessage);
                }
                break;
            }
          }
        };
        socket.onclose = () => {
          this.notifyMessageSource.next(this.popMessage);
        };
        return socket;
      };
      var socket = createWebSocket();
      window.onbeforeunload = function () {
        closeWebSocket(websocketUrl);
        if (socket.readyState == WebSocket.OPEN) {
          socket.close();
        }
      };
      this.websocketInterval = setInterval(() => {
        try {
          var date = new Date();
          if (
            socket != null &&
            socket.readyState == WebSocket.OPEN &&
            date.getTime() - lastAccessTime.getTime() < 60 * 1000
          ) {
            socket.send("");
          } else {
            if (date.getTime() - lastAccessTime.getTime() >= 60 * 1000) {
              self.executePullMessageHandle();
            }
            if (socket.readyState != WebSocket.CLOSED) {
              this.webSocketIsOkSource.next(false);
              socket.close();
            }
            socket = createWebSocket();
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000 * 30);
      return true;
    } catch (ex) {
      console.error(ex);
    }
    return false;
  }
  private executePullMessageHandle() {
    this.popMessage.results = undefined;
    if (!this.identity || !this.identity.Ticket) {
      return;
    }
    this.checkForceLogout();
    this.getMessageCount();
  }
  private checkForceLogout(force?: boolean) {
    this.identityService.identityCheck(false);
  }
  private getMessageCount() {
    if (this.isGetingMessageCount || !this.identity || !this.identity.Ticket) {
      return;
    }
    this.isGetingMessageCount = true;
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-GetCount";
    return this.getResponse<{ Count: number }>(req)
      .pipe(
        map((r) => r.Data && r.Data.Count),
        catchError((_) => of(0)),
        finalize(() => {
          this.isGetingMessageCount = false;
        })
      )
      .subscribe((c) => {
        this.popMessage.messageCount = c;
        this.notifyMessageSource.next(this.popMessage);
      });
  }
}
