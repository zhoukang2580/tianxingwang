import { Subscription } from 'rxjs';
import { LanguageHelper } from "./../../../languageHelper";
import { AppHelper } from "src/app/appHelper";
import { IonContent, Platform, IonRefresher, IonHeader, ModalController } from "@ionic/angular";
import { takeUntil, tap, switchMap } from "rxjs/operators";
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
  textSearchResults: TrafficlineEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  segmentValue: "domestic" | "overseas" = "domestic";
  isIos = false;
  constructor(
    plt: Platform,
    private modalCtrl: ModalController,
    private flightService: FlightService
  ) {
    this.isIos = plt.is("ios");
  }
  onSearchByKeywords() {
    let name = (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    name = name.toLowerCase();
    this.isSearching = true;
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
    this.isSearching=false;
  }
  async ngOnInit() {
    this.doRefresh();
  }
  private async initData(forceRefresh: boolean = false) {
    this.cities = await this.flightService.getDomesticAirports(forceRefresh) || [];
    this.cities = this.cities.map(it => {
      if (it.Name == "北京南苑" || it.Nickname == "北京南苑" || it.CityName == "北京南苑") {
        it.IsDeprecated = true;
      }
      return it;
    })
    return true;
  }
  ngOnDestroy() {
    console.log("onDestroy");
  }
  async doRefresh(forceFetch = false) {
    await this.initData(true).catch(_ => 0);
    if (this.refresher) {
      this.refresher.complete();
    }
    this.textSearchResults = this.cities.slice(0, 100);
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
    this.textSearchResults = null;
    this.modalCtrl.dismiss(city);
  }
  onCitySelected(city: TrafficlineEntity) {
    this.goBack(city);
    return false;
  }
}
