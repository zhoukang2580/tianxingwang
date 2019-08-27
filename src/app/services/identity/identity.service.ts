import { IdentityEntity } from "./identity.entity";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import {
  of,
  throwError,
  Observable,
  Subject,
  BehaviorSubject,
  TimeoutError
} from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
import { map, catchError, finalize, switchMap, tap } from "rxjs/operators";
import { IResponse } from "../api/IResponse";
import { ExceptionEntity } from "../log/exception.entity";
import { LanguageHelper } from "src/app/languageHelper";

@Injectable({
  providedIn: "root"
})
export class IdentityService {
  private status = false;
  private _IdentityEntity: IdentityEntity;
  private identitySource: Subject<IdentityEntity>;
  constructor(private http: HttpClient) {
    this._IdentityEntity = new IdentityEntity();
    this._IdentityEntity.Ticket = AppHelper.getTicket();
    this._IdentityEntity.Name = AppHelper.getStorage("loginname");
    this.identitySource = new BehaviorSubject(this._IdentityEntity);
  }
  setIdentity(info: IdentityEntity) {
    this._IdentityEntity = info;
    AppHelper.setStorage("ticket", info.Ticket);
    AppHelper.setStorage("loginToken", info.Token);
    // console.log("set identity ",info);
    this.status = !!(info && info.Ticket && info.Id);
    this.identitySource.next(this._IdentityEntity);
  }
  getStatus() {
    return this.status;
  }
  removeIdentity() {
    this._IdentityEntity.Ticket = null;
    this._IdentityEntity.Id = null;
    AppHelper.setStorage("ticket", "");
    this.setIdentity(this._IdentityEntity);
  }
  getIdentityAsync(): Promise<IdentityEntity> {
    if (
      this._IdentityEntity &&
      this._IdentityEntity.Id &&
      this._IdentityEntity.Ticket
    ) {
      return Promise.resolve(this._IdentityEntity);
    }
    return new Promise(s => {
      const sub = this.loadIdentityEntity()
        .pipe(
          finalize(() => {
            setTimeout(() => {
              sub.unsubscribe();
            }, 300);
          })
        )
        .subscribe(
          r => {
            s(r);
          },
          e => {
            AppHelper.alert(e);
            s(null);
          }
        );
    });
  }
  getIdentitySource(): Observable<IdentityEntity> {
    return this.identitySource.asObservable();
  }
  loadIdentityEntity() {
    const ticket = AppHelper.getTicket();
    if (ticket) {
      const req = new RequestEntity();
      req.IsShowLoading = true;
      req.Method = "ApiHomeUrl-Identity-Get";
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
          map((r: IResponse<IdentityEntity>) => r),
          switchMap(r => {
            if (r.Status) {
              return of(r.Data);
            }
            return of(null);
          }),
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
    this._IdentityEntity.Ticket = null;
    this._IdentityEntity.Id = null;
    return of(this._IdentityEntity);
  }
}
