import { RefresherComponent } from "../../components/refresher/refresher.component";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { BackButtonComponent } from "../../components/back-button/back-button.component";
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
import { InternationalFlightService } from "../international-flight.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { LangService } from "src/app/services/lang.service";
import { StorageService } from "src/app/services/storage-service.service";
@Component({
  selector: "app-select-international-flight-city",
  templateUrl: "./select-city.page.html",
  styleUrls: ["./select-city.page.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out")),
    ]),
  ],
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
  @ViewChild(BackButtonComponent, { static: true })
  backBtn: BackButtonComponent;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  isIos = false;
  isActiveHot = false;
  isEn = false;
  constructor(
    plt: Platform,
    route: ActivatedRoute,
    private flightService: InternationalFlightService,
    private storage: StorageService,
    private tmcService: TmcService,
    private langService: LangService
  ) {
    this.isIos = plt.is("ios");
    this.subscription = route.queryParamMap.subscribe((q) => {
      this.isFromCity = q.get("requestCode") == "select_from_city";
    });
  }
  async onActiveTab(tab: string) {
    this.activeTab = tab;
    this.vmKeyowrds = "";
    this.isActiveHot = false;
    if (tab == "hot") {
      this.isActiveHot = true;
      this.textSearchResults = [];
      this.vmKeyowrds = "";
      this.scrollToTop();
      this.loadMore();
    }
    if (tab == "history") {
      this.textSearchResults = this.histories || [];
      if (this.scroller) {
        this.scroller.disabled = this.textSearchResults.length < this.pageSize;
      }
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
    try {
      const keys = `Code,Name,Nickname,CityName,Pinyin,AirportCityCode,Initial,FirstLetter,EnglishName`.split(
        ","
      );
      if (this.isInitData) {
        return;
      }
      const domestics: TrafficlineEntity[] = await this.tmcService
        .getDomesticAirports(forceRefresh)
        .catch(() => []);
      const interCities: TrafficlineEntity[] = await this.flightService
        .getInternationalAirports(forceRefresh)
        .catch(() => []);
      this.cities = domestics.concat(interCities);
      this.cities.sort((c1, c2) => c1.Sequence - c2.Sequence);
      this.histories =
        (await this.storage.get("historyInternationalAirports")) || [];
      this.cities = this.cities
        .filter((it) => it.IsHot)
        .concat(this.cities.filter((it) => !it.IsHot))
        .map((it) => {
          it.matchStr = keys
            .map((k) => it[k])
            .filter((i) => i && i.length > 0)
            .join(",")
            .toLowerCase();
          return it;
        });
      this.isInitData = this.cities.length > 0;
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
  ngOnDestroy() {
    console.log("onDestroy");
    this.subscription.unsubscribe();
  }
  async doRefresh(forceFetch = false) {
    this.isActiveHot = false;
    this.activeTab = "";
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
      await this.storage.set("historyInternationalAirports", this.histories);
    }
    // this.flightService.afterCitySelected(city, this.isFromCity);
    if (this.backBtn) {
      this.backBtn.popToPrePage();
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
    let arr = this.cities;
    const reg = new RegExp("^[a-zA-Z]*$");
    if (name) {
      arr = arr.filter((it) => {
        if (reg.test(name) && name.length == 3) {
          return (
            name == (it.AirportCityCode || "").toLowerCase() ||
            (it.Code || "").toLowerCase() == name
          );
        } else {
          return (
            it.Name == name ||
            it.Nickname == name ||
            it.Pinyin == name ||
            it.matchStr.includes(name)
          );
        }
      });
    }
    if (this.isActiveHot) {
      arr = arr.filter((it) => it.IsHot);
    }
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
