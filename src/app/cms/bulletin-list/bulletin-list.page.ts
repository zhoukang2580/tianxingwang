import { AppHelper } from "./../../appHelper";
import { ActivatedRoute, Router } from "@angular/router";
import { IonRefresher, IonInfiniteScroll, NavController } from "@ionic/angular";
import { Component, OnInit, ViewChild } from "@angular/core";
import { CmsService, Notice } from "../cms.service";

@Component({
  selector: "app-bulletin-list",
  templateUrl: "./bulletin-list.page.html",
  styleUrls: ["./bulletin-list.page.scss"]
})
export class BulletinListPage implements OnInit {
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  bulletines: Notice[] = [];
  bulletinType: string;
  currentPage = 0;
  loading = true;
  constructor(
    private cmsService: CmsService,
    route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController
  ) {
    route.queryParams.subscribe(p => {
      console.log("BulletinListPage ", p);
      this.bulletinType = p.bulletinType || "notice";
    });
  }
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.doRefresh();
  }
  viewNoticeUrl(notice: Notice) {
    this.cmsService.setSelectedNotice(notice);
    this.router.navigate([AppHelper.getRoutePath("view-bulletin-detail")]);
  }
  doRefresh() {
    this.loading = true;
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.currentPage = 0;
    this.bulletines = [];
    this.loadMore();
  }
  async loadMore() {
    const notices =
      this.bulletinType === "notice"
        ? await this.cmsService.getNotices(this.currentPage)
        : await this.cmsService.getAgentNotices(this.currentPage);
    if (notices.length) {
      this.currentPage++;
      notices.forEach(item => {
        this.bulletines.push(item);
      });
    }
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.scroller) {
      this.scroller.disabled = notices.length === 0;
      this.scroller.complete();
    }
    this.loading = false;
    // console.log(this.bulletines);
  }
}
