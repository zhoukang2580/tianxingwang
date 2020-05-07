import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import {
  IonRefresher,
  ModalController,
  IonContent,
  DomController,
  IonGrid,
  IonInfiniteScroll,
  IonSearchbar
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  OnDestroy
} from "@angular/core";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { Storage } from "@ionic/storage";
import { TrainService } from "src/app/train/train.service";
import {
  trigger,
  state,
  transition,
  animate,
  style
} from "@angular/animations";
export const CACHE_KEY_STATIONS = "cache_key_stations";
@Component({
  selector: "app-select-station",
  templateUrl: "./select-station.page.html",
  styleUrls: ["./select-station.page.scss"],
  animations: [
    trigger("scaleAnimation", [
      state("true", style({ transform: "scale(1.1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("200ms ease-in-out"))
    ])
  ]
})
export class SelectTrainStationPage
  implements OnInit, AfterViewInit, OnDestroy {
  vmKeyword = "";
  histories: TrafficlineEntity[];
  vmStations: TrafficlineEntity[];
  allStations: TrafficlineEntity[] = [];
  isLoading = false;
  selectedStation: TrafficlineEntity;
  isSelectFromStation: "from_station" | "to_station";
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  private subscription = Subscription.EMPTY;
  constructor(
    private trainService: TrainService,
    private route: ActivatedRoute,
    private storage: Storage
  ) {}
  async ngOnInit() {
    this.loadHistories();
    this.initAllStations();
    this.subscription = this.route.queryParamMap.subscribe(q => {
      if (q.get("requestCode")) {
        this.isSelectFromStation =
          q.get("requestCode") == "from_station"
            ? "from_station"
            : "to_station";
      }
    });
    this.doRefresh();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private async loadHistories() {
    this.histories = (await this.storage.get(CACHE_KEY_STATIONS)) || [];
  }
  async ngAfterViewInit() {
    this.searchbar.setFocus();
  }
  scrollTop() {
    if (this.ionContent) {
      this.ionContent.scrollToTop(200);
    }
  }
  async initAllStations() {
    try {
      this.allStations = await this.trainService.getStationsAsync();
      this.allStations.sort((s1, s2) => s1.Sequence - s2.Sequence);
      this.allStations = this.allStations
        .filter(it => it.IsHot)
        .concat(this.allStations.filter(it => !it.IsHot));
    } catch {
      this.allStations = [];
    }
  }
  private cacheCity(station: TrafficlineEntity) {
    this.histories = this.histories || [];
    if (!this.histories.find(it => it.Code == station.Code)) {
      this.histories.unshift(station);
    }
    this.histories = this.histories.slice(0, 20).map(s => {
      s.Selected = false;
      return s;
    });
    return this.storage.set(CACHE_KEY_STATIONS, this.histories);
  }
  async doRefresh() {
    this.isLoading = true;
    this.vmStations = [];
    this.scroller.disabled = true;
    await this.loadMore(this.vmKeyword);
    this.vmKeyword = "";
    this.scrollTop();
    this.isLoading = false;
  }
  async loadMore(kw: string = "") {
    kw = kw || this.vmKeyword || "";
    if (!this.allStations || !this.allStations.length) {
      await this.initAllStations();
    }
    if (this.refresher && this.vmStations.length == 0) {
      this.refresher.complete();
    }
    this.scroller.complete();
    if (this.allStations && this.allStations.length) {
      const arr = this.filterCities(kw);
      const temp = arr.slice(
        this.vmStations.length,
        this.vmStations.length + 30
      );
      this.scroller.disabled = temp.length < 30;
      if (temp.length) {
        this.vmStations = this.vmStations.concat(temp);
      }
    }
  }
  async onSelectStation(station: TrafficlineEntity) {
    this.cacheCity(station);
    this.vmStations.forEach(s => (s.Selected = false));
    station.Selected = true;
    this.selectedStation = station;
    const search = this.trainService.getSearchTrainModel();
    if (this.isSelectFromStation == "from_station") {
      search.fromCity = station;
      search.FromStation = search.fromCity.Code;
    } else {
      search.toCity = station;
      search.ToStation = search.toCity.Code;
    }
    this.trainService.setSearchTrainModelSource({
      ...search
    });
    setTimeout(() => {
      this.backBtn.popToPrePage();
    }, 200);
  }
  async doSearch() {
    const kw = this.vmKeyword.trim();
    this.vmStations = [];
    this.isLoading = true;
    await this.loadMore(kw);
    this.isLoading = false;
  }
  onShowHot() {
    this.scroller.disabled = true;
    if (this.allStations) {
      this.vmStations = this.allStations.filter(it => it.IsHot);
    }
    this.scrollTop();
  }
  onShowHistory() {
    this.scroller.disabled = true;
    this.vmStations = this.histories || [];
    this.scrollTop();
  }
  private filterCities(kw: string = "") {
    let result = this.allStations || [];
    if (kw) {
      kw = kw.trim().toLowerCase();
      const keys = ["Name", "Nickname", "CityName", "Pinyin"];
      result = result.filter(s => {
        return (
          kw == s.FirstLetter.toLowerCase() ||
          keys.some(
            k =>
              s[k] &&
              (kw == s[k].toLowerCase() || s[k].toLowerCase().includes(kw))
          )
        );
      });
    }
    return result;
  }
}
