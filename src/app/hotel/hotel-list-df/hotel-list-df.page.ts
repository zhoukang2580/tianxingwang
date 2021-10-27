import { PinFabComponent } from "./../../components/pin-fab/pin-fab.component";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { AgentEntity } from "./../../tmc/models/AgentEntity";
import { ConfigEntity } from "./../../services/config/config.entity";
import { ConfigService } from "./../../services/config/config.service";
import { HotelConditionModel } from "src/app/hotel/models/ConditionModel";
import { HotelEntity } from "./../models/HotelEntity";
import {
  HotelQueryComponent,
  IHotelQueryCompTab,
} from "./../components/hotel-query/hotel-query.component";
import { HotelQueryEntity, IFilterTab } from "./../models/HotelQueryEntity";
import { Router, ActivatedRoute } from "@angular/router";
import { HotelService, SearchHotelModel } from "./../hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ElementRef,
} from "@angular/core";
import {
  IonContent,
  IonSearchbar,
  IonToolbar,
  Platform,
  IonItem,
  IonInfiniteScroll,
  ModalController,
  IonHeader,
} from "@ionic/angular";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { HotelDayPriceEntity } from "../models/HotelDayPriceEntity";
import { finalize } from "rxjs/operators";
import { TmcService } from "src/app/tmc/tmc.service";

