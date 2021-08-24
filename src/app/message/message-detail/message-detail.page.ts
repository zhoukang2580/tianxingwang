import { ApiService } from "./../../services/api/api.service";
import { NavController, LoadingController } from "@ionic/angular";
import { MessageService } from "./../message.service";
import { AppHelper } from "../../appHelper";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject, BehaviorSubject } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MessageModel } from "src/app/message/message.service";
import * as moment from "moment";
@Component({
  selector: "app-message-detail",
  templateUrl: "./message-detail.page.html",
  styleUrls: ["./message-detail.page.scss"],
})
export class MessageDetailPage implements OnInit, AfterViewInit {
  message: MessageModel;
  isShowLink: boolean;
  url$: Subject<any>;
  isShowUrlBtn = false;
  @ViewChildren("iframe") iframEles: QueryList<ElementRef<HTMLIFrameElement>>;
  @ViewChildren("msgdetail") msgdetailEles: QueryList<ElementRef<HTMLElement>>;
  constructor(
    route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private navCtrl: NavController,
    private loadingController: LoadingController
  ) {
    this.url$ = new BehaviorSubject(null);
    route.queryParamMap.subscribe((p) => {
      this.isShowUrlBtn = false;
      try {
        const m = this.messageService.curViewMsgItem;
        if (m) {
          this.message = m;
          if (this.message) {
            if (!this.message.IsRead) {
              this.messageService.Read([this.message.Id]);
            }
            this.message.InsertTime = moment(this.message.InsertTime).format(
              "YYYY-MM-DD HH:mm"
            );
          }
          if (this.message && this.message.Url) {
            this.isShowLink = false;
            this.message.Url = this.appenTicket(this.message.Url);
            this.isShowUrlBtn = !!this.message.Url;
          }
        }
        console.log(this.message);
      } catch (e) {
        console.error(e);
      }
    });
  }
  private appenTicket(url: string) {
    if (url) {
      const tn: string = (AppHelper.getTicketName() || "").toLowerCase();
      const tk = AppHelper.getTicket();
      if (!url.includes(tn)) {
        if (url.includes("?")) {
          url = `${url}&${tn}=${tk}`;
        } else {
          url = `${url}?${tn}=${tk}`;
        }
      }
    }
    return url;
  }
  ngAfterViewInit() {
    if (this.iframEles) {
      this.iframEles.changes.subscribe(async (_) => {
        // console.log(this.iframEles.first);
        const l = await this.loadingController.create({
          message: "请稍候",
        });
        l.backdropDismiss = true;
        if (this.iframEles.first && this.iframEles.first.nativeElement) {
          l.present();
          this.iframEles.first.nativeElement.onload = () => {
            l.dismiss().catch((_) => 0);
          };
        } else {
          l.dismiss().catch((_) => 0);
        }
      });
    }
    if (this.msgdetailEles) {
      if (
        this.msgdetailEles.first &&
        this.msgdetailEles.first &&
        this.msgdetailEles.first.nativeElement
      ) {
        this.renderHtml();
      }
      this.msgdetailEles.changes.subscribe((_) => {
        // console.log(_);
        this.renderHtml();
      });
    }
  }
  private renderHtml() {
    if (this.msgdetailEles.first && this.msgdetailEles.first.nativeElement) {
      this.msgdetailEles.first.nativeElement.innerHTML =
        this.message && this.message.Detail;
      const anchors =
        this.msgdetailEles.first.nativeElement.querySelectorAll("a");
      if (anchors && anchors.length) {
        anchors.forEach((a) => {
          if (a.href) {
            a.style.color = "var(--ion-color-secondary)";
            a.style.textDecoration = "none";
            a.onclick = (evt: MouseEvent) => {
              evt.preventDefault();
              evt.stopPropagation();
              this.onShowDetail(a.href);
              return false;
            };
          }
        });
      }
    }
  }
  back() {
    if (this.isShowLink) {
      this.isShowLink = false;
      return;
    }
    this.navCtrl.pop();
  }
  onShowDetail(url: string) {
    this.isShowLink = true;
    this.url$.next(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }
  ngOnInit() {}
}
