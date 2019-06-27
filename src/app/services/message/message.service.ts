import { ApiService } from "./../api/api.service";
import { Injectable } from "@angular/core";
import { interval, Subject, BehaviorSubject } from "rxjs";
import { RequestEntity } from "../api/Request.entity";
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
  private messages: MessageModel[] = [];
  private messageSource: Subject<MessageModel>;
  constructor(private apiService: ApiService) {
    this.messageSource = new BehaviorSubject(null);
    this.autoRefreshMessages();
    this.autoToastMessage();
  }
  getMessage() {
    return this.messageSource.asObservable();
  }
  private autoToastMessage() {
    interval(6 * 1000).subscribe(count => {
      this.messageSource.next(this.messages[count % this.messages.length]);
    });
  }
  private loadMessages(): Promise<MessageModel[]> {
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Message-Pop";
    return this.apiService.getPromiseResponse<MessageModel[]>(req);
  }
  private autoRefreshMessages() {
    interval(30 * 1000).subscribe(async _ => {
      const messages = await this.loadMessages().catch(
        _ => [] as MessageModel[]
      );
      if (messages) {
        messages.forEach(item => {
          this.messages.unshift(item);
        });
        this.messages = this.messages.slice(0, 10);
      }
    });
  }
}
