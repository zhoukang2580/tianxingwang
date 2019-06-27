import { AppHelper } from "./../../appHelper";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject, BehaviorSubject } from "rxjs";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MessageModel } from "src/app/services/message/message.service";
@Component({
  selector: "app-message-detail",
  templateUrl: "./message-detail.page.html",
  styleUrls: ["./message-detail.page.scss"]
})
export class MessageDetailPage implements OnInit {
  message: MessageModel;
  showDetail: boolean;
  url$: Subject<any>;
  constructor(route: ActivatedRoute, private sanitizer: DomSanitizer) {
    this.url$ = new BehaviorSubject(null);
    route.queryParamMap.subscribe(p => {
      const m = p.get("message");
      if (m) {
        this.message = JSON.parse(m);
        if (this.message&&this.message.Url) {
          this.showDetail=false;
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
