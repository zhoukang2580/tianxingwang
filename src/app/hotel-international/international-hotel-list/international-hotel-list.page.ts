import { LangService } from "src/app/services/lang.service";
import { fadeInOut } from "./../../animations/fadeInOut";
import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { AppHelper } from "./../../appHelper";
import { ConfigService } from "src/app/services/config/config.service";
import {
  InterHotelQueryComponent,
  IInterHotelQueryTab,
} from "./../components/inter-hotel-query/inter-hotel-query.component";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { ImageRecoverService } from "./../../services/imageRecover/imageRecover.service";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import {
  finalize,
  switchMap,
  map,
  mergeMap,
  tap,
  filter,
} from "rxjs/operators";
import { Subscription, fromEvent, from, interval, of } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition,
  ISearchTextValue,
} from "./../international-hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ViewContainerRef,
  TemplateRef,
} from "@angular/core";
import {
  IonInfiniteScroll,
  IonContent,
  IonRefresher,
  Platform,
  DomController,
} from "@ionic/angular";
import {
  trigger,
  transition,
  animate,
  style,
  state,
} from "@angular/animations";
import { HotelEntity } from "src/app/hotel/models/HotelEntity";
import { IRankItem } from "src/app/hotel/models/HotelQueryEntity";
import { PinFabComponent } from "src/app/components/pin-fab/pin-fab.component";
import { ConfigEntity } from "src/app/services/config/config.entity";

