import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
import { BaseRequest } from "../api/BaseRequest";
import { AppHelper } from "../../appHelper";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ExceptionEntity } from "./exception.entity";
import { IdentityService } from "../../services/identity/identity.service";
import { catchError } from "rxjs/operators";
@Injectable({
  providedIn: "root"
})
export class LogService {
  constructor(
    private http: HttpClient,
    private identityService: IdentityService
  ) {}

  async sendException(ex: ExceptionEntity) {
    try {
      const identity = await this.identityService.getIdentity();
      const req = new BaseRequest();
      req.Timestamp = Math.floor(Date.now() / 1000);
      req.Domain = AppHelper.getDomain();
      req.Method = "ApiLogUrl-Error-Add";
      const detail =
        ex.Error instanceof Error
          ? ex.Error.message.includes("<")
            ? escape(ex.Error.message)
            : ex.Error.message
          : typeof ex.Error === "string" || typeof ex.Error === "number"
          ? ex.Error
          : JSON.stringify(ex.Error);
      req.Data = JSON.stringify({
        Address: ex.Method,
        Message: ex.Message,
        Detail: detail,
        AccountId: !identity ? identity.Id : "",
        Device: await AppHelper.getUUID()
      });
      const formObj = Object.keys(req)
        .map(k => `${k}=${req[k]}`)
        .join("&");
      const url = AppHelper.getApiUrl();
      return this.http
        .post(`${url}/Home/Proxy`, formObj, {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          observe: "body"
        })
        .pipe(
          catchError(e => {
            return throwError(e instanceof Error ? e : new Error(e));
          })
        )
        .subscribe(
          () => {},
          e => {
            console.error("sendException",e);
          }
        );
    } catch (err) {
      // console.error(err);
    }
  }
}
