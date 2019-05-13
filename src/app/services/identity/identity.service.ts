import { IdentityEntity } from "./identity.entity";
import { BaseRequest } from "../api/BaseRequest";
import { Injectable } from "@angular/core";
import { of, throwError } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, catchError, finalize, switchMap } from "rxjs/operators";
import { IResponse } from "../api/IResponse";
import { ExceptionEntity } from "../log/exception.entity";

@Injectable({
  providedIn: "root"
})
export class IdentityService {
  private identity: IdentityEntity;
  constructor(private http: HttpClient) {
    this.identity = new IdentityEntity();
    this.identity.Ticket = AppHelper.getTicket();
    this.identity.Name = AppHelper.getStorage("loginname");
    this.setIdentity(this.identity);
  }
  setIdentity(info: IdentityEntity) {
    if (info && info.Ticket) {
      this.identity = info;
      AppHelper.setCookie("ticket", info.Ticket);
      AppHelper.setStorage("loginname", info.Name);
      AppHelper.setStorage("identityId", info.Id);
    }
  }
  removeIdentity() {
    this.identity = null;
    AppHelper.setCookie("ticket", "", -1);
  }
  getIdentity(): Promise<IdentityEntity> {
    console.log("getIdentity ", this.identity);
    if (this.identity && this.identity.Ticket) {
      return Promise.resolve(this.identity);
    }
    return new Promise<IdentityEntity>((resolve, reject) => {
      const subscribtion = this.loadIdentityEntity().subscribe(
        identityEntity => {
          if (identityEntity && identityEntity.Ticket) {
            resolve(identityEntity);
          } else {
            reject("需要重新登录");
          }
        },
        error => {
          reject(error);
        },
        () => {
          setTimeout(() => {
            if (subscribtion) {
              subscribtion.unsubscribe();
            }
          }, 0);
        }
      );
    }).catch(e => null);
  }
  loadIdentityEntity() {
    const ticket = AppHelper.getTicket();
    if (ticket) {
      const req = new BaseRequest();
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
            return throwError(r.Message);
          })
        );
    }
    this.identity.Ticket = null;
    return of(this.identity);
  }
}
