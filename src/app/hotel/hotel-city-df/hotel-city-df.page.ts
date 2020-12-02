import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { RefresherComponent } from "src/app/components/refresher";
import { ActivatedRoute, Router } from "@angular/router";
import { HotelService } from "./../hotel.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ViewChildren,
  QueryList,
  ElementRef,
} from "@angular/core";
import { NavController, IonInfiniteScroll, IonSearchbar, IonList, IonItemDivider, IonHeader, IonContent } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { LangService } from "src/app/services/lang.service";
import { AppHelper } from 'src/app/appHelper';
const HISTORY_HOTEL_CITIES = "history_hotel_cities";
@Component({
  selector: "app-hotel-city-df",
  templateUrl: "./hotel-city-df.page.html",
  styleUrls: ["./hotel-city-df.page.scss"],
})
export class HotelCityDfPage implements OnInit, AfterViewInit, OnDestroy {
  private selectedCity: TrafficlineEntity;
  private subscriptions: Subscription[] = [];
  private pageIndex = 0;
  private pageSize = 20;
  private searchKeys = [
    "Name",
    "Nickname",
    "Pinyin",
    "Initial",
    "FirstLetter",
    "CityName",
  ];
  cities: TrafficlineEntity[];
  hotCities: TrafficlineEntity[];
  historyCities: TrafficlineEntity[];
  vmCities: TrafficlineEntity[] = [];
  letters: any[];
  cityName: any[];
  letterCitiesMap: { [key: string]: TrafficlineEntity[] };
  vmKeyword = "";
  isLoading = false;
  isSelect = true;
  history: any;
  ishistory: boolean;
  touch: {};
  firstTouch: any;
  filteredTotalCount = 0;
  isEn = false;
  isHot = false;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(IonContent, { static: true }) ionContent: IonContent;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChildren("letter") letterEles: QueryList<IonItemDivider>;
  constructor(
    public router: Router,
    private hotelService: HotelService,
    private storage: Storage,
    route: ActivatedRoute,
    private ngZone: NgZone,
    private navCtrl: NavController,
    langService: LangService
  ) {
    this.subscriptions.push(route.queryParamMap.subscribe((_) => { }));
    this.isEn = langService.isEn;
  }
  back() {
    this.navCtrl.back();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  private async initHistoryCity() {
    if (!this.historyCities || !this.historyCities.length) {
      this.historyCities = await this.storage.get(HISTORY_HOTEL_CITIES);
    }
  }

  private initLetterCitiesMap() {
    this.letterCitiesMap = {};
    if (this.cities && this.cities.length) {
      this.cities.forEach(c => {
        const citieLetter =  this.letterCitiesMap[c.FirstLetter];
        console.log(citieLetter);
        if (citieLetter) {
          const city = citieLetter.find(it => it.Code == c.Code);
          if (!city) {
            citieLetter.push(c);
          }
        } else {
          this.letterCitiesMap[c.FirstLetter] = [c];
        }
      });
    }
    this.letters = Object.keys(this.letterCitiesMap).sort();
    console.log('letter', this.letterCitiesMap, this.letters, this.cityName);
  }

  onletter(item) {
    try {
      const arr = this.letterEles.toArray();
      const ele = arr.find(it => it['el'].getAttribute("letter") == item);
      const rect = ele['el'].getBoundingClientRect();
      const headerEle = this.headerEle['el'].clientHeight;
      console.log(item, rect, rect.top, rect.height, headerEle);
      let y = 0;
      y = rect.top - headerEle;
      this.ionContent.scrollByPoint(0, y, 200);
    } catch (e) {
      console.error(e);
    }
  }


  onShowHistory() {
    let his = this.historyCities;
    his = Array.from(new Set(his));
    this.vmCities = his;
    console.log(this.historyCities);
    this.scroller.disabled = true;
  }
  onShowHot() {
    this.isHot = true;
    this.isLoading = true;
    // this.historyCities = [];
    this.hotCities = [];
    this.vmCities = [];
    this.pageIndex = 0;
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.loadMore((this.vmKeyword || "").trim());
    this.scroller.disabled = true;
  }
  async onSelect(city: TrafficlineEntity) {
    console.log(this.vmCities, this.historyCities, this.hotCities);
    if (city) {
      this.selectedCity = city;
      if (this.vmCities) {
        this.vmCities.forEach((s) => {
          s.Selected = city.Code == s.Code;
        });
      }
      if (this.hotCities) {
        this.hotCities.forEach((s) => {
          s.Selected = city.Code == s.Code;
        });
      }
      if (this.historyCities) {
        this.historyCities.forEach((s) => {
          s.Selected = city.Code == s.Code;
        });
      }
      if (this.cities) {
        this.cities.forEach((s) => {
          s.Selected = city.Code == s.Code;
        });
      }
      city.Selected = true;
      const old = this.hotelService.getSearchHotelModel();
      const oldCode =
        old && old.destinationCity && old.destinationCity.CityCode;
      const query = this.hotelService.getHotelQueryModel();
      this.hotelService.setSearchHotelModel({
        ...old,
        destinationCity: city,
      });
      query.locationAreas = null;
      this.hotelService.setHotelQuerySource(query);
      this.historyCities = this.historyCities || [];
      this.historyCities.unshift(city);
      this.cacheHistories(this.historyCities);
      if (oldCode != city.CityCode) {
        await this.hotelService.getConditions(true);
      }
    }
    setTimeout(() => {
      this.back();
    }, 200);
  }
  private async cacheHistories(historyCities: TrafficlineEntity[]) {
    console.log(historyCities, '前');
    // historyCities = Array.from(new Set(historyCities));
    let array = [];
    const obj = {};
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < historyCities.length; i++) {
      if (!obj[historyCities[i].Code]) {
        array.push(historyCities[i]);
        obj[historyCities[i].Code] = true;
      }
    }
    console.log(array, '后');
    if (array && array.length) {
      array = array.slice(0, 20);
      await this.storage.set(HISTORY_HOTEL_CITIES, array);
    }
  }
  ngOnInit() {
    this.isSelect = true;
    this.initHistoryCity();
    const sub = this.hotelService.getSearchHotelModelSource().subscribe((m) => {
      if (m && m.destinationCity) {
        this.selectedCity = m.destinationCity;
        if (this.historyCities) {
          this.historyCities.forEach((c) => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
        if (this.hotCities) {
          this.hotCities.forEach((c) => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
        if (this.vmCities) {
          this.vmCities.forEach((c) => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
        if (this.cities) {
          this.cities.forEach((c) => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
      }
    });
    this.subscriptions.push(sub);
    this.doRefresh();
  }
  async ngAfterViewInit() {
    if (this.searchbar) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 300);
    }
  }
  async loadMore(kw: string = "") {
    this.isLoading = true;
    let cities = this.cities || [];
    if (this.isHot) {
      cities = cities.filter((it) => it.IsHot);
    }
    cities = cities.filter((it) => it.matchStr.includes(kw));
    const arr = cities.slice(this.pageIndex * this.pageSize, this.pageSize);
    if (arr.length) {
      this.pageIndex++;
      this.vmCities = this.vmCities.concat(
        arr.map((it) => {
          if (it.CityName) {
            if (this.isEn) {
              it.EnglishName =
                it.Name == it.CityName
                  ? it.Pinyin
                  : `${it.Pinyin},${it.EnglishName}`;
            }
          }
          if (it.Name) {
            if (!this.isEn) {
              if (it.Name == it.CityName) {
                it.CityName = "";
              }
            }
          }
          return it;
        })
      );
    }
    console.log("vmCities", this.vmCities);
    this.isLoading = false;
    this.scroller.disabled = arr.length < this.pageSize;
  }
  async doRefresh() {
    try {
      this.isSelect = true;
      this.isLoading = true;
      // this.historyCities = [];
      this.hotCities = [];
      this.vmCities = [];
      this.cities = [];
      this.cities = await this.hotelService.getHotelCityAsync();
      if (this.cities) {
        this.cities = this.cities
          .filter((it) => it.IsHot)
          .concat(this.cities.filter((it) => !it.IsHot))
          .sort((a, b) => b.Sequence - a.Sequence);
        this.hotCities = this.cities
          .filter((it) => it.IsHot);
        this.cities = this.cities.map((it) => {
          it.matchStr = this.searchKeys
            .filter((k) => !!it[k])
            .map((k) => it[k])
            .map((s: string) => s.toLowerCase())
            .join(",");
          return it;
        });
        this.initLetterCitiesMap();
      }
      this.pageIndex = 0;
      this.isHot = false;
      if (this.scroller) {
        this.scroller.disabled = true;
      }
      this.loadMore((this.vmKeyword || "").trim());
      if (this.refresher) {
        this.refresher.complete();
      }
    } catch (e) {
      console.error(e);
    }
  }
  async doSearch() {
    // const kw = (this.vmKeyword || "").trim();
    // this.pageIndex = 0;
    // this.isLoading = true;
    // this.isSelect = false;
    // this.vmCities = [];
    // if (this.scroller) {
    //   this.scroller.disabled = true;
    // }
    // if (kw == '') {
    //   this.isSelect = true;
    // }
    // this.loadMore(kw);
    this.router.navigate([AppHelper.getRoutePath("hotel-search-df")]);
  }

  async onDetete() {
    const ok = await AppHelper.alert("确定清除历史记录吗?", true, "确定", "取消");
    if (ok == true) {
      console.log(this.historyCities);
      this.ishistory = false;
      this.historyCities = [];
      this.doRefresh();
    }
  }

  onCancle() {
    console.log('取消')
    this.back();
  }
}