import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { HrService } from "src/app/hr/hr.service";
import { ShowFreebookTipComponent } from "../components/show-freebook-tip/show-freebook-tip.component";
import { HotelCityService } from "../hotel-city.service";
import { ThemeService } from "src/app/services/theme/theme.service";
interface ISearchTextValue {
  Text: string;
  Value?: string; // Code
  Id?: string; // Code
  CityName?: string; // Code
  CountryEnName?: string;
  CountryId?: string; // Code
  CountryName?: string; // Code
  CountryCode?: string; // Code
}
@Component({
  selector: "app-hotel-list-df",
  templateUrl: "./hotel-list-df.page.html",
  styleUrls: ["./hotel-list-df.page.scss"],
  animations: [],
})
export class HotelListDfPage implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private isUseSearchText = false;
  private oldDestinationCode: string;
  @ViewChild(IonHeader) headerEl: IonHeader;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild("querytoolbar") querytoolbar: IonToolbar;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(HotelQueryComponent) queryComp: HotelQueryComponent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  @ViewChild("filterCondition") filterCondition: ElementRef<HTMLElement>;
  @ViewChildren(IonItem) hotelItemEl: QueryList<any>;
  @ViewChild(PinFabComponent) pinFabComp: PinFabComponent;
  isLeavePage = false;
  isLoadingHotels = false;
  isFreeBook = false;
  searchHotelModel: SearchHotelModel;
  hotelQueryModel: HotelQueryEntity;
  hotelDayPrices: HotelDayPriceEntity[] = [];
  searchSubscription = Subscription.EMPTY;
  loadDataSub = Subscription.EMPTY;
  conditionModel: HotelConditionModel;
  config: ConfigEntity;
  agent: AgentEntity;
  isIos = false;
  isInitTop = false;
  RoomDefaultImg: string;
  HotelDefaltImg: string;
  hotelType = [
    {
      value: "normal",
      lable: "非协议酒店",
      isshow: false,
    },
    {
      value: "agreement",
      lable: "协议酒店",
      isshow: false,
    },
    {
      value: "specialprice",
      lable: "特价酒店",
      isshow: false,
    },
  ];
  filterTab: IHotelQueryCompTab;
  isShowBackdrop = false;
  totalHotels = 0;
  constructor(
    private hotelService: HotelService,
    private router: Router,
    private route: ActivatedRoute,
    private tmcService: TmcService,
    private staffService: HrService,
    private configService: ConfigService,
    private hotelCityService: HotelCityService,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
    plt: Platform
  ) {
    this.filterTab = {
      isActive: false,
      label: "",
    } as any;
    this.isIos = plt.is("ios");
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }
  onBackdropClick(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.hideQueryPannel();
  }
  async onShowFreeBookTip(evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    const m = await AppHelper.modalController.create({
      component: ShowFreebookTipComponent,
    });
    m.present();
  }
  onSegmentChanged(ev: any) {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      hotelType: ev,
    });
    this.hotelDayPrices = [];
    this.doRefresh();
  }
  ngAfterViewInit() {
    this.autofocusSearchBarInput();
    // this.setQueryConditionEleTop();
    // setTimeout(() => {
    //   try {
    //     this.initTop();
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }, 1000);
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
      const sub = this.searchbarEls.changes.subscribe((_) => {
        if (this.searchbarEls.first) {
          this.searchbarEls.first.getInputElement().then((input) => {
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
      ...query,
    };
    this.hotelDayPrices = [];
    this.doRefresh(this.checkDestinationChanged());
  }
  doRefresh(isKeepQueryCondition = false) {
    this.tmcService.getTmc().then(async (tmc) => {
      try {
        const isSelf = await this.staffService.isSelfBookType();
        this.isFreeBook =
          tmc &&
          tmc["HotelSelfPayAmount"] == "1" &&
          isSelf &&
          !this.tmcService.isAgent;
      } catch (e) {
        console.error(e);
      }
    });
    this.hideQueryPannel();
    if (!isKeepQueryCondition) {
      if (this.queryComp) {
        this.queryComp.onReset();
      }
      this.searchHotelModel.searchText = null;
      this.hotelQueryModel = new HotelQueryEntity();
      this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    }
    this.hotelQueryModel.PageIndex = 0;
    this.hotelQueryModel.PageSize = 20;
    if(this.searchHotelModel&&this.searchHotelModel.myPosition){
      this.hotelQueryModel.Lat=this.searchHotelModel.myPosition.Lat;
      this.hotelQueryModel.Lng=this.searchHotelModel.myPosition.Lng;
    }
    this.hotelDayPrices = [];
    this.totalHotels = 0;
    this.scrollToTop();
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    this.loadMore();
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
  itemHeightFn() {
    // console.log(item);
    return 90;
  }
  loadMore() {
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.isLoadingHotels = this.hotelQueryModel.PageIndex < 1;
    this.loadDataSub = this.hotelService
      .getHotelList(this.hotelQueryModel)
      .pipe(
        finalize(() => {
          this.RoomDefaultImg = this.hotelService.RoomDefaultImg;
          this.HotelDefaltImg = this.hotelService.HotelDefaultImg;
          setTimeout(() => {
            this.isLoadingHotels = false;
            this.isUseSearchText = false;
            if (this.scroller) {
              this.scroller.complete();
            }
          }, 200);
        })
      )
      .subscribe(
        (result) => {
          // this.oldSearchText = this.searchHotelModel.searchText;
          this.oldDestinationCode =
            this.searchHotelModel.destinationCity &&
            this.searchHotelModel.destinationCity.Code;
          if (this.refresher) {
            if (this.hotelQueryModel.PageIndex < 1) {
              console.log("refresher complete");
              this.refresher.disabled = true;
              setTimeout(() => {
                this.refresher.complete();
                this.refresher.disabled = !true;
              }, 200);
            }
          }
          if (result && result.Data && result.Data.HotelDayPrices) {
            if (this.hotelQueryModel && this.hotelQueryModel.PageIndex == 0) {
              this.totalHotels = result.Data.DataCount; // 总数
            }
            const arr = result.Data.HotelDayPrices;
            if (this.scroller) {
              this.scroller.disabled =
                arr.length < (this.hotelQueryModel.PageSize || 20);
            }
            if (arr.length) {
              this.hotelQueryModel.PageIndex++;
              this.hotelDayPrices = [
                ...this.hotelDayPrices,
                ...arr.map((it) => {
                  if (it.Hotel) {
                    it.Hotel["avgPrice"] = this.getAvgPrice(it.Hotel);
                    it.Hotel["stars"] = this.getStars(it.Hotel);
                  }
                  return it;
                }),
              ];
            }
            // console.log("this.scroller.disabled", this.scroller.disabled);
          }
        },
        (e) => {
          this.refresher.complete();
          console.error(e);
        }
      );
  }
  onTypeChanged(h: any) {
    console.log(h.value, "value");
    if (h) {
      h.isshow = !h.isshow;
      this.hotelType.forEach((t) => {
        if (t != h) {
          t.isshow = false;
        }
        return t;
      });
    }
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      hotelType: h.value,
    });
    this.doRefresh();
  }
  async onDateChange() {
    const days = await this.hotelService.openCalendar({});
    if (days.length) {
      this.hotelQueryModel.BeginDate = days[0].date;
      this.hotelQueryModel.EndDate = days[days.length - 1].date;
      console.log(this.hotelQueryModel.EndDate, "this.hotelQueryModel.EndDate");
      this.doRefresh();
    }
  }
  goToDetail(item: HotelDayPriceEntity) {
    // this.hotelService.curViewHotel = { ...item };
    if (item.Hotel) {
      this.router.navigate([AppHelper.getRoutePath("hotel-detail")], {
        queryParams: { hotelId: item.Hotel.Id, hotelprice: item.AvgPrice },
      });
    }
  }
  async onCityClick() {
    // this.router.navigate([AppHelper.getRoutePath("hotel-city")]);
    const rs = await this.hotelCityService.onSelectCity(true, true);
    if (rs && rs.city) {
      const oldMyPos={...this.hotelService.getSearchHotelModel().myPosition};
      this.hotelService.setSearchHotelModel({
        ...this.searchHotelModel,
        destinationCity: rs.city,
        myPosition:null
      });
      if (this.checkDestinationChanged()||(oldMyPos.Lat||oldMyPos.Lng)) {
        this.doRefresh();
      }
    }
  }
  onSearchByText() {
    this.isUseSearchText = true;
    this.router.navigate([AppHelper.getRoutePath("hotel-searchtext")], {
      queryParams: {
        kw:
          (this.searchHotelModel.searchText &&
            this.searchHotelModel.searchText.Text) ||
          "",
      },
    });
  }
  private checkDestinationChanged() {
    if (this.searchHotelModel) {
      return (
        !this.searchHotelModel.destinationCity ||
        this.searchHotelModel.destinationCity.Code != this.oldDestinationCode
      );
    }
    return false;
  }
  private checkSearchTextChanged() {
    // if (this.searchHotelModel) {
    //   return (
    //     this.searchHotelModel.searchText &&
    //     this.oldSearchText &&
    //     (this.searchHotelModel.searchText.Value != this.oldSearchText.Value ||
    //       this.searchHotelModel.searchText.Text != this.oldSearchText.Text)
    //   );
    // }
    return this.isUseSearchText;
  }
  back() {
    this.hideQueryPannel();
    setTimeout(() => {
      this.backbtn.popToPrePage();
    }, 200);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
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
    this.subscriptions.push(
      this.hotelService.getHotelQuerySource().subscribe((query) => {
        this.hotelQueryModel = query;
      })
    );
    const sub0 = this.route.queryParamMap.subscribe((_) => {
      this.hideQueryPannel();
      if (this.checkDestinationChanged()) {
        this.searchHotelModel.searchText = null;
      }
      this.isLeavePage = false;
      const isrefresh =
        this.checkSearchTextChanged() ||
        this.checkDestinationChanged() ||
        !this.hotelDayPrices ||
        !this.hotelDayPrices.length;
      if (isrefresh) {
        this.doRefresh(true);
      }
    });
    this.subscriptions.push(sub0);
    const sub = this.hotelService.getConditionModelSource().subscribe((c) => {
      this.conditionModel = c;
    });
    const sub1 = this.hotelService
      .getSearchHotelModelSource()
      .subscribe((m) => {
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
          this.hotelType.forEach((t) => {
            if (t.value == m.hotelType.toLowerCase()) {
              t.isshow = true;
            }
            return t;
          });
        }
      });
    this.subscriptions.push(sub);
    this.subscriptions.push(sub1);
    // setTimeout(() => {
    //   this.doRefresh();
    // }, 500);
    this.agent = await this.tmcService.getAgent();
    this.config = await this.configService.getConfigAsync();
  }
  private hideQueryPannel() {
    if (this.queryComp) {
      this.queryComp.queryTabComps.forEach((tab) => {
        tab.isActive = false;
      });
      this.filterTab.isActive = false;
      this.onActiveFilter(this.filterTab);
    }
  }
  onActiveFilter(tab: IHotelQueryCompTab) {
    this.filterTab = tab;
    // if (this.hotelDayPrices && this.hotelDayPrices.length > 2 * 20) {
    //   this.hotelDayPrices = this.hotelDayPrices.slice(0, 20);
    //   this.hotelQueryModel.PageIndex = 1;
    //   if (this.scroller) {
    //     this.scroller.disabled = false;
    //   }
    // }
    this.initTop();
    if (this.content) {
      this.content.scrollToTop(100);
    }
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
  }
  private initTop() {
    try {
      const arr = this.filterCondition.nativeElement.querySelectorAll(
        ".filter-condition"
      );
      const h = this.headerEle["el"].getBoundingClientRect().height;
      if (!h || h < 4.5 * 16 || this.isInitTop) {
        return;
      }
      this.isInitTop = true;
      for (let i = 0; i < arr.length; i++) {
        const el: HTMLElement = arr[i] as any;
        el.style.top = `${h}px`;
      }
    } catch (e) {
      console.error(e);
    }
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
      this.hideQueryPannel();
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
    this.doRefresh(true);
  }
  onFilterGeo() {
    const query = this.hotelService.getHotelQueryModel();
    query.searchGeoId = "";
    if (query && query.locationAreas) {
      query.Geos = query.Geos || [];
      const geoTabs = query.locationAreas.filter((tab) => tab.hasFilterItem);
      console.log("geo 搜索", geoTabs);
      if (geoTabs.length) {
        const metroIds = [];
        geoTabs.forEach((tab) => {
          tab.items.forEach((item) => {
            if (item.items && item.items.length) {
              // level 3
              item.items.forEach((t) => {
                if (t.isSelected) {
                  if (tab.tag == "Metro") {
                    let selectedId;
                    if (tab.items) {
                      tab.items.forEach((third) => {
                        if (third.items) {
                          third.items.forEach((m) => {
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
                        (it) => !metroIds.some((md) => md == it)
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
    if (!query.filters || !query.filters.some((it) => it.hasFilterItem)) {
      query.Themes = null;
      query.Brands = null;
      query.Services = null;
      query.Facilities = null;
      this.doRefresh(true);
      return;
    }
    const filter: IFilterTab<any>[] = query.filters.filter(
      (it) => it.hasFilterItem
    );
    const theme = filter.find((it) => it.tag == "Theme");
    const brand = filter.find((it) => it.tag == "Brand");
    const services = filter.find((it) => it.tag == "Service");
    const facility = filter.find((it) => it.tag == "Facility");
    if (theme) {
      query.Themes = [];
      const themes =
        theme.items &&
        theme.items.filter(
          (it) => it.items && it.items.some((k) => k.IsSelected)
        );
      if (themes) {
        themes.forEach((t) => {
          if (t.items) {
            t.items.forEach((k) => {
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
        brand.items.filter(
          (it) => it.items && it.items.some((k) => k.IsSelected)
        );
      if (brands) {
        brands.forEach((t) => {
          if (t.items) {
            t.items.forEach((k) => {
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
          (it) => it.items && it.items.some((k) => k.IsSelected)
        );
      if (s) {
        s.forEach((t) => {
          if (t.items) {
            t.items.forEach((k) => {
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
          (it) => it.items && it.items.some((k) => k.IsSelected)
        );
      if (facilities) {
        facilities.forEach((t) => {
          if (t.items) {
            t.items.forEach((k) => {
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
    console.log("onRank ", query);
    this.doRefresh(true);
  }
  // 条件筛选 end
}
