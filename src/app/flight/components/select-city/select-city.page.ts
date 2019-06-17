import { IonContent, Platform } from "@ionic/angular";
import { takeUntil, tap, switchMap } from "rxjs/operators";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  Input,
} from "@angular/core";
import {
  fromEvent,
  Subscription
} from "rxjs";
import { ListCityModel } from "./models/ListCityModel";
import { FlyCityItemModel } from "./models/CityItemModel";
import { citiesData as MOCK_CITI_DATA } from './cities.data';
@Component({
  selector: "app-select-city-comp",
  templateUrl: "./select-city.page.html",
  styleUrls: ["./select-city.page.scss"]
})
export class SelectCityComponent implements OnInit, AfterViewInit {
  @Input() cityData:FlyCityItemModel[];
  hotCities: FlyCityItemModel[] = [];
  @ViewChild("cnt")
  content: IonContent;
  selectedCity: FlyCityItemModel;
  historyCities: FlyCityItemModel[] = [];
  cities: ListCityModel[] = [];
  citySub = Subscription.EMPTY;
  cnt: HTMLElement;
  curTargetNavEle:HTMLElement;
  curNavTextEle: HTMLElement;
  isUserSelect: boolean;
  constructor(
    private plt: Platform,
    private render: Renderer2
  ) {
  }
  ngOnInit() {
    this.initHistoryCities();
    this.initListCity();
  }
  initHistoryCities() {
    this.historyCities=this.cityData.filter(c=>c.IsHot);
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
    if (this.curNavTextEle) {
      this.curNavTextEle.textContent = nav.displayName;
    }
    return false;
  }
  initListCity() {
   this.cities=MOCK_CITI_DATA;
  }
  showCurTargetNavEle(show:boolean){
    this.render.setStyle(this.curTargetNavEle,'display',`${show?"flex":"none"}`);
  }
  ngAfterViewInit() {
    this.cnt = document.getElementById("mainCnt");
    this.curNavTextEle = document.getElementById("curNavText");
    this.curTargetNavEle=document.querySelector(".curTargetNav");
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
          this.showCurTargetNavEle(true);
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
