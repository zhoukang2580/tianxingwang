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
  NgZone,
} from "@angular/core";
import { NavController, IonInfiniteScroll, IonSearchbar } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
const HISTORY_HOTEL_CITIES = "history_hotel_cities";
@Component({
  selector: "app-hotel-city",
  templateUrl: "./hotel-city.page.html",
  styleUrls: ["./hotel-city.page.scss"],
})
export class HotelCityPage implements OnInit, AfterViewInit, OnDestroy {
  private selectedCity: TrafficlineEntity;
  private subscriptions: Subscription[] = [];
  private pageIndex = 0;
  hotCities: TrafficlineEntity[];
  historyCities: TrafficlineEntity[];
  vmCities: TrafficlineEntity[] = [];
  vmKeyword = "";
  isLoading = false;
  filteredTotalCount = 0;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    private hotelService: HotelService,
    private storage: Storage,
    route: ActivatedRoute,
    private ngZone: NgZone,
    private navCtrl: NavController
  ) {
    this.subscriptions.push(route.queryParamMap.subscribe((_) => {}));
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
    if (historyCities && historyCities.length) {
      historyCities = historyCities.slice(0, 20);
      await this.storage.set(HISTORY_HOTEL_CITIES, historyCities);
    }
  }
  ngOnInit() {
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
      }
    });
    this.subscriptions.push(sub);
    this.doRefresh();
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  async ngAfterViewInit() {
    if (this.searchbar) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 300);
    }
  }
  async loadMore(kw: string = "") {
    this.hotelService
      .searchHotelCity({ Name: kw, PageIndex: this.pageIndex })
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 200);
        })
      )
      .subscribe((r) => {
        const arr = (r && r.Data) || [];
        if (arr.length) {
          this.pageIndex++;
          this.vmCities = this.vmCities.concat(arr);
        }
        this.scroller.disabled = arr.length < 20;
      });
  }
  async doRefresh() {
    this.isLoading = true;
    this.historyCities = [];
    this.hotCities = [];
    this.vmCities = [];
    this.pageIndex = 0;
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    // if (!this.allCities || !this.allCities.length) {
    //   await this.initCitites();
    // }
    // if (!this.historyCities || !this.historyCities.length) {
    //   await this.initHotAndHistoryCities();
    // }
    this.loadMore((this.vmKeyword || "").trim());
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  // private async initHotAndHistoryCities() {
  //   if (this.allCities) {
  //     this.hotCities = this.allCities.filter((it) => it.IsHot);
  //     await this.initHistoryCity();
  //   }
  // }

  async doSearch() {
    const kw = (this.vmKeyword || "").trim();
    this.pageIndex = 0;
    this.isLoading = true;
    this.vmCities = [];
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.loadMore(kw);
  }
}
