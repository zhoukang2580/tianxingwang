import { AppHelper } from "./../../appHelper";
import { ConfigService } from "src/app/services/config/config.service";
import { InterHotelQueryComponent } from "./../components/inter-hotel-query/inter-hotel-query.component";
import { Router, ActivatedRoute } from "@angular/router";
import { ImageRecoverService } from "./../../services/imageRecover/imageRecover.service";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { finalize, switchMap, map, mergeMap, tap } from "rxjs/operators";
import { Subscription, fromEvent, from, interval, of } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition,
  ISearchTextValue
} from "./../international-hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ViewContainerRef,
  TemplateRef
} from "@angular/core";
import {
  IonInfiniteScroll,
  IonContent,
  IonRefresher,
  Platform,
  DomController
} from "@ionic/angular";
import {
  trigger,
  transition,
  animate,
  style,
  state
} from "@angular/animations";
import { HotelEntity } from "src/app/hotel/models/HotelEntity";
import { IRankItem } from "src/app/hotel/models/HotelQueryEntity";

@Component({
  selector: "app-international-hotel-list",
  templateUrl: "./international-hotel-list.page.html",
  styleUrls: ["./international-hotel-list.page.scss"],
  animations: [
    trigger("hide", [
      state(
        "true",
        style({ transform: "translate3d(0,-100%,0)", opacity: 1, height: "*" })
      ),
      state(
        "false",
        style({ transform: "translate3d(0,-100%,0)", opacity: 0, height: "0" })
      ),
      transition("false=>true", [
        style({ transform: "translate3d(0,0,0)", opacity: 1 }),
        animate(
          "100ms",
          style({ transform: "translate3d(0,0,0)", opacity: 1, height: "0" })
        )
      ]),
      transition(
        "true=>false",
        animate(
          "100ms",
          style({
            transform: "translate3d(0,-100%,0)",
            opacity: 1,
            height: "*"
          })
        )
      )
    ]),
    trigger("flyInOut", [
      state("true", style({ transform: "translate3d(0,0,0)", opacity: 1 })),
      state("false", style({ transform: "translate3d(100%,0,0)", opacity: 0 })),
      transition("false=>true", [
        style({ transform: "translate3d(-100%,0,0)", opacity: 1 }),
        animate("100ms", style({ transform: "translate3d(0,0,0)", opacity: 1 }))
      ]),
      transition(
        "true=>false",
        animate(
          "100ms",
          style({ transform: "translate3d(100%,0,0)", opacity: 1 })
        )
      )
    ])
  ]
})
export class InternationalHotelListPage
  implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  @ViewChild(InterHotelQueryComponent) queryComp: InterHotelQueryComponent;
  @ViewChild(IonContent) private content: IonContent;
  @ViewChild(IonInfiniteScroll) private scroller: IonInfiniteScroll;
  @ViewChild(IonRefresher) private refresher: IonRefresher;
  @ViewChild(RefresherComponent) private refresher2: RefresherComponent;
  private isDoRefresh = false;
  private oldSearchText: ISearchTextValue;
  private oldDestinationCode: string;
  isLoading = false;
  hotels: HotelEntity[];
  pageIndex = 0;
  defaultImage = "";
  searchCondition: IInterHotelSearchCondition;
  classMode: "ios" | "md";
  constructor(
    private hotelService: InternationalHotelService,
    private imageRecoverService: ImageRecoverService,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private domCtrl: DomController,
    plt: Platform
  ) {
    this.classMode = plt.is("ios") ? "ios" : "md";
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onModifyAdultCount() {
    this.router.navigate([AppHelper.getRoutePath("room-count-children")]);
  }
  ngAfterViewInit() {}
  itemHeightFn() {
    return 123;
  }
  onScrollToTop() {
    this.scrollToTop();
  }
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
  hideQueryPannel() {
    if (this.queryComp) {
      // this.queryComp.tab.label = "close";
      this.queryComp.tab.active = false;
    }
  }
  onStarPriceChange() {
    const query = { ...this.hotelService.getHotelQueryModel() };
    if (
      query &&
      query.starAndPrices &&
      query.starAndPrices.some(it => it.hasItemSelected)
    ) {
      const customeprice = query.starAndPrices.find(
        it => it.tag == "customeprice"
      );
      const starAndPrices = query.starAndPrices
        .filter(it => it.hasItemSelected)
        .filter(it => !!it);
      console.log("onStarPriceChange starAndPrices ", starAndPrices);
      const tabs = starAndPrices.filter(
        it => it.tag == "price" || it.tag == "customeprice"
      );
      if (tabs.filter(it => it.hasItemSelected).length == 0) {
        delete query.BeginPrice;
        delete query.EndPrice;
      }
      console.log("price customeprice", tabs, query);
      let { lower, upper } = tabs
        .map(tab => tab.items)
        .reduce((p, items) => {
          items
            .filter(it => it.isSelected)
            .forEach(item => {
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
      const stars = starAndPrices.find(it => it.tag == "stars");
      query.Stars = null;
      if (stars && stars.items && stars.items.some(it => it.isSelected)) {
        query.Stars = stars.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
      const types = starAndPrices.find(it => it.tag == "types");
      query.Categories = null;
      if (types && types.items && types.items.some(it => it.isSelected)) {
        query.Categories = types.items
          .filter(it => it.isSelected)
          .map(it => it.value);
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
    this.router.navigate(["international-hotel-detail"]);
  }
  async onChangeDate() {
    await this.hotelService.openCalendar();
    this.doRefresh();
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(q => {
        if (this.checkSearchTextChanged() || this.checkDestinationChanged()) {
          this.doRefresh(true);
        }
      })
    );
    this.observeSearchCondition();
    this.imageRecoverService.get().then(res => {
      if (res) {
        this.defaultImage = res.DefaultUrl;
      }
    });
    setTimeout(() => {
      this.doRefresh();
    }, 230);
  }
  onSearchText() {
    this.router.navigate(["search-by-text"]);
  }
  private checkDestinationChanged() {
    if (this.searchCondition) {
      return (
        !this.searchCondition.destinationCity ||
        this.searchCondition.destinationCity.Code != this.oldDestinationCode
      );
    }
    return false;
  }
  private checkSearchTextChanged() {
    if (this.searchCondition) {
      return (
        !this.searchCondition.searchText ||
        !this.oldSearchText ||
        this.searchCondition.searchText.Value != this.oldSearchText.Value ||
        this.searchCondition.searchText.Text != this.oldSearchText.Text
      );
    }
    return false;
  }
  onChangeCity() {
    this.router.navigate(["select-inter-city"]);
  }
  private observeSearchCondition() {
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe(cond => {
        this.searchCondition = cond;
      })
    );
  }
  private loadConfig() {
    this.configService
      .getConfigAsync()
      .then(c => {
        this.defaultImage = c.PrerenderImageUrl || c.DefaultImageUrl;
      })
      .catch(_ => null);
  }
  doRefresh(keepFilterCondition = false) {
    this.loadConfig();
    this.hotels = [];
    this.pageIndex = 0;
    this.subscription.unsubscribe();
    this.isDoRefresh = true;
    if (!keepFilterCondition) {
      this.hotelService.setSearchConditionSource({
        ...this.hotelService.getSearchCondition(),
        searchText: null
      });
      this.hotelService.setHotelQuerySource({
        ...this.hotelService.getHotelQueryModel(),
        Stars: null,
        Categories: null,
        starAndPrices: null
      });
      if (this.queryComp) {
        this.queryComp.onResetFilters();
      }
    }
    this.loadMore();
    this.scrollToTop();
  }
  onClearText(evt: CustomEvent) {
    if (evt) {
      evt.stopImmediatePropagation();
    }
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      searchText: null
    });
    this.doRefresh(true);
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  loadMore() {
    this.isLoading = this.pageIndex == 0;
    this.subscription = this.hotelService
      .getHotelList(this.pageIndex)
      .pipe(
        finalize(() => {
          this.oldSearchText = this.searchCondition.searchText;
          if (this.isDoRefresh) {
            this.completeRefresher();
          }
          this.isDoRefresh = false;
          setTimeout(() => {
            this.isLoading = false;
          }, 100);
        })
      )
      .subscribe(
        r => {
          const arr = (r && r.Data && r.Data.HotelDayPrices) || [];
          this.completeScroller();
          this.enableScroller(arr.length >= 20);
          if (arr.length) {
            this.pageIndex++;
            this.hotels = this.hotels.concat(arr.map(it => it.Hotel));
          }
        },
        e => {
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
    if (this.refresher2) {
      this.refresher2.complete();
    }
  }
  private completeScroller() {
    if (this.scroller) {
      this.scroller.complete();
    }
  }
}
