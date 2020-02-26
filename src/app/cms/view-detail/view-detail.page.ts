import { FileHelperService } from 'src/app/services/file-helper.service';
import { AppHelper } from "./../../appHelper";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { CmsService, Notice } from "./../cms.service";
import { DomSanitizer } from "@angular/platform-browser";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterContentChecked,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  AfterViewInit,
  DoCheck,
  ChangeDetectorRef
} from "@angular/core";
import { Observable, Subscription, fromEvent } from "rxjs";
import { map, tap, subscribeOn } from "rxjs/operators";
import { NavController, Platform } from "@ionic/angular";

@Component({
  selector: "app-view-detail",
  templateUrl: "./view-detail.page.html",
  styleUrls: ["./view-detail.page.scss"]
})
export class ViewDetailPage implements OnInit, AfterContentChecked, OnDestroy {
  @ViewChild("detailInfo") detailInfoEle: ElementRef<HTMLElement>;
  notice: Notice;
  private subscriptions: Subscription[] = [];
  constructor(
    private cmsService: CmsService,
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private plt: Platform,
    private router: Router
  ) { }
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (this.notice && this.notice.Url) {
      this.notice.Url = "";
      // this.initialAnchors();
      this.cdRef.detectChanges();
      return;
    }
    this.navCtrl.pop();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(async d => {
      if (d) {
        const id = d.get("noticeId");
        if (id) {
          this.notice = await this.cmsService
            .getNoticeDetail(id)
            .catch(_ => null);
          if (this.notice && this.notice.Url) {
            const url = this.notice.Url;
            this.notice.Url = "";
            this.onOpenLink(url);
          }
          this.processLinks();
        }
      }
    });
  }
  private processLinks() {
    if (this.notice && this.notice.Detail) {
      const cntContainsLinks = this.notice.Detail.match(
        /(\s*\w*http[s].*?)(?=<\/[^a])/gi
      );
      let detail = this.notice.Detail;
      console.log("detail before", detail);
      if (cntContainsLinks && cntContainsLinks.length) {
        cntContainsLinks.forEach(a => {
          detail = detail.replace(a, `<a href=${a}></a>`);
        });
      }
      console.log("detail after", detail);
      this.notice.Detail = detail;
    }
  }
  ngAfterContentChecked() {
    if (this.detailInfoEle) {
      // console.log("contentcheck");
      const pres = this.detailInfoEle.nativeElement.querySelectorAll("pre");
      pres.forEach(pre => {
        // console.log("content checck", pre.classList);
        if (pre && !pre.classList.contains("normal")) {
          pre.classList.add("normal");
          pre.style.whiteSpace = "normal";
        }
      });
      this.initialAnchors();
    }
  }

  private initialAnchors() {
    if (this.detailInfoEle && this.detailInfoEle.nativeElement) {
      const anchors = this.detailInfoEle.nativeElement.querySelectorAll("a");
      if (anchors) {
        // console.log("initialAnchors");
        anchors.forEach((a, idx) => {
          if (!a.getAttribute("initialized")) {
            const p = a.parentElement;
            const span = document.createElement("span");
            span.style.color = `var(--ion-color-secondary)`;
            span.addEventListener(
              "click",
              evt => {
                this.onOpenLink(a.href);
              },
              false
            );
            a.style.display = "none";
            span.innerHTML = a.href;
            p.insertBefore(span, a);
            a.setAttribute("initialized", "initialized");
          }
        });
      }
    }
  }
  private onOpenLink(url: string) {
    if (url) {
      // this.notice.Url = url;
      this.http.get(url, { responseType: "arraybuffer" }).subscribe(
        res => {
          console.log(res);
          this.notice.Url = this.sanitizer.bypassSecurityTrustResourceUrl(
            url
          ) as string;
        },
        e => {
          console.error(e);
          AppHelper.alert(
            "需要使用浏览器打开，将离开应用，是否打开？",
            true,
            "确定",
            "取消"
          ).then(ok => {
            if (ok) {
              if (!AppHelper.isApp()) {
                if (this.plt.is("ios")) {
                  window.location.href = url;
                } else {
                  window.open(url, "_blank");
                }
              } else {
                this.router.navigate(["open-url"], {
                  queryParams: {
                    url,
                    title: this.notice.Title,
                    isOpenInAppBrowser: AppHelper.isApp(),
                    isHideTitle:true// AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
                  }
                });
              }
            }
          });
        }
      );
    }
  }
}
