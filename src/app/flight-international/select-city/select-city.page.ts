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
  IonInfiniteScroll
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import * as jsPy from "js-pinyin";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { InternationalFlightService } from "../international-flight.service";
@Component({
  selector: "app-select-international-flight-city",
  templateUrl: "./select-city.page.html",
  styleUrls: ["./select-city.page.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class SelectCityPage implements OnInit, OnDestroy, AfterViewInit {
  private cities: TrafficlineEntity[] = [];
  private histories: TrafficlineEntity[] = [];
  private subscription = Subscription.EMPTY;
  private isFromCity = true;
  private pageSize = 30;
  private isInitData = false;
  textSearchResults: TrafficlineEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  isLoading = false;
  activeTab = "";
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  isIos = false;
  constructor(
    plt: Platform,
    route: ActivatedRoute,
    private flightService: InternationalFlightService,
    private storage: Storage
  ) {
    this.isIos = plt.is("ios");
    this.subscription = route.queryParamMap.subscribe(q => {
      this.isFromCity = q.get("requestCode") == "select_from_city";
    });
  }
  async onActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab == "hot") {
      this.cities = this.cities || [];
      this.textSearchResults = this.cities.filter(
        it => it.IsHot && !it.IsDeprecated
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
    this.doRefresh();
  }
  private async initData(forceRefresh: boolean = false) {
    if (this.isInitData) {
      return;
    }
    this.cities =
      (await this.flightService.getInternationalAirports(forceRefresh)) || [];
    this.cities.sort((c1, c2) => c1.Sequence - c2.Sequence);
    this.histories =
      (await this.storage.get("historyInternationalAirports")) || [];
    this.cities = this.cities
      .filter(it => it.IsHot)
      .concat(this.cities.filter(it => !it.IsHot));
    this.isInitData = this.cities.length > 0;
    return true;
  }
  ngOnDestroy() {
    console.log("onDestroy");
    this.subscription.unsubscribe();
  }
  async doRefresh(forceFetch = false) {
    await this.initData(forceFetch).catch(_ => 0);
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
    if (this.histories && !this.histories.find(it => it.Id == city.Id)) {
      this.histories.unshift(city);
      if (this.histories.length > 20) {
        this.histories = this.histories.slice(0, 20);
      }
      await this.storage.set("historyInternationalAirports", this.histories);
    }
    this.flightService.onCitySelected(city, this.isFromCity);
    if (this.backBtn) {
      this.backBtn.backToPrePage();
    }
    return false;
  }
  async loadMore() {
    if (this.isLoading) {
      return;
    }
    if (!this.cities || this.cities.length == 0) {
      this.isLoading = true;
      await this.initData();
      this.isLoading = false;
    }
    let name = (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    name = name.toLowerCase();
    const arr = this.cities.filter(c => {
      if (!name) {
        return true;
      }
      const keys = `Code,Name,Nickname,CityName,Pinyin`.split(",");
      return keys.some(k => {
        // console.log(`key=${k}`, c[k]);
        const n: string = ((c[k] && c[k]) || "").toLowerCase();
        const reg = new RegExp("^[a-zA-Z]*$");
        if (reg.test(name) && name.length == 3) {
          return name == n;
        } else {
          return name == n || n.includes(name);
        }
      });
    });
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
