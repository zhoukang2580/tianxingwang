import { AppHelper } from "../../../appHelper";
import { Router } from "@angular/router";
import { MessageModel } from "../../message.service";
import {
  Component,
  OnInit,
  Input,
  HostListener,
  HostBinding,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0" })),
      transition("true<=>false", animate("200ms"))
    ])
  ]
})
export class MessageComponent implements OnInit, OnChanges, OnDestroy {
  timeoutid: any;
  @HostBinding("@openclose")
  @HostBinding("class.open")
  open = false;
  @Input() message: MessageModel;
  constructor(private router: Router) {}
  ngOnInit() {}
  @HostListener("click")
  goToDetail() {
    this.open = false;
    this.router.navigate([AppHelper.getRoutePath("message-detail")], {
      queryParams: { message: JSON.stringify(this.message) }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.message) {
      if (changes.message && changes.message.currentValue) {
        this.open = true;
        if (this.timeoutid) {
          clearTimeout(this.timeoutid);
        }
        this.timeoutid = setTimeout(() => {
          this.open = false;
        }, 3 * 1000);
      }
    }
    // this.message = {
    //   Title: "测试标题",
    //   Detail:
    //     "单身快乐军付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付付寻错木吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧不是圣诞节里看风景的三轮车下拉框句",
    //   Url: "https://www.baidu.com",
    //   InsertTime: ("YYYY-MM-DD HH:mm"),
    //   Id: "aaaa",
    //   IsRead: false
    // };
  }
  ngOnDestroy() {}
}
