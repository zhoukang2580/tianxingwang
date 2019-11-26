import { Storage } from '@ionic/storage';
import { IonContent, Platform, IonRefresher, IonHeader, ModalController } from "@ionic/angular";
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
import { FlightService } from "../../flight.service";
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';
@Component({
  selector: "app-select-city-comp",
  templateUrl: "./select-city.component.html",
  styleUrls: ["./select-city.component.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class SelectCityComponent implements OnInit, OnDestroy, AfterViewInit {
  private cities: TrafficlineEntity[] = [];
  private histories: TrafficlineEntity[] = [];
  textSearchResults: TrafficlineEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  activeTab = "";
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  segmentValue: "domestic" | "overseas" = "domestic";
  isIos = false;

  constructor(
    plt: Platform,
    private modalCtrl: ModalController,
    private flightService: FlightService,
    private storage: Storage
  ) {
    this.isIos = plt.is("ios");
  }
  async onActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab == 'hot') {
      this.cities = this.cities || [];
      this.textSearchResults = this.cities.filter(it => it.IsHot && !it.IsDeprecated);
    }
    if (tab == 'history') {
      this.textSearchResults = this.histories || [];
    }
  }
  onSearchByKeywords(kw: string = "") {
    let name = kw || (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    name = name.toLowerCase();
    if (!name) {
      this.textSearchResults = this.cities;
      this.scrollToTop();
      return;
    }
    this.textSearchResults = (this.cities || []).filter(c => {
      const keys = `Code,Name,Nickname,CityName,Pinyin`.split(",");
      return keys.some(k => {
        // console.log(`key=${k}`, c[k]);
        const n: string = (c[k] && c[k] || "").toLowerCase();
        if (name == '北京南苑') {
          return n != name && n.includes("北京");
        }
        const reg = new RegExp("^[a-zA-Z]*$");
        if (reg.test(name) && name.length == 3)
          return name == n;
        else
          return name == n || n.includes(name);
      })
    }).slice(0, 50).filter(it => !it.IsDeprecated);
    this.scrollToTop();
    this.isSearching = false;
  }
  async ngOnInit() {
    this.doRefresh();
  }
  private async initData(forceRefresh: boolean = false) {
    this.cities = await this.flightService.getDomesticAirports(forceRefresh) || [];
    this.cities.sort((c1, c2) => c1.Sequence - c2.Sequence);
    this.cities = this.cities.map(it => {
      if (it.Name == "北京南苑" || it.Nickname == "北京南苑" || it.CityName == "北京南苑") {
        it.IsDeprecated = true;
      }
      return it;
    })
    this.histories = await this.storage.get("historyDomesticAirports") || [];
    return true;
  }
  ngOnDestroy() {
    console.log("onDestroy");
  }
  async doRefresh(forceFetch = false) {
    await this.initData(forceFetch).catch(_ => 0);
    if (this.refresher) {
      this.refresher.complete();
    }
    this.textSearchResults = this.cities.filter(it=>it.IsHot).slice(0, 30);
    this.scrollToTop();
  }
  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  segmentChanged(evt: CustomEvent) {
    // console.log(evt);
    if (evt.detail) {
      this.segmentValue = evt.detail.value;
    }
    console.time("initListCity");
    console.timeEnd("initListCity");
  }
  ngAfterViewInit() {

  }
  goBack(city?: TrafficlineEntity) {
    this.vmKeyowrds = "";
    this.isSearching = false;
    // this.textSearchResults = null;
    this.modalCtrl.dismiss(city);
  }
  async onCitySelected(city: TrafficlineEntity) {
    if (this.histories && !this.histories.find(it => it.Id == city.Id)) {
      this.histories.unshift(city);
      if (this.histories.length > 20) {
        this.histories = this.histories.slice(0, 20);
      }
      await this.storage.set("historyDomesticAirports", this.histories);
    }
    this.goBack(city);
    return false;
  }
}
