import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { IonInfiniteScroll } from "@ionic/angular";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { MapService } from "src/app/services/map/map.service";

@Component({
  selector: "app-demand-search",
  templateUrl: "./demand-search.component.html",
  styleUrls: ["./demand-search.component.scss"],
})
export class DemandSearchComponent implements OnInit, OnDestroy {
  curPos: { lat: string; lng: string };
  kw: string;
  posList: any[];
  isLoading = false;
  private pageSize = 20;
  private dataSource: any[];
  private subscription = Subscription.EMPTY;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  constructor() {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  back() {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
  onSelect(it) {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss({ ...it });
      }
    });
  }
  ngOnInit() {
    if (this.dataSource) {
      this.dataSource = this.dataSource
        .filter((it) => it.IsHot)
        .concat(this.dataSource.filter((it) => !it.IsHot));
    }
    this.scroller.disabled = true;
    this.onSearch();
  }
  loadMore() {
    if (this.dataSource) {
      let arr = this.dataSource;
      if (this.kw) {
        arr = this.dataSource.filter((it) =>
          (
            it.searchValue ||
            it.Name ||
            it.Pinyin ||
            it.CityName ||
            it.CountryCode ||
            ""
          )
            .toLowerCase()
            .includes(this.kw)
        );
      }
      arr = arr.slice(this.posList.length, this.pageSize + this.posList.length);
      this.scroller.disabled = arr.length < this.pageSize;
      if (arr.length) {
        this.posList = this.posList.concat(arr);
      }
      this.scroller.complete();
    }
  }
  onSearch() {
    this.isLoading = true;
    this.scroller.disabled = true;
    if (this.dataSource) {
      this.posList = [];
      this.loadMore();
    }
    this.isLoading = false;
  }
}
