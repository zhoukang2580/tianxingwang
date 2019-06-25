import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../api/Request.entity";
import { AppHelper } from "../../appHelper";
import { HttpClient } from "@angular/common/http";
import { ExceptionEntity } from "./exception.entity";
import { IdentityService } from "../../services/identity/identity.service";
import { catchError } from "rxjs/operators";
@Injectable({
  providedIn: "root"
})
export class LogService {
  identityEntity: IdentityEntity;
  constructor(
    private http: HttpClient,
    private identityService: IdentityService
  ) {
    identityService.getIdentity().subscribe(r => {
      this.identityEntity = r;
    });
  }

  async sendException(ex: ExceptionEntity) {
    try {
      const identity = this.identityEntity;
      const req = new RequestEntity();
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
        Device: await AppHelper.getDeviceId()
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
            console.error("sendException", e);
          }
        );
    } catch (err) {
      // console.error(err);
    }
  }
}
