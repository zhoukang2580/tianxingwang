import { ActivatedRoute } from "@angular/router";
import { flyInOut } from "./../../animations/flyInOut";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { NavController, IonInfiniteScroll, IonRefresher } from "@ionic/angular";
import {
  distinctUntilChanged,
  switchMap,
  catchError,
  finalize,
  tap,
  debounceTime,
  map
} from "rxjs/operators";
import { Subscription, of, Observable } from "rxjs";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { HotelService } from "../hotel.service";
interface ISearchTextValue {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-search-hotel-byText",
  templateUrl: "./combox-search-hotel.page.html",
  styleUrls: ["./combox-search-hotel.page.scss"],
  animations: [flyInOut]
})
export class ComboxSearchHotelPage implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) refresh: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  private pageIndex = 0;
  private subscription = Subscription.EMPTY;
  private subscription2 = Subscription.EMPTY;
  searchText: string;
  searchResult: ISearchTextValue[];
  isLoading = false;
  constructor(
    private hotelService: HotelService,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.subscription2 = this.route.queryParamMap.subscribe(() => {
      this.doRefresh();
    });
  }
  ngOnDestroy() {
    this.subscription2.unsubscribe();
  }
  onSearch() {
    this.subscription.unsubscribe();
    this.searchResult = [];
    this.subscription = of((this.searchText || "").trim())
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(name => this.load(name)),
        catchError(_ => of({ Data: [] }))
      )
      .subscribe(res => {
        this.searchResult = res.Data;
        this.enableScroller(res.Data.length >= 20);
      });
  }
  private load(name: string) {
    this.isLoading = true;
    return this.hotelService.searchHotelByText(name, this.pageIndex).pipe(
      finalize(() => {
        if (this.pageIndex <= 1) {
          if (this.refresh) {
            this.refresh.complete();
          }
        }
        if (this.scroller) {
          this.scroller.complete();
        }
        setTimeout(() => {
          this.isLoading = false;
        }, 200);
      }),
      map(r => ({ Data: r })),
      catchError(e => {
        console.error(e);
        return of({ Data: [] });
      })
    );
  }
  loadMore(name: string = "") {
    this.subscription = this.load(name).subscribe(res => {
      const arr = (res && res.Data) || [];
      this.enableScroller(arr.length >= 20);
      if (arr.length) {
        this.pageIndex++;
        this.searchResult = this.searchResult.concat(res.Data);
      }
    });
  }
  private enableScroller(enable: boolean) {
    if (this.scroller) {
      this.scroller.disabled = !enable;
    }
  }
  doRefresh() {
    this.searchText = "";
    this.searchResult = [];
    this.pageIndex = 0;
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.onSearch();
  }
  onSelect(it?: ISearchTextValue) {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      searchText: it
    });
    setTimeout(() => {
      this.navCtrl.back();
    }, 200);
  }
  back() {
    this.navCtrl.back();
  }
}