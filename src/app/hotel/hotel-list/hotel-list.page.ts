import { AgentEntity } from "./../../tmc/models/AgentEntity";
import { ConfigEntity } from "./../../services/config/config.entity";
import { ConfigService } from "./../../services/config/config.service";
import { HotelConditionModel } from "src/app/hotel/models/ConditionModel";
import { HotelEntity } from "./../models/HotelEntity";
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
  AfterContentInit
} from "@angular/core";
import {
  IonContent,
  IonSearchbar,
  IonRefresher,
  IonInfiniteScroll,
  IonToolbar,
  Platform
} from "@ionic/angular";
import { Subscription, Observable, fromEvent, merge } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { HotelDayPriceEntity } from "../models/HotelDayPriceEntity";
import { finalize } from "rxjs/operators";
import { TmcService } from "src/app/tmc/tmc.service";

@Component({
  selector: "app-hotel-list",
  templateUrl: "./hotel-list.page.html",
  styleUrls: ["./hotel-list.page.scss"]
})
export class HotelListPage
  implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  private subscriptions: Subscription[] = [];
  private lastCityCode = "";
  isIos = false;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild("querytoolbar") querytoolbar: IonToolbar;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(HotelQueryComponent) queryComp: HotelQueryComponent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  // @ViewChildren("hotellist") hotellist: QueryList<IonList>;
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
  config: ConfigEntity;
  agent: AgentEntity;
  scroll$: Observable<any>;
  scrollEle: HTMLElement;
  constructor(
    private hotelService: HotelService,
    private router: Router,
    private route: ActivatedRoute,
    private tmcService: TmcService,
    private configService: ConfigService,
    plt: Platform
  ) {
    this.isIos = plt.is("ios");
  }
  onSearchItemClick(item: { Text: string; Value: string }) {
    this.isShowSearchBar = false;
    if (item && item.Value) {
      this.hotelQueryModel.HotelId = item.Value;
      this.keyowrds = this.hotelQueryModel.SearchKey = item.Text;
      this.vmKeyowrds = "";
      this.doRefresh(true);
    }
  }
  async ngAfterContentInit() {}
  async ngAfterViewInit() {
    this.scrollEle = await this.content.getScrollElement();
    if (this.scrollEle) {
      this.scroll$ = merge(fromEvent(this.scrollEle, "scroll"));
    }
    this.autofocusSearchBarInput();
  }
  onSearch() {
    this.doRefresh();
    this.isShowSearchBar = false;
    this.vmSearchTextList = [];
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
    if (this.queryComp) {
      this.queryComp.onReset();
    }
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (!isKeepQueryCondition) {
      // if (this.queryComp) {
      //   this.queryComp.onReset();
      // }
      this.hotelQueryModel = new HotelQueryEntity();
      this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    }
    const searchText = this.vmKeyowrds && this.vmKeyowrds.trim();
    if (searchText) {
      this.hotelQueryModel.SearchKey = searchText;
      this.vmKeyowrds = "";
    }
    this.hotelQueryModel.PageIndex = 0;
    this.hotelQueryModel.PageSize = 20;
    this.hotelDayPrices = [];
    this.scrollToTop();
    this.loadMore();
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
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
          this.lastCityCode =
            this.searchHotelModel &&
            this.searchHotelModel.destinationCity.CityCode;
          this.isLoading = false;
        })
      )
      .subscribe(
        result => {
          if (this.refresher) {
            if (this.hotelQueryModel.PageIndex < 1) {
              console.log("refresher complete");
              this.refresher.complete();
              this.refresher.disabled = true;
              setTimeout(() => {
                this.refresher.disabled = false;
              }, 100);
            }
          }
          if (this.scroller) {
            this.scroller.complete();
          }
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
          if (this.scroller) {
            this.scroller.complete();
          }
          this.refresher.complete();
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
    this.hotelService.curViewHotel = { ...item };
    this.router.navigate([AppHelper.getRoutePath("hotel-detail")]);
  }
  onCityClick() {
    if (this.searchHotelModel && this.searchHotelModel.destinationCity) {
      this.lastCityCode = this.searchHotelModel.destinationCity.CityCode;
    }
    this.router.navigate([AppHelper.getRoutePath("hotel-city")]);
  }
  onSearchClick() {
    this.isShowSearchBar = true;
    this.hotelQueryModel.HotelId = ``;
    this.hotelQueryModel.SearchKey = null;
    this.keyowrds = this.vmKeyowrds = "";
    this.vmSearchTextList = [];
  }
  back() {
    if (this.isShowSearchBar) {
      this.isShowSearchBar = false;
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("search-hotel")]);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  getAvgPrice(hotel: HotelEntity) {
    if (hotel) {
      hotel.VariablesJsonObj =
        hotel.VariablesJsonObj || JSON.parse(hotel.Variables) || {};
      return hotel.VariablesJsonObj.AvgPrice;
    }
  }
  async ngOnInit() {
    const sub0 = this.route.queryParamMap.subscribe(_ => {
      this.hotelService.curViewHotel = null;
      this.isShowSearchBar = false;
      this.isLeavePage = false;
      const c = this.hotelService.getSearchHotelModel();
      if (
        this.lastCityCode !==
        (c && c.destinationCity && c.destinationCity.CityCode)
      ) {
        this.doRefresh(false);
      }
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
      }
    });
    this.subscriptions.push(sub);
    this.subscriptions.push(sub1);
    this.doRefresh();
    this.agent = await this.tmcService.getAgent();
    this.config = await this.configService.getConfigAsync();
  }
}
