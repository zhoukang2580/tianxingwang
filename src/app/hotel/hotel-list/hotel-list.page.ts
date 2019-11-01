import { ConfigEntity } from "./../../services/config/config.entity";
import { ConfigService } from "./../../services/config/config.service";
import { HotelConditionModel } from "src/app/hotel/models/ConditionModel";
import { HotelEntity } from "./../models/HotelEntity";
import { HotelResultEntity } from "./../models/HotelResultEntity";
import { HotelQueryComponent } from "./../components/hotel-query/hotel-query.component";
import { HotelQueryEntity } from "./../models/HotelQueryEntity";
import { Router, ActivatedRoute } from "@angular/router";
import { HotelService, SearchHotelModel } from "./../hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  HostBinding,
  ViewChildren,
  QueryList,
  AfterViewInit,
  Renderer2
} from "@angular/core";
import {
  NavController,
  IonContent,
  IonHeader,
  IonSearchbar,
  IonRefresher,
  IonInfiniteScroll,
  IonToolbar,
  DomController,
  Platform,
  IonList
} from "@ionic/angular";
import { Subscription, Observable } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { QueryTabComponent } from "../components/hotel-query/query-tab/query-tab.component";
import { HotelDayPriceEntity } from "../models/HotelDayPriceEntity";
import { finalize } from "rxjs/operators";
import { FlightHotelTrainType, TmcService } from "src/app/tmc/tmc.service";

