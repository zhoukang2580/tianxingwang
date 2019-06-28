import { IdentityService } from "src/app/services/identity/identity.service";
import { AppHelper } from "src/app/appHelper";
import { catchError, takeUntil, filter, tap } from "rxjs/operators";
import { ToastController } from "@ionic/angular";
import { ApiService } from "../services/api/api.service";
import { Injectable, NgZone } from "@angular/core";
import {
  interval,
  Subject,
  BehaviorSubject,
  of,
  Observable,
  Subscription
} from "rxjs";
import { RequestEntity } from "../services/api/Request.entity";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
export interface MessageModel {
  Id: string;
  Title: string; // "测试标题:" + i,
  Detail: string; // "消息消息消息消息消息消息",
  IsRead: boolean;
  IsSelected?: boolean;
  Url: string; //
  InsertTime: string; //
}
@Injectable({
  providedIn: "root"
})
export class MessageService {
  private messageSource: Subject<MessageModel>;
  private started = false;
  private intervalSubscription = Subscription.EMPTY;
  private stopPop$: Observable<boolean>;
  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private router: Router,
    identityService: IdentityService,
    private ngZone: NgZone
  ) {
    this.messageSource = new BehaviorSubject(null);
    this.stopPop$ = identityService.getIdentity().pipe(
      map(r => {
        if (r && r.Id && r.Ticket) {
          this.autoPopMessages();
          return true;
        }
        // this.started = false;
        return false;
      })
    );
   this. autoPopMessages() ;
  }
  getMsgCount() {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-GetCount";
    return this.apiService.getResponse<{ Count: number }>(req).pipe(
      map(r => r.Data && r.Data.Count),
      catchError(_ => of(0))
    );
  }
  getMessage() {
    return this.messageSource.asObservable();
  }
  Read(msgIds: string[]) {
    if (msgIds.length === 0) {
      return Promise.resolve(true);
    }
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-Read";
    req.IsShowLoading = true;
    req.Data = {
      Id: msgIds.join(",")
    };
    return this.apiService
      .getPromiseResponse(req)
      .then(_ => true)
      .catch(_ => {
        AppHelper.alert(_);
        return false;
      });
  }
  Remove(msgIds: string[]) {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-Remove";
    req.IsShowLoading = true;
    req.Data = {
      Id: msgIds.join(",")
    };
    return this.apiService
      .getPromiseResponse(req)
      .then(_ => true)
      .catch(_ => {
        AppHelper.alert(_);
        return false;
      });
  }
  loadMoreMessages(
    currentPage: number = 0,
    pageSize: number = 20
  ): Promise<MessageModel[]> {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-Show";
    req.Data = {
      PageIndex: currentPage,
      PageSize: pageSize
    };
    return this.apiService
      .getPromiseResponse<MessageModel[]>(req)
      .catch(_ => []);
  }
  private popMessage(): Promise<MessageModel> {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-Pop";
    return this.apiService.getPromiseResponse<MessageModel>(req);
  }
  private autoPopMessages() {
    console.log("autoPopMessages");
    if (!this.started) {
      if (this.intervalSubscription) {
        this.intervalSubscription.unsubscribe();
      }
      console.log("启动自动推送消息");
      this.started = true;
      this.ngZone.runOutsideAngular(() => {
        this.intervalSubscription = interval(15 * 1000)
          .pipe(
            // takeUntil(
            //   this.stopPop$.pipe(
            //     filter(r => !r),
            //     tap(r => {
            //       console.log("停止自动推送消息");
            //       this.started = false;
            //     })
            //   )
            // )
          )
          .subscribe(async _ => {
            const message = await this.popMessage().catch(
              _ => null as MessageModel
            );
            if (message) {
              this.ngZone.run(() => {
                this.messageSource.next(message);
              });
            }
          });
      });
    }
  }
}
