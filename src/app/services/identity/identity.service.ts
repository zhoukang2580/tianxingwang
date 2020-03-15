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
import {
  map,
  catchError,
  finalize,
  switchMap,
  tap,
  timeout
} from "rxjs/operators";
import { IResponse } from "../api/IResponse";
import { ExceptionEntity } from "../log/exception.entity";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class IdentityService {
  private fetchingIdentityPromise: Promise<IdentityEntity>;
  private identityEntity: IdentityEntity;
  private identitySource: Subject<IdentityEntity>;
  constructor(private http: HttpClient) {
    this.identityEntity = new IdentityEntity();
    this.identityEntity.Ticket = AppHelper.getTicket();
    this.identityEntity.Name = AppHelper.getStorage("loginname");
    this.identitySource = new BehaviorSubject(this.identityEntity);
  }
  setIdentity(info: IdentityEntity) {
    this.identityEntity = info;
    AppHelper.setStorage("ticket", info.Ticket);
    this.identitySource.next(this.identityEntity);
  }
  getStatus(): boolean {
    return !!(
      this.identityEntity &&
      this.identityEntity.Ticket &&
      this.identityEntity.Id
    );
  }
  removeIdentity() {
    this.identityEntity.Ticket = null;
    this.identityEntity.Id = null;
    AppHelper.setStorage("ticket", "");
    this.setIdentity(this.identityEntity);
  }
  getIdentityAsync(): Promise<IdentityEntity> {
    if (this.getStatus()) {
      return Promise.resolve(this.identityEntity);
    }
    if (!this.fetchingIdentityPromise) {
      this.fetchingIdentityPromise = new Promise<IdentityEntity>(s => {
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
      }).finally(() => {
        this.fetchingIdentityPromise = null;
      });
    }
    return this.fetchingIdentityPromise;
  }
  getIdentitySource(): Observable<IdentityEntity> {
    return this.identitySource.asObservable();
  }
  checkTicketAsync(t: string = "") {
    return new Promise<IdentityEntity>(s => {
      const sub = this.checkTicket(t)
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
          res => {
            if (res) {
              s(res);
            } else {
              s(null);
            }
          },
          _ => {
            s(null);
          }
        );
    });
  }
  private checkTicket(ticket: string = ""): Observable<IdentityEntity> {
    ticket =
      ticket ||
      (this.identityEntity && this.identityEntity.Ticket) ||
      AppHelper.getTicket();
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "ApiHomeUrl-Identity-Get";
    req.Data = JSON.stringify({ Ticket: ticket });
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = ticket;
    req.Domain = AppHelper.getDomain();
    let due = req.Timeout || 30 * 1000;
    due = due < 1000 ? due * 1000 : due;
    due = environment.disableNetWork ? 1 : due;
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    return this.http
      .post(url, `${formObj}&x-requested-with=XMLHttpRequest`, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body"
      })
      .pipe(
        map((r: IResponse<IdentityEntity>) => r),
        switchMap(r => {
          if (r.Status) {
            this.identityEntity = {
              ...this.identityEntity,
              ...r.Data
            };
            this.setIdentity(this.identityEntity);
            return of(this.identityEntity);
          }
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
    this.identityEntity.Ticket = null;
    this.identityEntity.Id = null;
    return of(this.identityEntity);
  }
}
