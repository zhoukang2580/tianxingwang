import { ToastController } from "@ionic/angular";
import { ApiService } from "./../api/api.service";
import { Injectable } from "@angular/core";
import { interval, Subject, BehaviorSubject } from "rxjs";
import { RequestEntity } from "../api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
export interface MessageModel {
  Id: string;
  Title: string; // "测试标题:" + i,
  Detail: string; // "消息消息消息消息消息消息",
  IsRead: boolean;
  Url: string; //
  InsertTime: string; //
}
@Injectable({
  providedIn: "root"
})
export class MessageService {
  private messageSource: Subject<MessageModel>;
  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.messageSource = new BehaviorSubject(null);
    this.autoPopMessages();
  }
  getMessage() {
    return this.messageSource.asObservable();
  }
  private popMessage(): Promise<MessageModel> {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-Pop";
    return this.apiService.getPromiseResponse<MessageModel>(req);
  }
  private autoPopMessages() {
    interval(4 * 1000).subscribe(async _ => {
      const message = await this.popMessage().catch(_ => null as MessageModel);
      if (message) {
        // const t = await this.toastCtrl.create({
        //   header: `${message.Title}<ion-label margin-start>${
        //     message.InsertTime
        //   }</ion-label>`,
        //   message: `${
        //     message.Detail.length > 30
        //       ? `${message.Detail.substring(0, 30)}...`
        //       : message.Detail
        //   }`,
        //   duration: 3 * 1000,
        //   position: "top",
        //   mode: "ios",
        //   translucent: true,
        //   color: "white"
        // });
        // t.present();
        // t.onclick = () => {
        //   t.dismiss();
        //   this.router.navigate([AppHelper.getRoutePath("message-detail")], {
        //     queryParams: { message: JSON.stringify(message) }
        //   });
        // };
        this.messageSource.next(message);
      }
    });
  }
}
