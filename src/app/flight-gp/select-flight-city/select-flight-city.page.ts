import { RefresherComponent } from "../../components/refresher/refresher.component";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Storage } from "@ionic/storage";
import {
  IonContent,
  Platform,
  IonRefresher,
  IonHeader,
  ModalController,
  IonInfiniteScroll,
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import * as jsPy from "js-pinyin";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { LangService } from "src/app/services/lang.service";
import { FlightGpService } from "../flight-gp.service";
@Component({
  selector: "app-select-flight-city",
  templateUrl: "./select-flight-city.page.html",
  styleUrls: ["./select-flight-city.page.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out")),
    ]),
  ],
})
export class SelectFlightCityPage implements OnInit, OnDestroy, AfterViewInit {
  private cities: TrafficlineEntity[] = [];
  private histories: TrafficlineEntity[] = [];
  private subscription = Subscription.EMPTY;
  private isFromCity = true;
  private pageSize = 30;
  textSearchResults: TrafficlineEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  activeTab = "";
  isEn = false;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  segmentValue: "domestic";
  isIos = false;
  constructor(
    plt: Platform,
    route: ActivatedRoute,
    private flightGpService: FlightGpService,
    private storage: Storage,
    private langService: LangService
  ) {
    this.isIos = plt.is("ios");
    this.subscription = route.queryParamMap.subscribe((q) => {
      this.isFromCity = q.get("requestCode") == "select_from_city";
    });
  }
  async onActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab == "hot") {
      this.cities = this.cities || [];
      this.textSearchResults = this.cities.filter(
        (it) => it.IsHot && !it.IsDeprecated
      );
    }
    if (tab == "history") {
      this.textSearchResults = this.histories || [];
    }
  }
  onSearchByKeywords() {
    this.isSearching = true;
    this.doRefresh();
    this.isSearching = false;
  }
  async ngOnInit() {
    this.isEn = this.langService.isEn;
    this.doRefresh();
  }
  private async initData(forceRefresh: boolean = false) {
    this.cities =
      (await this.flightGpService.getDomesticAirports(forceRefresh)) || [];
    this.cities.sort((c1, c2) => c1.Sequence - c2.Sequence);
    this.cities = this.cities.map((it) => {
      if (
        it.Name == "北京南苑" ||
        it.Nickname == "北京南苑" ||
        it.CityName == "北京南苑"
      ) {
        it.IsDeprecated = true;
      }
      return it;
    });
    this.histories = (await this.storage.get("historyDomesticAirports")) || [];
    this.cities = this.cities
      .filter((it) => it.IsHot)
      .concat(this.cities.filter((it) => !it.IsHot));
    return true;
  }
  ngOnDestroy() {
    console.log("onDestroy");
    this.subscription.unsubscribe();
  }
  async doRefresh(forceFetch = false) {
    await this.initData(forceFetch).catch((_) => 0);
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.textSearchResults = [];
    this.loadMore();
    this.scrollToTop();
  }
  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  ngAfterViewInit() {}
  async onCitySelected(city: TrafficlineEntity) {
    if (this.histories && !this.histories.find((it) => it.Id == city.Id)) {
      this.histories.unshift(city);
      if (this.histories.length > 20) {
        this.histories = this.histories.slice(0, 20);
      }
      await this.storage.set("historyDomesticAirports", this.histories);
    }
    this.flightGpService.onCitySelected(city, this.isFromCity);
    if (this.backBtn) {
      this.backBtn.popToPrePage();
    }
    return false;
  }
  async loadMore() {
    if (!this.cities || this.cities.length == 0) {
      await this.initData();
    }
    let name = (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    name = name.toLowerCase();
    const arr = this.cities
      .filter((c) => {
        if (!name) {
          return true;
        }
        const keys = `Code,Name,Nickname,CityName,Pinyin`.split(",");
        return keys.some((k) => {
          // console.log(`key=${k}`, c[k]);
          const n: string = ((c[k] && c[k]) || "").toLowerCase();
          if (name == "北京南苑") {
            return n != name && n.includes("北京");
          }
          const reg = new RegExp("^[a-zA-Z]*$");
          if (reg.test(name) && name.length == 3) {
            return name == n;
          } else {
            return name == n || n.includes(name);
          }
        });
      })
      .filter((it) => !it.IsDeprecated);
    this.scroller.complete();
    const temp = arr.slice(
      this.textSearchResults.length,
      this.textSearchResults.length + this.pageSize
    );
    this.scroller.disabled = temp.length < this.pageSize;
    if (temp.length) {
      this.textSearchResults = this.textSearchResults.concat(temp);
    }
  }
}
