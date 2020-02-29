import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { throwError, Subscription, interval } from "rxjs";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../api/Request.entity";
import { AppHelper } from "../../appHelper";
import { HttpClient } from "@angular/common/http";
import { ExceptionEntity } from "./exception.entity";
import { IdentityService } from "../../services/identity/identity.service";
import { catchError, finalize } from "rxjs/operators";
@Injectable({
  providedIn: "root"
})
export class LogService {
  private exceptions: ExceptionEntity[] = [];
  private identityEntity: IdentityEntity;
  private subscription = Subscription.EMPTY;
  private started = false;
  constructor(private http: HttpClient, identityService: IdentityService) {
    identityService.getIdentitySource().subscribe(r => {
      this.identityEntity = r;
    });
  }
  private async sendException() {
    this.started = true;
    try {
      const ex: ExceptionEntity = this.exceptions[0];
      if (!ex) {
        this.subscription.unsubscribe();
        this.started = false;
        return true;
      }
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
        .post(
          `${url}/Home/Proxy`,
          `${formObj}&x-requested-with=XMLHttpRequest`,
          {
            headers: { "content-type": "application/x-www-form-urlencoded" },
            observe: "body"
          }
        )
        .pipe(
          catchError(e => {
            return throwError(e instanceof Error ? e : new Error(e));
          })
        )
        .subscribe(
          () => {
            this.exceptions = this.exceptions.filter(it => it !== ex);
          },
          e => {
            console.error("sendException", e);
          }
        );
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  addException(ex: ExceptionEntity) {
    this.exceptions.unshift(ex);
    if (this.exceptions.length > 500) {
      this.exceptions = this.exceptions.slice(0, 500);
    }
    if (this.exceptions.length && !this.started) {
      this.subscription.unsubscribe();
      this.started = true;
      this.subscription = interval(1000 * 20).subscribe(() => {
        console.log("发送错误消息");
        this.sendException();
      });
    }
  }
}
