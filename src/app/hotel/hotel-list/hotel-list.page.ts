import { RecommendRankComponent } from "./../components/recommend-rank/recommend-rank.component";
import { HotelFilterComponent } from "./../components/hotel-filter/hotel-filter.component";
import { HotelStarPriceComponent } from "./../components/hotel-starprice/hotel-starprice.component";
import { HotelGeoComponent } from "./../components/hotel-geo/hotel-geo.component";
import { ScrollerComponent } from "./../../components/scroller/scroller.component";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { fadeInOut } from "./../../animations/fadeInOut";
import { flyInOut } from "./../../animations/flyInOut";
import { Storage } from "@ionic/storage";
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
  AfterContentInit,
  ElementRef,
  EventEmitter
} from "@angular/core";
import {
  IonContent,
  IonSearchbar,
  IonToolbar,
  Platform,
  IonItem,
  DomController,
  IonInfiniteScroll,
  ModalController
} from "@ionic/angular";
import { Subscription, Observable, fromEvent, merge } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { HotelDayPriceEntity } from "../models/HotelDayPriceEntity";
import { finalize } from "rxjs/operators";
import { TmcService } from "src/app/tmc/tmc.service";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { IFilterTab } from "../components/hotel-filter/hotel-filter.component";

@Component({
  selector: "app-hotel-list",
  templateUrl: "./hotel-list.page.html",
  styleUrls: ["./hotel-list.page.scss"],
  animations: [
    // flyInOut,
    fadeInOut,
    trigger("flyInOut", [
      // state("true", style({ transform: "translate3d(0,0,0)", opacity: 1 })),
      // state("false", style({ transform: "translate3d(100%,0,0)", opacity: 0 })),
      transition(":enter,false=>true", [
        style({ transform: "translate3d(-100%,0,0)", opacity: 0 }),
        animate("200ms", style({ transform: "translate3d(0,0,0)", opacity: 1 }))
      ]),
      transition(
        ":leave,true=>false",
        animate(
          "200ms",
          style({ transform: "translate3d(100%,0,0)", opacity: 1 })
        )
      )
    ]),
    trigger("fadeDown", [
      state("true", style({ transform: "translate3d(0,0,0)", opacity: 1 })),
      state(
        "false",
        style({ transform: "translate3d(0,-150%,0)", opacity: 0 })
      ),

      transition("true<=>false", [
        style({ transform: "translate3d(0,-100%,0)" }),
        animate("200ms")
      ])
    ])
  ]
})
export class HotelListPage
  implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  private subscriptions: Subscription[] = [];
  private lastCityCode = "";
  private timer;
  classMode: "ios" | "md";
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild("querytoolbar") querytoolbar: IonToolbar;
  @ViewChild("backdrop") backdropEl: ElementRef<HTMLElement>;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(HotelQueryComponent) queryComp: HotelQueryComponent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  @ViewChildren(IonItem) hotelItemEl: QueryList<any>;
  isLeavePage = false;
  searchHotelModel: SearchHotelModel;
  hotelQueryModel: HotelQueryEntity = new HotelQueryEntity();
  hotelDayPrices: HotelDayPriceEntity[] = [];
  searchSubscription = Subscription.EMPTY;
  loadDataSub = Subscription.EMPTY;
  conditionModel: HotelConditionModel;
  config: ConfigEntity;
  agent: AgentEntity;
  status: {
    isLoading: boolean;
    disabled: boolean;
  };
  filterTab = {
    label: "none",
    isActive: false
  };
  constructor(
    private hotelService: HotelService,
    private router: Router,
    private route: ActivatedRoute,
    private tmcService: TmcService,
    private configService: ConfigService,
    plt: Platform,
    private domCtrl: DomController,
    private modalCtrl: ModalController
  ) {
    this.classMode = plt.is("ios") ? "ios" : "md";
  }
  onBackdropClick(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.hideQueryPannel();
  }
  async ngAfterContentInit() {}
  async ngAfterViewInit() {
    // this.hotelItemEl.changes.subscribe(_ => {
    //   if (this.hotelDayPrices.length < 200) {
    //     console.log("加载更多");
    //     this.loadMore();
    //   }
    // });
    if (this.backdropEl && this.backdropEl.nativeElement) {
      this.subscriptions.push(
        fromEvent(this.backdropEl.nativeElement, "touchmove").subscribe(evt => {
          evt.preventDefault();
          evt.stopPropagation();
        })
      );
    }
    this.autofocusSearchBarInput();
  }
  onSearch() {
    this.doRefresh();
  }
  private getStars(hotel: HotelEntity) {
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
  onHotelQueryChange(query: HotelQueryEntity) {
    this.hotelQueryModel = {
      ...query
    };
    this.hotelDayPrices = [];
    this.doRefresh(true);
  }
  doRefresh(isKeepQueryCondition = false) {
    clearTimeout(this.timer);
    this.hideQueryPannel();
    this.status = {
      isLoading: false,
      disabled: false
    };
    if (!isKeepQueryCondition) {
      if (this.queryComp) {
        this.queryComp.onReset();
      }
      this.hotelQueryModel = new HotelQueryEntity();
      this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    }
    this.hotelQueryModel.PageIndex = 0;
    this.hotelQueryModel.PageSize = 20;
    this.hotelDayPrices = [];
    this.scrollToTop();
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    this.loadMore();
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  itemHeightFn(item: any, index: number) {
    // console.log(item);
    return 90;
  }
  loadMore() {
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.loadDataSub = this.hotelService
      .getHotelList(this.hotelQueryModel)
      .pipe(
        finalize(() => {
          this.lastCityCode =
            this.searchHotelModel &&
            this.searchHotelModel.destinationCity.CityCode;
          setTimeout(() => {
            if (this.scroller) {
              this.scroller.complete();
            }
            if (this.status) {
              this.status.isLoading = false;
            }
          }, 350);
        })
      )
      .subscribe(
        result => {
          if (this.refresher) {
            if (this.hotelQueryModel.PageIndex < 1) {
              console.log("refresher complete");
              this.refresher.disabled = true;
              setTimeout(() => {
                this.refresher.complete();
                this.refresher.disabled = !true;
              }, 300);
            }
          }
          if (result && result.Data && result.Data.HotelDayPrices) {
            const arr = result.Data.HotelDayPrices;
            if (this.scroller) {
              this.scroller.disabled =
                arr.length < (this.hotelQueryModel.PageSize || 20);
            }
            this.status.disabled =
              arr.length < (this.hotelQueryModel.PageSize || 20);
            if (arr.length) {
              this.hotelQueryModel.PageIndex++;
              this.hotelDayPrices = [
                ...this.hotelDayPrices,
                ...arr.map(it => {
                  if (it.Hotel) {
                    it.Hotel["avgPrice"] = this.getAvgPrice(it.Hotel);
                    it.Hotel["stars"] = this.getStars(it.Hotel);
                  }
                  return it;
                })
              ];
            }
            // console.log("this.scroller.disabled", this.scroller.disabled);
          }
        },
        e => {
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
    this.router.navigate([AppHelper.getRoutePath("search-hotel-bytext")]);
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
  private getAvgPrice(hotel: HotelEntity) {
    if (hotel) {
      hotel.VariablesJsonObj =
        hotel.VariablesJsonObj || JSON.parse(hotel.Variables) || {};
      return hotel.VariablesJsonObj.AvgPrice;
    }
  }
  async ngOnInit() {
    const sub0 = this.route.queryParamMap.subscribe(_ => {
      this.hideQueryPannel();
      this.hotelService.curViewHotel = null;
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

  // 条件筛选
  onActiveFilter(tab: {
    label: "位置区域" | "推荐排序" | "筛选" | "星级价格" | "none";
    isActive: boolean;
  }) {
    this.filterTab = tab || { label: "none", isActive: false };
  }

  private hideQueryPannel() {
    this.filterTab.label = "none";
    this.filterTab.isActive = false;
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
      this.hideQueryPannel();
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
    this.doRefresh(true);
  }
  onFilterGeo() {
    const query = this.hotelService.getHotelQueryModel();
    query.searchGeoId = "";
    if (query && query.locationAreas) {
      query.Geos = query.Geos || [];
      const geoTabs = query.locationAreas.filter(tab => tab.hasFilterItem);
      console.log("geo 搜索", geoTabs);
      if (geoTabs.length) {
        const metroIds = [];
        geoTabs.forEach(tab => {
          tab.items.forEach(item => {
            if (item.items && item.items.length) {
              // level 3
              item.items.forEach(t => {
                if (t.isSelected) {
                  if (tab.tag == "Metro") {
                    let selectedId;
                    if (tab.items) {
                      tab.items.forEach(third => {
                        if (third.items) {
                          third.items.forEach(m => {
                            if (m.isSelected) {
                              selectedId = m.id;
                            }
                            metroIds.push(m.id);
                          });
                        }
                      });
                      query.searchGeoId = selectedId || "";
                    }
                  }
                  if (query.Geos.length) {
                    if (metroIds.length) {
                      // 移除已经选择过的地铁站
                      query.Geos = query.Geos.filter(
                        it => !metroIds.some(md => md == it)
                      );
                    }
                  }
                  query.Geos.push(t.id);
                }
              });
            } else {
              // level 2
              if (item.isSelected) {
                query.Geos.push(item.id);
              }
            }
          });
        });
      }
      if (query.Geos && query.Geos.length && !query.searchGeoId) {
        query.searchGeoId = query.Geos[0];
      }
      this.hotelService.setHotelQuerySource(query);
      this.hideQueryPannel();
      this.doRefresh(true);
    }
  }
  onFilter() {
    const query = this.hotelService.getHotelQueryModel();
    if (!query.filters || !query.filters.some(it => it.hasFilterItem)) {
      query.Themes = null;
      query.Brands = null;
      query.Services = null;
      query.Facilities = null;
      this.doRefresh(true);
      return;
    }
    const filter: IFilterTab<any>[] = query.filters.filter(
      it => it.hasFilterItem
    );
    const theme = filter.find(it => it.tag == "Theme");
    const brand = filter.find(it => it.tag == "Brand");
    const services = filter.find(it => it.tag == "Service");
    const facility = filter.find(it => it.tag == "Facility");
    if (theme) {
      query.Themes = [];
      const themes =
        theme.items &&
        theme.items.filter(it => it.items && it.items.some(k => k.IsSelected));
      if (themes) {
        themes.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Themes.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (brand) {
      query.Brands = [];
      const brands =
        brand.items &&
        brand.items.filter(it => it.items && it.items.some(k => k.IsSelected));
      if (brands) {
        brands.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Brands.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (services) {
      query.Services = [];
      const s =
        services.items &&
        services.items.filter(
          it => it.items && it.items.some(k => k.IsSelected)
        );
      if (s) {
        s.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Services.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (facility) {
      query.Facilities = [];
      const facilities =
        facility.items &&
        facility.items.filter(
          it => it.items && it.items.some(k => k.IsSelected)
        );
      if (facilities) {
        facilities.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Facilities.push(k.Id);
              }
            });
          }
        });
      }
    }
    this.hotelService.setHotelQuerySource(query);
    this.doRefresh(true);
  }
  onRank() {
    const query = this.hotelService.getHotelQueryModel();
    if (query && query.ranks) {
      const tab = query.ranks.find(it => it.isSelected);
      query.Orderby = tab.orderBy;
      this.hotelService.setHotelQuerySource(query);
      this.doRefresh(true);
    }
  }
  private async checkAndOpenModal(tab: {
    label: "位置区域" | "推荐排序" | "筛选" | "星级价格" | "none";
    isActive: boolean;
  }) {
    if (tab.label == "位置区域") {
      const m = await this.modalCtrl.create({
        component: HotelGeoComponent,
        backdropDismiss: false,
        cssClass: "domestic-hotel-filter-condition"
      });
      m.present();
      const result = await m.onDidDismiss();
      this.onFilterGeo();
    }
    if (tab.label == "星级价格") {
      const m = await this.modalCtrl.create({
        component: HotelStarPriceComponent,
        backdropDismiss: false,
        cssClass: "domestic-hotel-filter-condition"
      });
      m.present();
      await m.onDidDismiss();
      this.onStarPriceChange();
    }
    if (tab.label == "筛选") {
      const m = await this.modalCtrl.create({
        component: HotelFilterComponent,
        backdropDismiss: false,
        cssClass: "domestic-hotel-filter-condition"
      });
      m.present();
      await m.onDidDismiss();
      this.onFilter();
    }
    if (tab.label == "推荐排序") {
      const m = await this.modalCtrl.create({
        component: RecommendRankComponent,
        backdropDismiss: false,
        cssClass: "domestic-hotel-filter-condition"
      });
      m.present();
      await m.onDidDismiss();
      this.onRank();
    }
  }
  // 条件筛选 end
}
