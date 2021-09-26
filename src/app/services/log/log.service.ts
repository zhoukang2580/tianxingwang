import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { throwError, Subscription, interval } from "rxjs";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../api/Request.entity";
import { AppHelper } from "../../appHelper";
import { HttpClient } from "@angular/common/http";
import { ExceptionEntity } from "./exception.entity";
import { IdentityService } from "../../services/identity/identity.service";
import { catchError, finalize, timeout } from "rxjs/operators";
import { serializeError } from "serialize-error";
import { LogEntity } from "./log.entity";
@Injectable({
  providedIn: "root",
})
export class LogService {
  private logs: LogEntity[] = [];
  private identityEntity: IdentityEntity;
  private subscription = Subscription.EMPTY;
  private started = false;
  constructor(private http: HttpClient, identityService: IdentityService) {
    identityService.getIdentitySource().subscribe((r) => {
      this.identityEntity = r;
    });
  }
  private async sendLog() {
    this.started = true;
    try {
      const ex: LogEntity = this.logs[0];
      if (!ex) {
        this.subscription.unsubscribe();
        this.started = false;
        return true;
      }
      const identity = this.identityEntity;
      const req = new RequestEntity();
      req.Method = "ApiLogUrl-Error-Add";
      const detail = JSON.stringify(serializeError(ex));
      ex.Tag = `${ex.Tag}_from_${
        AppHelper.platform.is("android") ? "android" : "ios"
      }_version=${await AppHelper.getAppVersion()}`;
      req.Data = JSON.stringify({
        Address: ex["Method"] || ex.Tag || "",
        Message: ex.Message || ex.Tag,
        Detail: detail || ex.Tag,
        AccountId: identity ? identity.Id : "",
        Device: await AppHelper.getDeviceId(),
      });
      // console.log("发送错误,detail " + detail);
      const formObj = Object.keys(req)
        .map((k) => `${k}=${req[k]}`)
        .join("&");
      let due = req.Timeout || 30 * 1000;
      due = due < 1000 ? due * 1000 : due;
      const url = AppHelper.getApiUrl();
      return this.http
        .post(
          `${url}/Home/Proxy`,
          `${formObj}&x-requested-with=XMLHttpRequest`,
          {
            headers: { "content-type": "application/x-www-form-urlencoded" },
            observe: "body",
          }
        )
        .pipe(
          timeout(due),
          catchError((e) => {
            return throwError(e instanceof Error ? e : new Error(e));
          })
        )
        .subscribe(
          () => {
            this.logs = this.logs.filter((it) => it !== ex);
          },
          (e) => {
            console.error("sendException", e);
          }
        );
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  addException(ex: ExceptionEntity) {
    ex.Tag = ex.Tag || `AppErrorLog`;
    this.logs.unshift(ex);
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(0, 500);
    }
    this.start();
  }
  addLog(ex: ExceptionEntity | LogEntity) {
    this.logs.unshift(ex);
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(0, 500);
    }
    this.start();
  }
  private start() {
    if (this.logs.length && !this.started) {
      if (this.started) {
        return;
      }
      this.subscription.unsubscribe();
      this.started = true;
      this.subscription = interval(1000 * 20).subscribe(() => {
        console.log("发送错误消息");
        this.sendLog();
      });
    }
  }
}
