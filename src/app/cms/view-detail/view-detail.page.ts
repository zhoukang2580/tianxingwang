import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { CmsService, Notice } from "./../cms.service";
import { DomSanitizer } from "@angular/platform-browser";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterContentChecked
} from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-view-detail",
  templateUrl: "./view-detail.page.html",
  styleUrls: ["./view-detail.page.scss"]
})
export class ViewDetailPage implements OnInit, AfterContentChecked {
  @ViewChild("detailInfo", { static: false }) detailInfoEle: ElementRef<
    HTMLElement
  >;
  notice: Notice;
  constructor(
    private cmsService: CmsService,
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {}
  back() {
    this.navCtrl.pop();
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
            this.notice.Url = this.sanitizer.bypassSecurityTrustResourceUrl(
              this.notice.Url
            ) as string;
          }
        }
      }
    });
  }
  ngAfterContentChecked() {
    if (this.detailInfoEle) {
      const pres = this.detailInfoEle.nativeElement.querySelectorAll("pre");
      pres.forEach(pre => {
        // console.log("content checck", pre.classList);
        if (pre && !pre.classList.contains("normal")) {
          pre.classList.add("normal");
          pre.style.whiteSpace = "normal";
        }
      });
    }
  }
}
