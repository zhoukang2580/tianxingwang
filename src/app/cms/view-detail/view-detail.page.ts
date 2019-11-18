import { ActivatedRoute } from '@angular/router';
import { environment } from "src/environments/environment";
import { CmsService, Notice } from "./../cms.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-view-detail",
  templateUrl: "./view-detail.page.html",
  styleUrls: ["./view-detail.page.scss"]
})
export class ViewDetailPage implements OnInit {
  notice: Notice;
  constructor(
    private cmsService: CmsService,
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) { }
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(async d => {
      if (d) {
        const id = d.get("noticeId");
        if (id) {
          this.notice = await this.cmsService.getNoticeDetail(id).catch(_ => null);
          if (this.notice && this.notice.Url) {
            this.notice.Url = this.sanitizer.bypassSecurityTrustResourceUrl(this.notice.Url) as string;
          }
        }
      }
    })
  }
}