@Component({
  selector: "app-international-hotel-list",
  templateUrl: "./international-hotel-list.page.html",
  styleUrls: ["./international-hotel-list.page.scss"],
  animations: [
    fadeInOut,
    trigger("queryPanelShowHide", [
      state(
        "true",
        style({
          willChange: "auto",
          transform: "translate3d(0,0,0)",
          opacity: 1,
          zIndex: 100,
        })
      ),
      state(
        "false",
        style({
          willChange: "auto",
          transform: "translate3d(0,200%,0)",
          opacity: 0,
          zIndex: -100,
        })
      ),
      transition("false=>true", [
        style({ zIndex: 1, willChange: "transform,opacity" }),
        animate(
          "200ms",
          style({ transform: "translate3d(0,0,0)", opacity: 1 })
        ),
      ]),
      transition(
        "true=>false",
        animate(
          "100ms",
          style({
            willChange: "transform,opacity",
            transform: "translate3d(0,200%,0)",
            opacity: 0,
          })
        )
      ),
    ]),
  ],
})
export class InternationalHotelListPage
  implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(InterHotelQueryComponent)
  private queryComp: InterHotelQueryComponent;
  @ViewChild(IonContent) private content: IonContent;
  @ViewChild(IonInfiniteScroll) private scroller: IonInfiniteScroll;
  @ViewChild(RefresherComponent) private refresher: RefresherComponent;
  @ViewChild(PinFabComponent) pinFabComp: PinFabComponent;
  private isSearchByText = false;
  private oldDestinationCode: string;
  isShowBackDrop = false;
  filterTab: IInterHotelQueryTab;
  isLoading = false;
  hotels: HotelEntity[];
  pageIndex = 0;
  defaultImage = "";
  loadingImage = "";
  searchCondition: IInterHotelSearchCondition;
  classMode: "ios" | "md";
  totalHotels = 0;
  config: ConfigEntity;
  isEn = false;
  HotelDefaltImg: string;
  RoomDefaultImg: string;
  constructor(
    public hotelService: InternationalHotelService,
    private imageRecoverService: ImageRecoverService,
    public router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private plt: Platform,
    private langService: LangService
  ) {
    this.classMode = plt.is("ios") ? "ios" : "md";
    this.isEn = this.langService.isEn;
  }
  back(evt?: CustomEvent) {
    this.hideQueryPannel();
    setTimeout(() => {
      this.backBtn.popToPrePage(evt);
    }, 300);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onModifyAdultCount() {
    this.router.navigate([AppHelper.getRoutePath("room-count-children")]);
  }
  ngAfterViewInit() {}
  onRank(r: IRankItem) {
    const hotelQuery = this.hotelService.getHotelQueryModel();
    if (r) {
      if (hotelQuery) {
        hotelQuery.Orderby = r.orderBy;
        this.hotelService.setHotelQuerySource(hotelQuery);
        this.onQueryFilter();
      }
    }
  }
  onShowPanel(tab: IInterHotelQueryTab) {
    this.filterTab = tab;
    if (tab && tab.active) {
    }
    this.scrollToTop();
  }
  onQueryPanelShowHideEnd() {
    this.isShowBackDrop = this.filterTab && this.filterTab.active;
  }
  hideQueryPannel() {
    if (this.filterTab) {
      this.filterTab.active = false;
    }
    this.isShowBackDrop = false;
  }
  onStarPriceChange() {
    const query = { ...this.hotelService.getHotelQueryModel() };
    if (
      query &&
      query.starAndPrices &&
      query.starAndPrices.some((it) => it.hasItemSelected)
    ) {
      const customeprice = query.starAndPrices.find(
        (it) => it.tag == "customeprice"
      );
      const starAndPrices = query.starAndPrices
        .filter((it) => it.hasItemSelected)
        .filter((it) => !!it);
      console.log("onStarPriceChange starAndPrices ", starAndPrices);
      const tabs = starAndPrices.filter(
        (it) => it.tag == "price" || it.tag == "customeprice"
      );
      if (tabs.filter((it) => it.hasItemSelected).length == 0) {
        delete query.BeginPrice;
        delete query.EndPrice;
      }
      console.log("price customeprice", tabs, query);
      let { lower, upper } = tabs
        .map((tab) => tab.items)
        .reduce((p, items) => {
          items
            .filter((it) => it.isSelected)
            .forEach((item) => {
              p.lower = Math.min(item.minPrice, p.lower) || item.minPrice;
              p.upper = Math.max(item.maxPrice, p.upper) || item.maxPrice;
            });
          return p;
        }, {} as { lower: number; upper: number });
      if (customeprice && customeprice.hasItemSelected) {
        upper = customeprice.items[0].maxPrice;
        lower = customeprice.items[0].minPrice;
      }
      console.log("价格：", lower, upper);
      if (lower == 0 || lower) {
        query.BeginPrice = lower + "";
      }
      if (upper) {
        query.EndPrice = upper == Infinity ? "10000000" : `${upper}`;
      }
      const stars = starAndPrices.find((it) => it.tag == "stars");
      query.Stars = null;
      if (stars && stars.items && stars.items.some((it) => it.isSelected)) {
        query.Stars = stars.items
          .filter((it) => it.isSelected)
          .map((it) => it.value);
      }
      const types = starAndPrices.find((it) => it.tag == "types");
      query.Categories = null;
      if (types && types.items && types.items.some((it) => it.isSelected)) {
        query.Categories = types.items
          .filter((it) => it.isSelected)
          .map((it) => it.value);
      }
    } else {
      query.Stars = null;
      query.Categories = null;
    }
    this.hotelService.setHotelQuerySource(query);
    this.onQueryFilter();
  }
  onQueryFilter() {
    this.hideQueryPannel();
    this.doRefresh(true);
  }
  onViewHotel(hotel: HotelEntity) {
    this.hotelService.viewHotel = hotel;
    this.langService.isCn
      ? this.router.navigate(["international-hotel-detail"])
      : this.router.navigate(["international-hotel-detail_en"]);
  }
  async onChangeDate() {
    await this.hotelService.openCalendar();
    this.doRefresh();
  }
  ngOnInit() {
    this.subscriptions.push(
      this.configService.getConfigSource().subscribe((c) => {
        this.config = c;
      })
    );
    this.subscriptions.push(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationStart))
        .subscribe(() => {
          this.hideQueryPannel();
        })
    );
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((q) => {
        const isRefresh =
          this.checkSearchTextChanged() ||
          this.checkDestinationChanged() ||
          !this.hotels ||
          !this.hotels.length;
        if (isRefresh) {
          setTimeout(
            () => {
              if (!this.isLoading) {
                this.doRefresh(true);
              }
            },
            this.plt.is("ios") ? 300 : 200
          );
        }
      })
    );
    this.observeSearchCondition();
  }
  onSearchText() {
    this.isSearchByText = true;
    this.router.navigate(["combo-search-inter-hotel"]);
  }
  private checkDestinationChanged() {
    if (this.searchCondition) {
      return (
        (this.searchCondition.destinationCity &&
          this.searchCondition.destinationCity.Code) != this.oldDestinationCode
      );
    }
    return false;
  }
  private checkSearchTextChanged() {
    // if (this.searchCondition) {
    //   return (
    //     !this.searchCondition.searchText ||
    //     !this.oldSearchText ||
    //     this.searchCondition.searchText.Value != this.oldSearchText.Value ||
    //     this.searchCondition.searchText.Text != this.oldSearchText.Text
    //   );
    // }
    return this.isSearchByText;
  }
  onChangeCity() {
    this.router.navigate(["select-inter-city"]);
  }
  private observeSearchCondition() {
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe((cond) => {
        this.searchCondition = cond;
      })
    );
  }
  private loadConfig() {
    this.configService
      .getConfigAsync()
      .then((c) => {
        this.defaultImage = c.PrerenderImageUrl || c.DefaultImageUrl;
      })
      .catch((_) => null);
  }
  doRefresh(keepFilterCondition = false) {
    this.loadConfig();
    this.hotels = [];
    this.pageIndex = 0;
    this.subscription.unsubscribe();
    this.totalHotels = 0;
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    if (!keepFilterCondition) {
      this.hotelService.setSearchConditionSource({
        ...this.hotelService.getSearchCondition(),
        searchText: null,
      });
      this.hotelService.setHotelQuerySource({
        ...this.hotelService.getHotelQueryModel(),
        Stars: null,
        Categories: null,
        starAndPrices: null,
      });
      if (this.queryComp) {
        this.queryComp.onResetFilters();
      }
    }
    this.completeRefresher();
    this.loadMore();
    this.scrollToTop();
  }
  onClearText(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      searchText: null,
    });
    this.doRefresh(true);
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(60).then(() => {
        if (this.pinFabComp) {
          this.pinFabComp.hide = true;
        }
      });
    }
  }
  loadMore() {
    this.isLoading = this.pageIndex == 0;
    this.subscription = this.hotelService
      .getHotelList(this.pageIndex)
      .pipe(
        finalize(() => {
          this.RoomDefaultImg = this.hotelService.RoomDefaultImg;
          this.HotelDefaltImg = this.hotelService.HotelDefaultImg;
          this.isLoading = false;
          this.isSearchByText = false;
          this.completeScroller();
        })
      )
      .subscribe(
        (r) => {
          this.oldDestinationCode =
            this.searchCondition.destinationCity &&
            this.searchCondition.destinationCity.Code;
          this.totalHotels = r && r.Data && r.Data.DataCount;
          const arr = (r && r.Data && r.Data.HotelDayPrices) || [];
          this.enableScroller(arr.length >= 20);
          if (arr.length) {
            this.pageIndex++;
            this.hotels = this.hotels.concat(
              arr.map((it) => {
                const sumary =
                  it.Hotel.HotelSummaries &&
                  it.Hotel.HotelSummaries.find(
                    (o) =>
                      (o.Tag || "").toLowerCase() == "name" && o.Lang == "en"
                  );
                const addrSumary =
                  it.Hotel.HotelSummaries &&
                  it.Hotel.HotelSummaries.find(
                    (o) =>
                      (o.Tag || "").toLowerCase() == "Address" && o.Lang == "en"
                  );
                if (it.Hotel && sumary && this.isEn) {
                  it.Hotel.EnName = sumary.Content;
                }
                if (it.Hotel && addrSumary && this.isEn) {
                  it.Hotel.EnAddress = addrSumary.Content;
                }
                return it.Hotel;
              })
            );
          }
        },
        (e) => {
          this.enableScroller(false);
        }
      );
  }
  private enableScroller(enabled: boolean) {
    if (this.scroller) {
      this.scroller.disabled = !enabled;
    }
  }
  private completeRefresher() {
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  private completeScroller() {
    if (this.scroller) {
      this.scroller.complete();
    }
  }
}
