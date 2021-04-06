import { LangService } from "src/app/services/lang.service";
import { RefresherComponent } from "src/app/components/refresher";
import { ActivatedRoute, Router } from "@angular/router";
import { flyInOut } from "./../../animations/flyInOut";
import {
  NavController,
  IonInfiniteScroll,
  IonRefresher,
  IonSearchbar,
} from "@ionic/angular";
import {
  distinctUntilChanged,
  switchMap,
  catchError,
  finalize,
  tap,
  debounceTime,
  map,
} from "rxjs/operators";
import { Subscription, of, Observable } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { HotelService } from "../hotel.service";
import { AppHelper } from "src/app/appHelper";
interface ISearchTextValue {
  Text: string;
  Value?: string; // Code
  Id?: string; // Code
  CityName?: string; // Code
  CountryEnName?: string;
  CountryId?: string; // Code
  CountryName?: string; // Code
  CountryCode?: string; // Code
  IsHotel?: boolean;
  IsAddress?: boolean;
  Lat?: string;
  Lng?: string;
}
@Component({
  selector: "app-search-hotel-byText",
  templateUrl: "./combox-search-hotel.page.html",
  styleUrls: ["./combox-search-hotel.page.scss"],
  animations: [flyInOut],
})
export class ComboxSearchHotelPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(RefresherComponent) refresh: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  private pageIndex = 0;
  private subscription = Subscription.EMPTY;
  private subscription2 = Subscription.EMPTY;
  searchText: string;
  lat: string;
  lng: string;
  // placeholderSearchText: string;
  config: any;
  searchResult: ISearchTextValue[];
  isLoading = false;
  constructor(
    private hotelService: HotelService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private langService: LangService,
    private router: Router
  ) { }
  ngOnInit() {
    this.subscription2 = this.route.queryParamMap.subscribe((q) => {
      // this.searchText = q.get("kw");
      this.doRefresh(true);
    });
    if (this.langService.isCn) {
      this.config = "确定";
    } else {
      this.config = "OK";
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 300);
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
        distinctUntilChanged()
      )
      .subscribe((res) => {
        this.loadMore(res);
        this.loadAddress(res);
      });
  }
  private loadHotel(name: string) {
    this.isLoading = true;
    return this.hotelService.searchHotelByText(name, this.pageIndex).finally(() => {
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
    });
  }

  private loadAddress(name: string) {
    this.isLoading = true;
    return this.hotelService.searchHotelByAddress(name, this.pageIndex).then((res) => {
      const arr = res || [];
      if (arr.length) {
        this.searchResult = this.searchResult.concat(res);
      }
    }).finally(() => {
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
    });
  }

  loadMore(name: string = "") {
    this.loadHotel(name).then((res) => {
      const arr = res || [];
      this.enableScroller(arr.length >= 20);
      if (arr.length) {
        this.pageIndex++;
        this.searchResult = this.searchResult.concat(res);
      }
    });
  }



  private enableScroller(enable: boolean) {
    if (this.scroller) {
      this.scroller.disabled = !enable;
    }
  }
  doRefresh(keepSearchText = false) {
    if (!keepSearchText) {
      this.searchText = "";
    }
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
      searchText: it || { Text: this.searchText, Lat: this.lat, Lng: this.lng },
    });
    setTimeout(() => {
      
      if (it && it.IsHotel == true) {
        this.router.navigate([AppHelper.getRoutePath("hotel-detail")], {
          queryParams: { hotelId: it.Value },
        });
      } else {
        this.navCtrl.back();
      }
      // else if (it.IsAddress == true) {
      // }
    }, 200);
  }
  back() {
    this.navCtrl.back();
  }
}
