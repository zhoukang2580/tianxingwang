import { MessageService } from "./../message.service";
import { AppHelper } from "../../appHelper";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject, BehaviorSubject } from "rxjs";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MessageModel } from "src/app/message/message.service";
import * as moment from "moment";
@Component({
  selector: "app-message-detail",
  templateUrl: "./message-detail.page.html",
  styleUrls: ["./message-detail.page.scss"]
})
export class MessageDetailPage implements OnInit {
  message: MessageModel;
  //  = {
  //   Title: "测试标题",
  //   Detail:
  //     "单身快乐军付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付寻错木吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧不是圣诞节里看风景的三轮车下拉框句",
  //   Url: "https://www.baidu.com",
  //   InsertTime: moment().format("YYYY-MM-DD HH:mm"),
  //   Id: "aaaa",
  //   IsRead: false
  // };
  showDetail: boolean;
  url$: Subject<any>;
  constructor(
    route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {
    this.url$ = new BehaviorSubject(null);
    route.queryParamMap.subscribe(p => {
      const m = p.get("message");
      if (m) {
        this.message = JSON.parse(m);
        if (this.message) {
          if (!this.message.IsRead) {
            this.messageService.Read([this.message.Id]);
          }
          this.message.InsertTime = moment(this.message.InsertTime).format(
            "YYYY-MM-DD HH:mm"
          );
        }
        if (this.message && this.message.Url) {
          this.showDetail = false;
          this.message.Url = this.message.Url.includes("?")
            ? `${this.message.Url}&ticket=${AppHelper.getTicket()}`
            : `${this.message.Url}?ticket=${AppHelper.getTicket()}`;
        }
      }
      console.log(this.message);
    });
  }
  onShowDetail() {
    this.showDetail = true;
    this.url$.next(
      this.sanitizer.bypassSecurityTrustResourceUrl(this.message.Url)
    );
  }
  ngOnInit() {}
}
