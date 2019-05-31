import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { RequestEntity } from "./Request.entity";
import { AppHelper } from "../../appHelper";
import { map, tap, catchError, finalize, switchMap, timeout, delay } from "rxjs/operators";
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
import { LoadingController } from '@ionic/angular';
import { LanguageHelper } from 'src/app/languageHelper';
@Injectable({
  providedIn: "root"
})
export class ApiService {
  private loadingSubject: Subject<boolean>;
  constructor(
    private http: HttpClient,
    private router: Router,
    private identityService: IdentityService,
    private loadingCtrl: LoadingController
  ) {
    this.loadingSubject = new BehaviorSubject(false);
  }
  getLoading() {
    return this.loadingSubject.asObservable().pipe(delay(0));
  }
  setLoading(loading: boolean, isShowLoading: boolean) {
    if (loading && isShowLoading) {
      this.showLoadingView();
    }
    if (!loading) {
      this.hideLoadingView();
    }
    this.loadingSubject.next(loading);
  }
  showLoadingView() {
    this.loadingCtrl.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
    this.loadingCtrl.create().then((t) => {
      if (t) {
        t.present();
      }
    });
  }
  hideLoadingView() {
    setTimeout(() => {
      this.loadingCtrl.getTop().then((t) => {
        if (t) {
          t.dismiss();
        }
      });
    }, 1000);
  }
  send<T>(method: string, data: any, version: string = "1.0", showLoading: boolean = false) {
    const req = new RequestEntity();
    req.Method = method;
    req.Version = version;
    if (data) { req.Data = JSON.stringify(data); }
    req.IsShowLoading = showLoading;
    return this.getResponse<T>(req);
  }
  getResponse<T>(req: RequestEntity): Observable<IResponse<T>> {
    return this.sendRequest(req, true);
  }
  createRequest()
  {
    const req = new RequestEntity();
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    return req;
  }
  async tryAutoLogin(orgReq: RequestEntity) {
    const req = this.createRequest();
    if (AppHelper.isApp()) {
      const uuid = await AppHelper.getUUID();
      req.Method = "ApiLoginUrl-Home-DeviceLogin";
      req.Data = JSON.stringify({
        Id: AppHelper.getStorage<string>("identityId"),
        Device: uuid
      });
    }
    else if (AppHelper.isWechatH5()) {
      const code = "";
      req.Method = "ApiLoginUrl-Home-WechatLogin";
      req.Data = JSON.stringify({
        Code: code
      });
    }
    else if (AppHelper.isWechatMini()) {
      const code = "";
      req.Method = "ApiLoginUrl-Home-WechatLogin";
      req.Data = JSON.stringify({
        Code: code
      });
    }
    else if (AppHelper.isDingtalkH5()) {
      const code = "";
      req.Method = "ApiLoginUrl-Home-DingtalkLogin";
      req.Data = JSON.stringify({
        Code: code
      });
    }
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
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
        ).subscribe(r => {
          resolve(r);
        }, e => {
          reject(e);
        }, () => {
          setTimeout(() => {
            if (subscribtion) {
              subscribtion.unsubscribe();
            }
          }, 10);
        });
    });
  }

  private sendRequest(req: RequestEntity, isCheckLogin: boolean): Observable<IResponse<any>> {
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    if (req.Data && typeof req.Data != 'string') {
      req.Data = JSON.stringify(req.Data);
    }
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");
    this.setLoading(true, req.IsShowLoading);
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    const due = 30 * 1000;
    return this.http
      .post(url, formObj, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body"
      })
      .pipe(
        timeout(due),
        tap(r => console.log(r)),
        map(r => r as any),
        switchMap((r: IResponse<any>) => {
          if (isCheckLogin && r.Code && r.Code.toUpperCase() === "NOLOGIN") {
            return from(this.tryAutoLogin(req));
          } else if (r.Code && r.Code.toUpperCase() === "NOLOGIN") {
            this.router.navigate([AppHelper.getRoutePath("login")]);
          }
          // if (!r.Status ) {
          //   return AppHelper.alert(r.Message);
          // }
          return of(r);
        }),
        catchError((error: Error | any) => {
          const entity = new ExceptionEntity();
          entity.Error = error;
          entity.Method = req.Method;
          entity.Message = LanguageHelper.getApiExceptionTip();
          if (error instanceof TimeoutError) {
            entity.Message = LanguageHelper.getApiTimeoutTip();
            //AppHelper.alert(LanguageHelper.getApiTimeoutTip());
          }
          return throwError(error);
        }),
        finalize(() => {
          this.setLoading(false, req.IsShowLoading);
        }),
        map(r => r as any)
      );
  }
}
