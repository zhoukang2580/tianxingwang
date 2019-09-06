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
  IonHeader
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
  private letterAndCities: {
    [letter: string]: TrafficlineEntity[];
  } = {} as any;
  private selectedCity: TrafficlineEntity;
  hotCities: TrafficlineEntity[];
  historyCities: TrafficlineEntity[];
  vmCities: TrafficlineEntity[] = [];
  vmKeyword = "";
  letters: string[];
  activeLetter = "A";
  scrollEle: HTMLElement;
  isShowFabButton = false;
  isLoading = false;
  subscriptions: Subscription[] = [];
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild("hot") hotEle: IonGrid;
  @ViewChild("lettersEle") lettersEle: IonGrid;
  @ViewChild("historyEl") historyEl: IonGrid;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(IonHeader) ionHeader: IonHeader;
  @ViewChild("firstLetterEl") firstLetterEl: IonList;
  constructor(
    private navCtrl: NavController,
    private domCtrl: DomController,
    private hotelService: HotelService,
    private storage: Storage,
    private route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe(_ => {
      this.doRefresh();
    });
  }
  back() {
    this.navCtrl.back();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  private async initHistoryCity(selectedCity: TrafficlineEntity) {
    if (!this.historyCities) {
      this.historyCities = await this.storage.get(HISTORY_HOTEL_CITIES);
    }
    if (this.historyCities) {
      this.historyCities.forEach(c => {
        c.Selected = c.Code == (selectedCity && selectedCity.Code);
      });
      if (selectedCity) {
        const one = this.historyCities.find(it => it.Code == selectedCity.Code);
        if (!one) {
          this.historyCities.unshift(selectedCity);
        } else {
          one.Selected = true;
          this.historyCities = [
            one,
            ...this.historyCities.filter(it => it.Code != one.Code)
          ];
        }
      }
      this.historyCities = this.historyCities.slice(0, 9);
    } else {
      if (selectedCity) {
        this.historyCities = [selectedCity];
      }
    }
    await this.storage.set(HISTORY_HOTEL_CITIES, this.historyCities);
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
      await this.initHistoryCity(city);
      this.hotelService.setSearchHotelModel({
        ...this.hotelService.getSearchHotelModel(),
        destinationCity: city
      });
    }
    setTimeout(() => {
      this.back();
    }, 200);
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
  }
  onSelectLetter(letter: string) {
    this.activeLetter = letter;
    this.vmCities = this.letterAndCities[this.activeLetter];
    if (this.vmCities) {
      this.vmCities.sort((s1, s2) => s1.Sequence - s2.Sequence);
      this.renderList();
      setTimeout(() => {
        this.scrollToTargetLink();
      }, 200);
    }
  }
  async ngAfterViewInit() {
    if (!this.scrollEle) {
      this.scrollEle = await this.ionContent.getScrollElement();
    }
  }
  async doRefresh() {
    this.historyCities = [];
    this.hotCities = [];
    this.initHistoryCity(null);
    if (this.refresher) {
      this.refresher.complete();
      this.refresher.disabled = true;
      setTimeout(() => {
        this.refresher.disabled = false;
      }, 200);
    }
    this.isLoading = true;
    this.allCities = await this.hotelService.getHotelCityAsync(true);
    this.isLoading = false;
    this.init();
  }
  onScroll(evt: any) {
    if (!this.scrollEle) {
      return;
    }
    // console.log(this.scrollEle.scrollTop);
    this.domCtrl.read(_ => {
      const stop = this.scrollEle.scrollTop;
      if (this.lettersEle && this.lettersEle["el"]) {
        const rect = this.lettersEle["el"].getBoundingClientRect();
        if (rect) {
          this.domCtrl.write(_ => {
            this.isShowFabButton = rect.bottom < stop;
          });
        }
      }
    });
  }
  private init() {
    this.hotCities =
      (this.allCities && this.allCities.filter(it => it.IsHot)) || [];
    if (this.allCities) {
      this.allCities.forEach(s => {
        if (this.letterAndCities[s.FirstLetter]) {
          this.letterAndCities[s.FirstLetter].push(s);
        } else {
          this.letterAndCities[s.FirstLetter] = [s];
        }
      });
      this.letters = Object.keys(this.letterAndCities);
      this.letters.sort((l1, l2) => l1.charCodeAt(0) - l2.charCodeAt(0));
      this.activeLetter = this.letters[0];
      this.vmCities = this.letterAndCities[this.activeLetter];
      this.vmCities.sort((s1, s2) => s1.Sequence - s2.Sequence);
      this.renderList();
    }
  }
  private scrollToTargetLink() {
    if (
      this.firstLetterEl &&
      this.firstLetterEl["el"] &&
      this.ionHeader &&
      this.ionHeader["el"]
    ) {
      this.domCtrl.read(_ => {
        const rect = this.firstLetterEl["el"].getBoundingClientRect();
        // console.log("hotEle Rect", rect);
        const headerH = this.ionHeader["el"].clientHeight;
        // console.log("headerH", headerH);
        if (rect && this.ionContent) {
          this.domCtrl.write(_ => {
            this.ionContent.scrollByPoint(
              0,
              Math.floor(rect.top - headerH || 0),
              100
            );
          });
        }
      });
    }
  }
  private renderList() {
    if (this.vmCities) {
      const vm = this.vmCities.slice(0);
      this.vmCities = [];
      const count = 20;
      const loop = () => {
        if (vm.length) {
          vm.splice(0, count).forEach(it => {
            it.Selected =
              it.Code == (this.selectedCity && this.selectedCity.Code);
            this.vmCities.push(it);
          });
          window.requestAnimationFrame(loop);
        }
      };
      loop();
    }
  }
  async doSearch() {
    const kw = this.vmKeyword.trim();
    if (!kw) {
      this.activeLetter = this.letters[0];
      this.vmCities = this.letterAndCities[this.activeLetter];
      this.renderList();
      this.activeLetter = "";
      setTimeout(() => {
        this.scrollToTargetLink();
      }, 200);
    } else {
      this.vmCities = this.allCities.filter(s => {
        return (
          kw.toUpperCase() == s.FirstLetter ||
          (s.Name && s.Name.includes(kw)) ||
          (s.Nickname && s.Nickname.includes(kw)) ||
          (s.EnglishName && s.EnglishName.includes(kw)) ||
          (s.CityName && s.CityName.includes(kw))
        );
      });
      this.vmCities.sort((s1, s2) => s1.Sequence - s2.Sequence);
      this.renderList();
      this.activeLetter = "";
      setTimeout(() => {
        this.scrollToTargetLink();
      }, 200);
    }
  }
}
