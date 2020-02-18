import { flyInOut } from "./../../animations/flyInOut";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { NavController, IonInfiniteScroll, IonRefresher } from "@ionic/angular";
import {
  distinctUntilChanged,
  switchMap,
  catchError,
  finalize,
  tap,
  debounceTime
} from "rxjs/operators";
import { Subscription, of } from "rxjs";
import {
  InternationalHotelService,
  ISearchTextValue
} from "./../international-hotel.service";
import { Component, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-search-by-text",
  templateUrl: "./combo-search-inter-hotel.page.html",
  styleUrls: ["./combo-search-inter-hotel.page.scss"],
  animations: [flyInOut]
})
export class ComboSearchInterHotelPage implements OnInit {
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  private pageIndex = 0;
  private subscription = Subscription.EMPTY;
  searchText: string;
  searchResult: ISearchTextValue[];
  isLoading = false;
  constructor(
    private hotelService: InternationalHotelService,
    private navCtrl: NavController
  ) {}
  ngOnInit() {
    this.doRefresh();
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
        this.enableScroller(res.Data && res.Data.length >= 20);
      });
  }
  private load(name: string) {
    this.isLoading = true;
    return this.hotelService.searchHotel(name, this.pageIndex).pipe(
      finalize(() => {
        if (this.pageIndex <= 1) {
          if (this.refresher) {
            this.refresher.complete();
          }
        }
        if (this.scroller) {
          this.scroller.complete();
        }
        setTimeout(() => {
          this.isLoading = false;
        }, 200);
      }),
      catchError(e => {
        console.error(e);
        return of({ Data: [] });
      })
    );
  }
  loadMore(name: string = "") {
    this.subscription = this.load(name)
      .pipe(
        finalize(() => {
          if (this.scroller) {
            this.scroller.complete();
          }
          if (this.refresher && this.pageIndex <= 1) {
            this.refresher.complete();
          }
        })
      )
      .subscribe(res => {
        const arr = (res && res.Data) || [];
        this.enableScroller(arr.length >= 20);
        if (arr.length) {
          this.pageIndex++;
          setTimeout(() => {
            this.searchResult = this.searchResult.concat(res.Data);
          }, 200);
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
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      searchText: it || {
        Text: this.searchText,
        Value: null
      }
    });
    setTimeout(() => {
      this.navCtrl.back();
    }, 200);
  }
  back() {
    this.navCtrl.back();
  }
}
