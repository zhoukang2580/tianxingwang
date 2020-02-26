import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { RefresherComponent } from "src/app/components/refresher";
import { ActivatedRoute } from "@angular/router";
import { HotelService } from "./../hotel.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef
} from "@angular/core";
import {
  NavController,
  IonGrid,
  IonRefresher,
  IonContent,
  DomController,
  IonList,
  IonHeader,
  IonInfiniteScroll
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { Subscription } from "rxjs";
const HISTORY_HOTEL_CITIES = "history_hotel_cities";
@Component({
  selector: "app-hotel-city",
  templateUrl: "./hotel-city.page.html",
  styleUrls: ["./hotel-city.page.scss"]
})
export class HotelCityPage implements OnInit, AfterViewInit, OnDestroy {
  private allCities: TrafficlineEntity[] = [];
  private selectedCity: TrafficlineEntity;
  private subscriptions: Subscription[] = [];
  private pageSize = 30;
  hotCities: TrafficlineEntity[];
  historyCities: TrafficlineEntity[];
  vmCities: TrafficlineEntity[] = [];
  vmKeyword = "";
  isLoading = false;
  filteredTotalCount = 0;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    private hotelService: HotelService,
    private storage: Storage,
    route: ActivatedRoute
  ) {
    this.subscriptions.push(
      route.queryParamMap.subscribe(_ => {
        this.doRefresh();
      })
    );
  }
  back() {
    this.backBtn.backToPrePage();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  private async initHistoryCity() {
    if (!this.historyCities || !this.historyCities.length) {
      this.historyCities = await this.storage.get(HISTORY_HOTEL_CITIES);
    }
  }
  onShowHistory() {
    this.vmCities = this.historyCities;
    this.scroller.disabled = true;
  }
  onShowHot() {
    this.vmCities = this.hotCities;
    this.scroller.disabled = true;
  }
  async onSelect(city: TrafficlineEntity) {
    console.log(this.vmCities, this.historyCities, this.hotCities);
    if (city) {
      this.selectedCity = city;
      if (this.vmCities) {
        this.vmCities.forEach(s => {
          s.Selected = city.Code == s.Code;
        });
      }
      if (this.hotCities) {
        this.hotCities.forEach(s => {
          s.Selected = city.Code == s.Code;
        });
      }
      if (this.historyCities) {
        this.historyCities.forEach(s => {
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
        destinationCity: city
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
  private filterCitities(kw: string = "") {
    let result = this.allCities || [];
    kw = (kw || "").toLowerCase();
    if (!kw) {
      return result;
    } else {
      result = this.allCities.filter(s => {
        return (
          kw == s.FirstLetter.toLowerCase() ||
          (s.Name && s.Name.toLowerCase().includes(kw)) ||
          (s.Nickname && s.Nickname.toLowerCase().includes(kw)) ||
          (s.CityName && s.CityName.toLowerCase().includes(kw)) ||
          (s.Pinyin && s.Pinyin.toLowerCase().includes(kw))
        );
      })
    }
    return result;
  }
  private async cacheHistories(historyCities: TrafficlineEntity[]) {
    if (historyCities && historyCities.length) {
      historyCities = historyCities.slice(0, 20);
      await this.storage.set(HISTORY_HOTEL_CITIES, historyCities);
    }
  }
  ngOnInit() {
    const sub = this.hotelService.getSearchHotelModelSource().subscribe(m => {
      if (m && m.destinationCity) {
        this.selectedCity = m.destinationCity;
        if (this.historyCities) {
          this.historyCities.forEach(c => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
        if (this.hotCities) {
          this.hotCities.forEach(c => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
        if (this.vmCities) {
          this.vmCities.forEach(c => {
            c.Selected = c.Code == this.selectedCity.Code;
          });
        }
      }
    });
    this.subscriptions.push(sub);
    this.initCitites();
  }
  private async initCitites() {
    try {
      if (!this.allCities || !this.allCities.length) {
        this.allCities = await this.hotelService.getHotelCityAsync()
      }
      this.allCities.sort((s1, s2) => s2.Sequence - s1.Sequence);
      this.allCities = this.allCities.filter(it => it.IsHot).concat(this.allCities.filter(it => !it.IsHot));
    } catch (e) {
      this.allCities = null;
    }
  }
  async ngAfterViewInit() {
  }
  async loadMore(kw: string = "") {
    if (!this.allCities || !this.allCities.length) {
      await this.initCitites();
    }
    if (this.allCities) {
      const arr = this.filterCitities(kw);
      this.filteredTotalCount = arr.length;
      const temp = arr.slice(this.vmCities.length, this.vmCities.length + this.pageSize);
      this.scroller.disabled = temp.length < this.pageSize;
      this.scroller.complete();
      if (!this.vmCities.length) {
        this.refresher.complete();
      }
      if (temp.length) {
        this.vmCities = this.vmCities.concat(temp);
      }
    }
  }
  async doRefresh() {
    this.isLoading = true;
    this.historyCities = [];
    this.hotCities = [];
    this.vmCities = [];
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    if (!this.allCities || !this.allCities.length) {
      await this.initCitites();
    }
    if (!this.historyCities || !this.historyCities.length) {
      await this.initHotAndHistoryCities();
    }
    await this.loadMore((this.vmKeyword || "").trim());
    this.isLoading = false;
    this.vmKeyword = "";
  }
  private async initHotAndHistoryCities() {
    if (this.allCities) {
      this.hotCities = this.allCities.filter(it => it.IsHot);
      await this.initHistoryCity();
    }
  }

  async doSearch() {
    let kw = this.vmKeyword.trim();
    if (!kw) {
      this.vmCities = this.allCities.slice(0, this.pageSize);
    } else {
      this.isLoading = true;
      this.vmCities = [];
      this.loadMore(kw);
      this.isLoading = false;
    }
  }
}
