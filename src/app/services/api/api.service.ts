import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { BaseRequest } from "./BaseRequest";
import { AppHelper } from "../../appHelper";
import { map, tap, catchError, finalize, switchMap } from "rxjs/operators";
import { IResponse } from "./IResponse";
import {
  of,
  Subject,
  BehaviorSubject,
  throwError,
  from,
  Observable
} from "rxjs";
import { LogService } from "../log/log.service";
import { ExceptionEntity } from "../log/exception.entity";
import { Router } from "@angular/router";
import { IdentityEntity } from "../identity/identity.entity";
import { IdentityService } from "../identity/identity.service";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  private loadingSubject: Subject<boolean>;
  constructor(
    private http: HttpClient,
    private router: Router,
    private identityService: IdentityService
  ) {
    this.loadingSubject = new BehaviorSubject(false);
  }
  getLoading() {
    return this.loadingSubject.asObservable();
  }
  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }
  send<T>(method: string, data: any, version: string = "1.0") {
    const req = new BaseRequest();
    req.Method = method;
    req.Version = version;
    if (!data) req.Data = JSON.stringify(data);
    return this.getResponse<T>(req);
  }
  getResponse<T>(req: BaseRequest): Observable<IResponse<T>> {
    return this.sendRequest(req, true);
  }
  async tryAutoLogin(orgReq: BaseRequest) {
    const uuid = await AppHelper.getUUID();
    const req = new BaseRequest();
    req.Method = "ApiLoginUrl-Home-DeviceLogin";
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    req.Data = JSON.stringify({
      Name: AppHelper.getStorage<string>("loginName"),
      Password: uuid
    });
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    return new Promise((resolve,reject)=>{
     const subscribtion= this.http
      .post(url, formObj, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body"
      })
      .pipe(
        map(r => r as any),
        switchMap((r:IResponse<any>) => {
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
          // this.router.navigate([AppHelper.getRoutePath("login")]);
          return of(r);
        })
      ).subscribe(r=>{
        resolve(r);
      },e=>{
        reject(e);
      },()=>{
        setTimeout(() => {
          if(subscribtion){
            subscribtion.unsubscribe();
          }
        }, 10);
      });
    });
  }

  private sendRequest(req: BaseRequest, isCheckLogin: boolean):Observable<IResponse<any>> {
    req.Timestamp = Math.floor(Date.now() / 1000);
    req.Language = AppHelper.getLanguage();
    req.Ticket = AppHelper.getTicket();
    req.Domain = AppHelper.getDomain();
    const formObj = Object.keys(req)
      .map(k => `${k}=${req[k]}`)
      .join("&");
    this.setLoading(true);
    const url = req.Url || AppHelper.getApiUrl() + "/Home/Proxy";
    return this.http
      .post(url, formObj, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        observe: "body"
      })
      .pipe(
        tap(r => console.log(r)),
        map(r => r as any),
        switchMap((r:IResponse<any>) => {
          if (isCheckLogin && r.Code && r.Code.toUpperCase() === "NOLOGIN") {
            return from(this.tryAutoLogin(req));
          } else if (r.Code && r.Code.toUpperCase() === "NOLOGIN") {
            this.router.navigate([AppHelper.getRoutePath("login")]);
          }
          if(!r.Status){
            return throwError(r.Message);
          }
          return of(r);
        }),
        catchError((error: Error | any) => {
          const entity = new ExceptionEntity();
          entity.Error = error;
          entity.Method = req.Method;
          entity.Message = "接口请求错误";
          return throwError(error);
        }),
        finalize(() => {
          this.setLoading(false);
        }),
        map(r=>r as any)
      );
  }
}
