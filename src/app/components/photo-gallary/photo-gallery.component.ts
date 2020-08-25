import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { PhotoGallaryService as PhotoGalleryService } from "./photo-gallery.service";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { IonInfiniteScroll } from "@ionic/angular";
import { finalize } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-photo-gallary",
  templateUrl: "./photo-gallery.component.html",
  styleUrls: ["./photo-gallery.component.scss"],
})
export class PhotoGalleryComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  gallaeries: {
    date: string;
    datas: { ImageUrl: string }[];
  }[];
  config: ConfigEntity;
  isLoading = false;
  private subscription = Subscription.EMPTY;
  private pageIndex = 0;
  constructor(
    private galleryService: PhotoGalleryService,
    private configSerice: ConfigService
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.configSerice.getConfigAsync().then((c) => {
      this.config = c;
    });
    this.gallaeries = [];
    this.subscription.unsubscribe();
    this.scroller.disabled = true;
    this.pageIndex = 0;
    this.isLoading = false;
    this.loadMore();
  }
  onBack() {
    AppHelper.modalController.getTop().then((t) => t.dismiss());
  }
  loadMore() {
    this.isLoading = true;
    this.subscription = this.galleryService
      .getGalleryList(this.pageIndex)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          setTimeout(() => {
            this.scroller.complete();
          }, 200);
        })
      )
      .subscribe((r) => {
        this.scroller.disabled = r && r.length < 20;
        if (r && r.length) {
          this.pageIndex++;
        }
        this.groupByDate(r);
      });
  }
  onSelect(item) {
    AppHelper.modalController.getTop().then((t) => {
      t.dismiss(item.ImageUrl);
    });
  }
  onBrowser() {}
  private groupByDate(arr: { ImageUrl: string; InsertTime: string }[]) {
    if (arr) {
      arr.forEach((it) => {
        const dateArr = it.InsertTime.split("-");
        const date = `${dateArr[0]}年${dateArr[1]}月${dateArr[2]}日`;
        const l = this.gallaeries.find((o) => o.date == date);
        if (l) {
          l.datas.push({ ImageUrl: it.ImageUrl });
        } else {
          this.gallaeries.push({
            datas: [{ ImageUrl: it.ImageUrl }],
            date,
          });
        }
      });
    }
  }
}
