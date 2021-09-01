import { IdentityEntity } from "./identity.entity";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import {
  of,
  throwError,
  Observable,
  Subject,
  BehaviorSubject,
  TimeoutError,
  from,
} from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from "@angular/common/http";
import {
  map,
  catchError,
  finalize,
  switchMap,
  tap,
  timeout,
  delay,
} from "rxjs/operators";
import { IResponse } from "../api/IResponse";
import { ExceptionEntity } from "../log/exception.entity";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";
import { CONFIG } from "src/app/config";

@Injectable({
  providedIn: "root",
})
export class IdentityService {
  private fetchingIdentityPromise: Promise<IdentityEntity>;
  private identityEntity: IdentityEntity;
  private identitySource: Subject<IdentityEntity>;
  private checkTicketPromise: Promise<IdentityEntity>;
  private reqLoadingStatus: {
    reqMethod: string;
    isShow: boolean;
    msg: string;
  }[] = [];
  constructor(private http: HttpClient) {
    this.identityEntity = new IdentityEntity();
    this.identityEntity.Ticket = AppHelper.getTicket();
    this.identityEntity.Name = AppHelper.getStorage("loginname");
    // this.identityEntity.Id = AppHelper.getQueryParamers().IdentityId;
    this.identitySource = new BehaviorSubject(this.identityEntity);
    console.log("IdentityService init identityEntity ", {
      ...this.identityEntity,
    });
  }
  setIdentity(info: IdentityEntity) {
    console.log("identityservice setIdentity ", { ...info });
    this.identityEntity = info;
    if (info && info.Ticket) {
      AppHelper.setTicket((info && info.Ticket) || "");
    }
    this.identitySource.next(this.identityEntity);
    // console.log("Identity", this.identityEntity);
  }
  getStatus(): Observable<boolean> {
    const rev = !!(this.identityEntity && this.identityEntity.Ticket);
    if (rev && !this.identityEntity.Id) {
      return from(this.checkTicketAsync(this.identityEntity.Ticket)).pipe(
        map((it) => it && it.Ticket && !!it.Id)
      );
    }
    return of(rev);
  }
  removeIdentity() {
    if (this.identityEntity) {
      this.identityEntity.Ticket = null;
      this.identityEntity.Id = null;
    }
    AppHelper.setTicket("");
    this.setIdentity(this.identityEntity);
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
      AppHelper.loadingSubject.next({
        msg: show.msg,
        isLoading: true,
        method: data.reqMethod,
      });
    } else {
      AppHelper.loadingSubject.next({
        msg: "",
        isLoading: false,
        method: data.reqMethod,
      });
    }
  }
  getIdentityAsync(): Promise<IdentityEntity> {
    if (
      this.identityEntity &&
      this.identityEntity.Ticket &&
      this.identityEntity.Id &&
      this.identityEntity.Id != "0"
    ) {
      return Promise.resolve(this.identityEntity);
    }
    if (!this.fetchingIdentityPromise) {
      this.fetchingIdentityPromise = new Promise<IdentityEntity>((s) => {
        const sub = this.loadIdentityEntity()
          .pipe(
            finalize(() => {
              setTimeout(() => {
                sub.unsubscribe();
              }, 300);
            })
          )
          .subscribe(
            (r) => {
              s(r);
            },
            (e) => {
              AppHelper.alert(e);
              s(null);
            }
          );
      }).finally(() => {
        this.fetchingIdentityPromise = null;
      });
    }
    return this.fetchingIdentityPromise;
  }
  getIdentitySource(): Observable<IdentityEntity> {
    return this.identitySource.asObservable();
  }
  checkTicketAsync(
    t: string = "",
    // isReloadIdentity = true,
    isShowLoading = true
  ) {
    if (!this.checkTicketPromise) {
      this.checkTicketPromise = new Promise<IdentityEntity>((s) => {
        const sub = this.checkTicket(t, isShowLoading)
          .pipe(
            finalize(() => {
              setTimeout(() => {
                if (sub) {
                  sub.unsubscribe();
                }
              }, 1000);
            })
          )
          .subscribe(
            (res) => {
              if (res) {
                s(res);
              } else {
                s(null);
              }
            },
            (_) => {
              s(null);
            }
          );
      }).finally(() => {
        this.checkTicketPromise = null;
      });
    }
    return this.checkTicketPromise;
  }
  private checkTicket(
    ticket: string = "",
    // isReloadIdentity = true,
    isShowLoading = true
  ): Observable<IdentityEntity> {
    console.log("identityservice checkTicket");
    ticket =
      ticket ||
      (this.identityEntity && this.identityEntity.Ticket) ||
      AppHelper.getTicket();
    const req = new RequestEntity();
    // req.IsShowLoading = true;
    req.Method = "ApiHomeUrl-Identity-Get";
    req.Data = JSON.stringify({ Ticket: ticket });
    req.IsShowLoading = isShowLoading;
    let due = req.Timeout || CONFIG.apiTimemoutTime;
    due = due < 1000 ? due * 1000 : due;
    due = environment.disableNetWork ? 1 : due;
    const formObj = Object.keys(req)
      .map((k) => `${k}=${req[k]}`)
      .join("&");
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    this.setLoading({
      msg: "",
      reqMethod: req.Method,
      isShowLoading: req.IsShowLoading,
    });
    return this.http
      .post(url, `${formObj}&x-requested-with=XMLHttpRequest`, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body",
      })
      .pipe(
        finalize(() => {
          this.setLoading({
            msg: "",
            reqMethod: req.Method,
            isShowLoading: false,
          });
        }),
        map((r: IResponse<IdentityEntity>) => r),
        switchMap((r) => {
          this.identityEntity = r && r.Data;
          // if (isReloadIdentity) {
          this.setIdentity(this.identityEntity);
          // }
          return of(this.identityEntity);
        }),
        timeout(due),
        catchError((error: Error | any) => {
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
          this.setLoading({
            msg: "",
            reqMethod: req.Method,
            isShowLoading: false,
          });
          return throwError(error);
        })
      );
  }
  private loadIdentityEntity() {
    const ticket =
      (this.identityEntity && this.identityEntity.Ticket) ||
      AppHelper.getTicket();
    if (ticket) {
      return this.checkTicket(ticket);
    }
    this.identityEntity = null;
    return of(this.identityEntity);
  }
  getWebSocketUrl(url: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "ApiHomeUrl-Identity-GetWebSocketUrl";
    req.Data = {};
    let due = req.Timeout || CONFIG.apiTimemoutTime;
    due = due < 1000 ? due * 1000 : due;
    due = environment.disableNetWork ? 1 : due;
    const formObj = Object.keys(req)
      .map((k) => `${k}=${req[k]}`)
      .join("&");
    if (!url) {
      return null;
    }
    return this.http
      .post(url, `${formObj}&x-requested-with=XMLHttpRequest`, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body",
      })
      .pipe(
        map((r: IResponse<{ Url: string }>) => r),
        timeout(due),
        catchError((error: Error | any) => {
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
      );
  }
}
