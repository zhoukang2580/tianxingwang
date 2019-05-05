import { IonContent, Platform } from "@ionic/angular";
import { takeUntil, tap, switchMap, filter } from "rxjs/operators";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  ElementRef
} from "@angular/core";
import { map } from "rxjs/operators";
import {
  Observable,
  fromEvent,
  BehaviorSubject,
  Subject,
  Subscription
} from "rxjs";
import { ListCityModel } from "./models/ListCityModel";
import { CityService } from "./city.service";
import { FlyCityItemModel } from "./models/CityItemModel";
import { MapPointModel } from '../models/MapPointModel';
import { MapService } from '../../services/map/map.service';
@Component({
  selector: "app-select-city",
  templateUrl: "./select-city.page.html",
  styleUrls: ["./select-city.page.scss"]
})
export class SelectCityPage implements OnInit, AfterViewInit {
  curPos$: Observable<MapPointModel>;
  hotCities: FlyCityItemModel[] = [];
  // curTargetNavSj: Subject<string>;
  isMovingSj: Subject<boolean>;
  @ViewChild("cnt")
  content: IonContent;
  selectedCity: FlyCityItemModel;
  historyCities: FlyCityItemModel[] = [];
  cities: ListCityModel[] = [];
  citySub = Subscription.EMPTY;
  cnt: HTMLElement;
  curNavText: HTMLElement;
  isUserSelect: boolean;
  constructor(
    private mapSer: MapService,
    private plt: Platform,
    private cityService: CityService,
    private render: Renderer2
  ) {
    this.isMovingSj = new BehaviorSubject(false);
    // this.curTargetNavSj = new BehaviorSubject(null);
  }
  ngOnInit() {
    this.curPos$ = this.mapSer.getCurAMapPos().pipe(map(p => p));
    this.initHistoryCities();
    this.initListCity();
    this.citySub = this.cityService.getSelectedCity().subscribe(city => {
      if (city) {
        console.log("选中的城市：" + city.Nickname);
        for (let i = 0; i < this.cities.length; i++) {
          const c = this.cities[i];
          if (c.items) {
            const sc = c.items.find(ci => {
              return ci && ci.Code === city.Code;
            });
            console.log("匹配到的城市：", sc);
            if (sc) {
              sc.selected = true;
              this.selectedCity = sc;
              this.onCitySelected(sc, true);
              break;
            }
          }
        }
      }
    });
  }
  initHistoryCities() {
    const hisC = window.localStorage.getItem("historyCities");
    if (hisC) {
      const hcs = JSON.parse(hisC) as FlyCityItemModel[];
      // console.log(hcs);
      this.selectedCity = hcs.find(item => item.selected) || this.selectedCity;
      this.historyCities = hcs;
    }
  }
  goToCity(nav: {
    link: string;
    displayName?: string;
    rect?: DOMRect | ClientRect;
    offsetTop?: number;
  }) {
    // console.log(`开始查找元素[data-id=${nav.link}]`);
    let sT = Date.now();
    this.content.scrollToPoint(0, Math.floor(nav.offsetTop));
    console.log(
      `完成${nav.link},${nav.offsetTop}滚动耗时 ${Date.now() - sT} ms`
    );
    sT = Date.now();
    // this.isMovingSj.next(true);

    // this.curTargetNavSj.next(nav.displayName);
    if (this.curNavText) {
      this.curNavText.textContent = nav.displayName;
    }
    return false;
  }
  initListCity() {
    this.cityService
      .getListCity()
      .pipe(
        map(cs => [
          { link: "cur", displayName: "当前" },
          { link: "history", displayName: "历史" },
          { link: "hot", displayName: "热门" },
          ...cs
        ])
      )
      .subscribe(
        cities => {
          this.cities = cities;
          this.initHostCities(cities);
        },
        e => {
          console.log("获取城市列表失败", e);
        }
      );
  }
  initHostCities(cities: ListCityModel[]) {
    if (!cities) {
      return;
    }
    cities.forEach(c => {
      if (c.items) {
        c.items.forEach(sub => {
          if (sub.IsHot && !this.hotCities.find(hc => hc.Code === sub.Code)) {
            this.hotCities.push(sub);
          }
        });
      }
    });
  }
  ngAfterViewInit() {
    this.cnt = document.getElementById("mainCnt");
    this.curNavText = document.getElementById("curNavText");
    if (this.plt.is("ios")) {
      this.render.setStyle(this.cnt, "width", "90%");
    }
    const nav = document.getElementById("links"); // 这里是右边的字母
    let lastTime = Date.now();
    if (!nav) {
      return;
    }
    fromEvent(nav, "touchstart")
      .pipe(
        tap(() => {
          this.isMovingSj.next(true);
          lastTime = Date.now();
          let tempc = [];
          this.cities.map(c => {
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
            // tap(evt => {
            //   this.isMovingSj.next(true);
            // }),
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
                    const ele = document.elementFromPoint(
                      touch.pageX,
                      touch.pageY
                    );
                    if (ele && ele.tagName === "A") {
                      this.cities.map(el => {
                        // console.log(el.link);
                        if (
                          el.link === ele.innerHTML ||
                          el.displayName === ele.innerHTML
                        ) {
                          this.goToCity(el);
                        }
                      });
                    }
                  }
                  setTimeout(() => {
                    this.isMovingSj.next(false);
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
          this.cities.map(c => {
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
    if (this.selectedCity) {
      this.cityService.setSelectedCity(this.selectedCity);
    }
    this.cityService.setShowPage(false);
  }
  onCitySelected(
    city: FlyCityItemModel,
    keepPos?: boolean,
    isUserSelect?: boolean
  ) {
    const st = Date.now();
    city.selected = true;
    this.selectedCity = city;
    this.cities.map(c => {
      if (c.items) {
        c.items.forEach(sub => {
          sub.selected = city.Code === sub.Code;
        });
      }
    });
    this.hotCities.map(hc => {
      hc.selected = hc.Code === city.Code;
    });
    if (!keepPos) {
      // 保持历史选择城市位置不变
      this.historyCities = [
        city,
        ...this.historyCities
          .map(hc => {
            return { ...hc, selected: false };
          })
          .filter(c => !(c.Code === city.Code))
          // 取消前三个用于显示 hot history cur 的元素
          .slice(0, 3)
      ];
    } else {
      this.historyCities = this.historyCities.map(hisc => {
        return {
          ...hisc,
          selected: hisc.Code === city.Code
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
