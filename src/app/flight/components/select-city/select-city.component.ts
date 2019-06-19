import { IonContent, Platform } from "@ionic/angular";
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
  EventEmitter
} from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { ListCityModel } from "./models/ListCityModel";
import { citiesData as MOCK_CITI_DATA } from "./cities.data";
import { FlyCityItemModel } from "./models/FlyCityItemModel";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { FlightService } from "../../flight.service";
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
  @Input() cities: FlyCityItemModel[] = [];
  hotCities: FlyCityItemModel[] = [];
  @ViewChild("cnt")
  content: IonContent;
  selectedCity: FlyCityItemModel;
  historyCities: FlyCityItemModel[] = [];
  listCities: ListCityModel[] = [];
  subscription = Subscription.EMPTY;
  domesticAirportsSubscription = Subscription.EMPTY;
  internationnalAirportsSubscription = Subscription.EMPTY;
  openCloseSubscription = Subscription.EMPTY;
  cnt: HTMLElement;
  linksNavEle: HTMLElement;
  curTargetNavEle: HTMLElement;
  curNavTextEle: HTMLElement;
  isUserSelect: boolean;
  @Input()
  @HostBinding("@openclose")
  openclose = true;
  @Output() selectcity: EventEmitter<any>;
  constructor(
    private plt: Platform,
    private render: Renderer2,
    private flightService: FlightService
  ) {
    this.selectcity = new EventEmitter();
  }
  ngOnInit() {
    this.loadDomesticAirports();
    this.loadInternationalAirports();
    this.initHistoryCities();
    this.initListCity();
    this.openCloseSubscription = this.flightService
      .getOpenCloseSelectCityPageSources()
      .subscribe(open => {
        this.openclose = open;
      });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.openCloseSubscription.unsubscribe();
  }
  initHistoryCities() {
    const hcs = window.localStorage.getItem("historyCities");
    if (hcs) {
      this.historyCities = JSON.parse(hcs);
    }
  }
  goToCity(nav: {
    link: string;
    displayName?: string;
    rect?: DOMRect | ClientRect;
    offsetTop?: number;
  }) {
    this.showCurTargetNavEle(true);
    // console.log(`开始查找元素[data-id=${nav.link}]`);
    let sT = Date.now();
    this.content.scrollToPoint(0, Math.floor(nav.offsetTop));
    // console.log(
    //   `完成${nav.link},${nav.offsetTop}滚动耗时 ${Date.now() - sT} ms`
    // );
    sT = Date.now();
    // this.isMovingSj.next(true);

    // this.curTargetNavSj.next(nav.displayName);
    if (this.curNavTextEle) {
      this.curNavTextEle.textContent = nav.displayName;
    }
    return false;
  }
  initListCity() {
    this.listCities = MOCK_CITI_DATA.map(c => {
      return {
        ...c,
        items: c.items.map(i => {
          const item: FlyCityItemModel = new FlyCityItemModel();
          item.CityName = i.cityName;
          item.Code = i.cityId + "";
          item.Selected = i.selected;
          item.IsHot = Math.floor(Math.random() * 10000) % 2 == 0;
          return item;
        })
      };
    });
  }
  showCurTargetNavEle(show: boolean) {
    if (show) {
      this.render.addClass(this.curTargetNavEle, "show");
    } else {
      this.render.removeClass(this.curTargetNavEle, "show");
    }
  }
  loadDomesticAirports() {
    this.domesticAirportsSubscription = this.flightService
      .getDomesticAirports()
      .subscribe(
        airports => {
          console.log(airports);
        },
        e => {}
      );
  }
  loadInternationalAirports() {
    this.internationnalAirportsSubscription = this.flightService
      .getDomesticAirports()
      .subscribe(
        airports => {
          console.log(airports);
        },
        e => {}
      );
  }
  ngAfterViewInit() {
    this.cnt = document.getElementById("mainCnt");
    this.curNavTextEle = document.getElementById("curNavText");
    this.curTargetNavEle = document.querySelector(".curTargetNav");
    if (this.plt.is("ios")) {
      this.render.setStyle(this.cnt, "width", "90vw");
    }
    const nav = (this.linksNavEle = document.getElementById("links")); // 这里是右边的字母
    let lastTime = Date.now();
    if (!nav) {
      return;
    }
    fromEvent(nav, "touchstart")
      .pipe(
        tap(() => {
          this.showCurTargetNavEle(true);
          lastTime = Date.now();
          let tempc = [];
          this.listCities.map(c => {
            tempc = [...tempc, ...c.items];
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
            `完成${tempc.length}个元素位置初始化耗時：${Date.now() - lastTime}`
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
                  if (evt.changedTouches && evt.changedTouches.length) {
                    const touch = evt.changedTouches[0];
                    // this.cities.map(c => {
                    //   if (
                    //     c.rect &&
                    //     c.rect.top <= touch.pageY &&
                    //     touch.pageY >= c.rect.bottom
                    //   ) {
                    //     this.goToCity(c);
                    //   }
                    // });
                    // const ele = document.elementFromPoint(
                    //   touch.pageX,
                    //   touch.pageY
                    // );
                    // if (ele && ele.tagName === "A") {
                    //   this.listCities.map(el => {
                    //     // console.log(el.link);
                    //     if (
                    //       el.link === ele.innerHTML ||
                    //       el.displayName === ele.innerHTML
                    //     ) {
                    //       this.goToCity(el);
                    //     }
                    //   });
                    // }
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
              this.goToCity(c);
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
        this.goToCity(el);
      }
    });
  }
  onCitySelected(
    city: FlyCityItemModel,
    keepPos?: boolean,
    isUserSelect?: boolean
  ) {
    const st = Date.now();

    city.Selected = true;
    this.selectedCity = city;
    // this.cities.map(c => {
    //   if (c.items) {
    //     c.items.forEach(sub => {
    //       sub.selected = city.Code === sub.Code;
    //     });
    //   }
    // });
    this.hotCities.map(hc => {
      hc.Selected = hc.Code === city.Code;
    });
    if (!keepPos) {
      // 保持历史选择城市位置不变
      this.historyCities = [
        city,
        ...this.historyCities
          .map(hc => {
            return { ...hc, Selected: false };
          })
          .filter(c => !(c.Code === city.Code))
          // 取消前三个用于显示 hot history cur 的元素
          .slice(0, 3)
      ];
    } else {
      this.historyCities = this.historyCities.map(hisc => {
        return {
          ...hisc,
          Selected: hisc.Code === city.Code
        };
      });
    }
    window.localStorage.setItem(
      "historyCities",
      JSON.stringify(this.historyCities)
    );
    if (isUserSelect) {
      this.goBack();
    }
    console.log("选择某个城市耗时：" + (Date.now() - st) + " ms");
    return false;
  }
}