@Component({
  selector: "app-hotel-list",
  templateUrl: "./hotel-list.page.html",
  styleUrls: ["./hotel-list.page.scss"]
})
export class HotelListPage implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild("querytoolbar") querytoolbar: IonToolbar;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(HotelQueryComponent) queryComp: HotelQueryComponent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  @ViewChildren("hotellist") hotellist: QueryList<IonList>;
  @HostBinding("class.show-search-bar") isShowSearchBar = false;
  isLoading = false;
  isLeavePage = false;
  searchHotelModel: SearchHotelModel;
  hotelQueryModel: HotelQueryEntity = new HotelQueryEntity();
  hotelDayPrices: HotelDayPriceEntity[] = [];
  vmKeyowrds = "";
  keyowrds = "";
  isSearching = false;
  vmSearchTextList: { Text: string; Value: string }[] = [];
  searchSubscription = Subscription.EMPTY;
  loadDataSub = Subscription.EMPTY;
  conditionModel: HotelConditionModel;
  config$: Observable<ConfigEntity>;
  constructor(
    private navCtrl: NavController,
    private hotelService: HotelService,
    private router: Router,
    private domCtrl: DomController,
    private render: Renderer2,
    private plt: Platform,
    private route: ActivatedRoute,
    private tmcService: TmcService,
    private configService: ConfigService
  ) { }
  onSearchItemClick(item: { Text: string; Value: string }) {
    this.isShowSearchBar = false;
    if (item) {
      this.hotelQueryModel.HotelId = item.Value;
      this.keyowrds = this.hotelQueryModel.SearchKey = item.Text;
      this.doRefresh(true);
    }
  }
  ngAfterViewInit() {
    this.autofocusSearchBarInput();
    if (this.hotellist) {
      const sub = this.hotellist.changes.subscribe(_ => {
        if (this.hotellist && this.hotellist.first) {
          setTimeout(() => {
            const height =
              (this.querytoolbar &&
                this.querytoolbar["el"] &&
                this.querytoolbar["el"].clientHeight) ||
              (this.plt.is("ios") ? 44 : 56);
            if (height) {
              this.domCtrl.write(_ => {
                this.render.setStyle(
                  this.hotellist.first["el"],
                  "margin-top",
                  `${height}px`
                );
              });
            }
          }, 10);
        }
      });
      this.subscriptions.push(sub);
    }
  }
  getStars(hotel: HotelEntity) {
    if (hotel && hotel.Category) {
      hotel.Category = `${hotel.Category}`;
      if (+hotel.Category >= 5) {
        return new Array(5).fill(1);
      }
      if (hotel.Category.includes(".")) {
        const a = hotel.Category.split(".");
        return new Array(+a[0]).fill(1).concat([0.5]);
      }
      return new Array(+hotel.Category).fill(1);
    }
    return [];
  }
  private autofocusSearchBarInput() {
    if (this.searchbarEls) {
      const sub = this.searchbarEls.changes.subscribe(_ => {
        if (this.searchbarEls.first) {
          this.searchbarEls.first.getInputElement().then(input => {
            if (input) {
              input.focus();
            }
          });
        }
      });
      this.subscriptions.push(sub);
    }
  }
  onSearchByKeywords() {
    // console.log("onSearchByKeywords",this.vmKeyowrds);
    const name = (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    this.searchSubscription.unsubscribe();
    this.isSearching = true;
    this.searchSubscription = this.hotelService
      .searchHotelByText(name)
      .pipe(finalize(() => (this.isSearching = false)))
      .subscribe(kvs => {
        this.vmSearchTextList = kvs;
      });
  }
  onHotelQueryChange(query: HotelQueryEntity) {
    this.hotelQueryModel = {
      ...query
    };
    this.hotelDayPrices = [];
    this.isLoading = true;
    setTimeout(() => {
      this.doRefresh(true);
    }, 200);
  }
  doRefresh(isKeepQueryCondition = false) {
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.queryComp) {
      this.queryComp.onReset();
    }
    if (!isKeepQueryCondition) {
      this.hotelQueryModel = new HotelQueryEntity();
    }
    this.hotelQueryModel.PageIndex = 0;
    this.hotelQueryModel.PageSize = 20;
    this.hotelDayPrices = [];
    this.scrollToTop();
    this.loadMore();
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  loadMore() {
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.isLoading =
      this.hotelQueryModel && this.hotelQueryModel.PageIndex == 0;
    this.loadDataSub = this.hotelService
      .getHotelList(this.hotelQueryModel)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          setTimeout(() => {
            if (this.scroller) {
              this.scroller.complete();
            }
          }, 10);
        })
      )
      .subscribe(
        result => {
          if (result && result.Data && result.Data.HotelDayPrices) {
            const arr = result.Data.HotelDayPrices;
            if (this.scroller) {
              this.scroller.disabled = arr.length == 0;
            }
            if (arr.length) {
              this.hotelQueryModel.PageIndex++;
              this.hotelDayPrices = [...this.hotelDayPrices, ...arr];
            }
            console.log("this.scroller.disabled", this.scroller.disabled);
          }
        },
        e => {
          console.error(e);
        }
      );
  }
  async onDateChange() {
    const days = await this.hotelService.openCalendar();
    if (days.length) {
      this.hotelQueryModel.BeginDate = days[0].date;
      this.hotelQueryModel.EndDate = days[days.length - 1].date;
      this.doRefresh();
    }
  }
  goToDetail(item: HotelDayPriceEntity) {
    this.router.navigate([AppHelper.getRoutePath("hotel-detail")], {
      queryParams: {
        data: JSON.stringify(item)
      }
    });
  }
  onCityClick() {
    this.router.navigate([AppHelper.getRoutePath("hotel-city")]);
  }
  onSearchClick() {
    this.isShowSearchBar = true;
    this.hotelQueryModel.HotelId = "";
    this.hotelQueryModel.SearchKey = "";
    this.keyowrds = this.vmKeyowrds = "";
    this.vmSearchTextList = [];
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("search-hotel")]);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  ngOnInit() {
    this.config$ = this.configService.getConfigSource();
    const sub0 = this.route.queryParamMap.subscribe(_ => {
      this.isShowSearchBar = false;
      this.isLeavePage = false;
    });
    this.subscriptions.push(sub0);
    const sub = this.hotelService.getConditionModelSource().subscribe(c => {
      this.conditionModel = c;
    });
    const sub1 = this.hotelService.getSearchHotelModelSource().subscribe(m => {
      console.log(m);
      if (m) {
        this.searchHotelModel = m;
        this.hotelQueryModel.CityCode =
          m.destinationCity && m.destinationCity.Code;
        this.hotelQueryModel.CityName =
          m.destinationCity && m.destinationCity.Name;
        this.hotelQueryModel.BeginDate = m.checkInDate;
        this.hotelQueryModel.EndDate = m.checkOutDate;
        this.hotelQueryModel.City = m.destinationCity;
        if (m.isRefreshData) {
          this.doRefresh();
          this.hotelService.setSearchHotelModel({
            ...m,
            isRefreshData: false
          });
        }
      }
    });
    this.subscriptions.push(sub);
    this.subscriptions.push(sub1);
  }
}
