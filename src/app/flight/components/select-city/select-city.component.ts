import { LanguageHelper } from "./../../../languageHelper";
import { AppHelper } from "src/app/appHelper";
import { IonContent, Platform, IonRefresher } from "@ionic/angular";
import { takeUntil, tap, switchMap } from "rxjs/operators";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  Input,
  HostBinding,
  OnDestroy,
  Output,
  EventEmitter,
  NgZone
} from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { ListCityModel } from "./models/ListCityModel";
import * as jsPy from "js-pinyin";
import { FlyCityItemModel as TrafficlineModel } from "./models/TrafficlineModel";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { FlightService, Trafficline } from "../../flight.service";
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
  @Input() cities: TrafficlineModel[] = [];
  hotCities: TrafficlineModel[] = [];
  // @ViewChild(IonRefresher)  ionRefresher: IonRefresher;
  @ViewChild("cnt")
  content: IonContent;
  selectedCity: TrafficlineModel;
  historyCities: TrafficlineModel[] = [];
  listCities: ListCityModel[] = [];
  listCitiesViewModel: ListCityModel[] = [];
  subscription = Subscription.EMPTY;
  openCloseSubscription = Subscription.EMPTY;
  cnt: HTMLElement;
  linksNavEle: HTMLElement;
  curTargetNavEle: HTMLElement;
  curNavTextEle: HTMLElement;
  isUserSelect: boolean;
  private domesticAirports: Trafficline[] = [];
  private internationalAirports: Trafficline[] = [];
  segmentValue: "domestic" | "overseas" = "domestic";
  private isDataInit = false;
  @Input()
  @HostBinding("@openclose")
  openclose = true;
  @Output() selectcity: EventEmitter<any>;
  constructor(
    private plt: Platform,
    private render: Renderer2,
    // private ngZone: NgZone,
    private flightService: FlightService
  ) {
    this.selectcity = new EventEmitter();
  }
  ionViewWillEnter() {
    this.initHistoryCities();
    // console.log(this.domesticAirports.length);
  }
  ngOnInit() {
    this.openCloseSubscription = this.flightService
      .getOpenCloseSelectCityPageSources()
      .subscribe(async open => {
        if (open) {
          if (!this.isDataInit) {
            this.isDataInit = await this.initData();
          }
          this.ionViewWillEnter();
        }
        this.openclose = open;
      });
  }
  async loadInternationalAirports() {
    this.flightService.getInternationalAirports(true);
  }
  async initData(forceRefresh: boolean = false) {
    this.initHistoryCities();
    this.domesticAirports = await this.loadDomesticAirports(forceRefresh);
    console.time("initDomesticListCity");
    this.initHotCities();
    await this.initDomesticListCity();
    this.listCities.sort((a, b) => a.link.charCodeAt(0) - b.link.charCodeAt(0));
    if (this.hotCities.length) {
      const lm = new ListCityModel();
      lm.link = "hot";
      lm.displayName = LanguageHelper.getHotCitiesTip();
      lm.items = this.hotCities;
      this.listCities.unshift(lm);
    }
    if (this.historyCities.length) {
      const lm = new ListCityModel();
      lm.link = "history";
      lm.displayName = LanguageHelper.getHistoryCitiesTip();
      lm.items = this.historyCities;
      this.listCities.unshift(lm);
    }
    console.timeEnd("initDomesticListCity");
    // console.log("listCitiesViewModel", this.listCitiesViewModel);
    return true;
  }
  ngOnDestroy() {
    console.log("onDestroy");
    this.subscription.unsubscribe();
    this.openCloseSubscription.unsubscribe();
  }
  private initHotCities() {
    if (this.segmentValue === "domestic") {
      this.hotCities = this.domesticAirports
        .filter(item => item.IsHot)
        .sort((c1, c2) => +c1.Sequence - +c2.Sequence);
    } else {
      this.hotCities = this.internationalAirports.filter(item => item.IsHot);
    }
  }
  private initHistoryCities() {
    const hcs = AppHelper.getStorage<TrafficlineModel[]>("historyCities") || [];
    this.historyCities = hcs;
    let lm = this.listCitiesViewModel.find(l => l.link == "history");
    if (!lm) {
      lm = new ListCityModel();
      if (this.historyCities.length) {
        lm.link = "history";
        lm.displayName = LanguageHelper.getHistoryCitiesTip();
        lm.items = this.historyCities;
        this.listCitiesViewModel.unshift(lm);
      }
    } else {
      lm.items = this.historyCities || [];
    }
  }
  goToLink(nav: {
    link: string;
    displayName?: string;
    rect?: DOMRect | ClientRect;
    offsetTop?: number;
  }) {
    this.showCurTargetNavEle(true);
    // console.log(`开始查找元素[data-id=${nav.link}]`);
    let sT = Date.now();
    window.requestAnimationFrame(() => {
      sT = Date.now();
      this.content.scrollToPoint(0, Math.floor(nav.offsetTop));
      console.log(`完成${nav.link},滚动耗时 ${Date.now() - sT} ms`);
    });
    sT = Date.now();
    // this.isMovingSj.next(true);
    window.requestAnimationFrame(() => {
      if (this.curNavTextEle) {
        this.curNavTextEle.textContent = nav.displayName;
      }
    });
    return false;
  }
  initDomesticListCity() {
    return new Promise(done => {
      let cities: Trafficline[] = [];
      if (this.segmentValue == "domestic") {
        cities = this.domesticAirports.slice(0);
      } else {
        cities = this.internationalAirports.slice(0);
      }
      this.listCitiesViewModel = this.listCities = [];
      let temp = 0;
      // console.time("计算 listCities");
      const once = 1000;
      let count = 0;
      const loop = () => {
        const st = window.performance.now();
        const tempc = cities.splice(0, once);
        if (tempc.length) {
          tempc.forEach(c => {
            temp++;
            const pyFl = `${jsPy.getFullChars(c.Nickname)}`.charAt(0);
            // console.log(pyFl + " -- " + c.Nickname);
            let lm = this.listCities.find(item => item.link === pyFl);
            // console.log("lm", lm);
            if (!lm) {
              lm = new ListCityModel();
              lm.link = pyFl;
              lm.displayName = pyFl.toUpperCase();
              lm.items = [c];
              this.listCities.push(lm);
            } else {
              if (!lm.items.find(it => it.CityCode === c.CityCode)) {
                lm.items.push(c);
              }
            }
          });
        }
        console.log(
          `完成 ${tempc.length} 个元素处理,${window.performance.now() - st} ms`
        );
        this.listCities.sort(
          (a, b) => a.link.charCodeAt(0) - b.link.charCodeAt(0)
        );
        if (cities.length) {
          console.log(`第${++count}次循环`);
          window.requestAnimationFrame(loop);
        } else {
          console.log(`【loop】完成,${temp} 个城市`);
          done();
        }
      };
      loop();
    });
  }
  segmentChanged(evt: CustomEvent) {
    // console.log(evt);
    if (evt.detail) {
      this.segmentValue = evt.detail.value;
    }
    console.time("initListCity");
    this.initDomesticListCity();
    console.timeEnd("initListCity");
  }
  showCurTargetNavEle(show: boolean) {
    window.requestAnimationFrame(() => {
      if (show) {
        if (!this.curTargetNavEle.classList.contains("show")) {
          this.render.addClass(this.curTargetNavEle, "show");
        }
      } else if (this.curTargetNavEle.classList.contains("show")) {
        this.render.removeClass(this.curTargetNavEle, "show");
      }
    });
  }
  loadDomesticAirports(forceRefresh: boolean = false) {
    return this.flightService.getDomesticAirports(forceRefresh);
  }
  ngAfterViewInit() {
    console.time("ngAfterViewInit");
    this.cnt = document.getElementById("mainCnt");
    this.curNavTextEle = document.getElementById("curNavText");
    this.curTargetNavEle = document.querySelector(".curTargetNav");
    if (true || this.plt.is("ios")) {
      // this.render.setStyle(this.cnt, "width", "90vw");
    }
    const nav = (this.linksNavEle = document.getElementById("links")); // 这里是右边的字母
    console.timeEnd("ngAfterViewInit");

    let lastTime = Date.now();
    if (!nav) {
      return;
    }
    fromEvent(nav, "touchstart")
      .pipe(
        tap(() => {
          if (!nav.classList.contains("moving")) {
            this.render.addClass(nav, "moving");
          }
          this.showCurTargetNavEle(true);
          lastTime = Date.now();
          this.listCities.map(c => {
            const el = document.querySelector(`.${c.link}-link`); // 导航用的link
            const ele = document.querySelector(
              `.${c.link}-class`
            ) as HTMLElement; // 具体的每一个字母
            if (ele) {
              c.offsetTop = ele.offsetTop;
            }
            if (el) {
              c.rect = el.getBoundingClientRect();
              // c.rect = { ...c.rect, top: Math.floor(c.rect.top) };
            }
          });
          console.log(
            `完成${this.listCities.length}个link位置初始化耗時：${Date.now() -
              lastTime}`
          );
        }),
        switchMap(() =>
          fromEvent(nav, "touchmove").pipe(
            tap(evt => {
              this.showCurTargetNavEle(true);
            }),
            takeUntil(
              fromEvent(nav, "touchend").pipe(
                tap((evt: TouchEvent) => {
                  if (nav.classList.contains("moving")) {
                    this.render.removeClass(nav, "moving");
                  }
                  setTimeout(() => {
                    this.showCurTargetNavEle(false);
                  }, 1400);
                })
              )
            )
          )
        )
      )
      .subscribe((evt: TouchEvent) => {
        if (Date.now() - lastTime < 32) {
          // console.log("滑动太快");
          return;
        }
        lastTime = Date.now();
        if (evt.touches && evt.touches.length) {
          const touch = evt.touches[0];
          this.listCities.map(c => {
            if (
              c.rect &&
              touch.pageY >= c.rect.top &&
              touch.pageY <= c.rect.bottom
            ) {
              this.goToLink(c);
            }
          });
        }
      });
  }
  goBack() {
    this.selectcity.emit(this.selectedCity);
    this.flightService.setOpenCloseSelectCityPageSources(false);
  }
  onNavLickClick(link: string) {
    this.listCities.map(el => {
      // console.log(el.link);
      if (el.link === link) {
        this.goToLink(el);
      }
    });
  }
  onCitySelected(city: TrafficlineModel, isUserSelect?: boolean) {
    for (let i = 0; i < this.listCitiesViewModel.length; i++) {
      const item = this.listCitiesViewModel[i];
      const lastSelectedCity = item.items.find(
        c => c.Id == (this.selectedCity && this.selectedCity.Id)
      );
      if (lastSelectedCity) {
        lastSelectedCity.Selected = false;
        break;
      }
    }
    city.Selected = true;
    this.selectedCity = city;
    this.hotCities.map(hc => {
      hc.Selected = hc.Id === city.Id;
    });
    this.historyCities.forEach(item => {
      item.Selected = item.Id === city.Id;
      if (!this.historyCities.find(item => item.Id === city.Id)) {
        this.historyCities.unshift(city);
      }
    });

    this.historyCities = this.historyCities.slice(0, 9);
    AppHelper.setStorage("historyCities", this.historyCities);
    if (isUserSelect) {
      this.goBack();
    }
    return false;
  }
}
