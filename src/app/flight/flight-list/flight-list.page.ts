import { CityService } from "./../select-city/city.service";
import { TrafficlineModel } from "./../models/flight/TrafficlineModel";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import { IonContent, ModalController, IonRefresher, IonInfiniteScroll } from "@ionic/angular";
import { DayModel } from "./../models/DayModel";
import {
  Observable,
  Subscription,
  of,
  fromEvent,
  Subject,
  BehaviorSubject,
  interval
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { tap, takeUntil, switchMap, delay } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from '../select-fly-days/flyday.service';
import { SearchFlightModel } from '../models/flight/SearchFlightModel';
import { FlightJouneyModel } from '../models/flight/FlightJouneyModel';
import { FlightSegmentModel } from '../models/flight/FlightSegmentModel';
import { FlightService } from '../flight.service';
import { AdvSearchCondModel } from '../models/flight/advanced-search-cond/AdvSearchCondModel';
import { CabinTypeEnum } from '../models/flight/CabinTypeEnum';
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"],
  animations: [
    trigger("showFooterAnimate", [
      state("true", style({ height: "*" })),
      state("false", style({ height: 0 })),
      transition("false<=>true", animate("200ms ease-in-out"))
    ]),
    trigger("showAdvSearchPage", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("false<=>true", animate("200ms ease-in-out"))
    ]),
    trigger("showFlyDaySelectPage", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("false<=>true", animate("200ms ease-in-out"))
    ])
  ]
})
export class FlightListPage implements OnInit, AfterViewInit, OnDestroy {
  s: SearchFlightModel;
  @ViewChild("cnt")
  cnt: IonContent;
  flights: FlightJouneyModel[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentModel[]; // 用于视图展示
  toCityName: string; // 到达城市名称
  vmToCity$: Observable<TrafficlineModel>;
  vmFromCity$: Observable<TrafficlineModel>;
  flightsSub = Subscription.EMPTY;
  flyCitiesSub = Subscription.EMPTY;
  advSCondSub = Subscription.EMPTY;
  intervalSub = Subscription.EMPTY;
  selectedFlyDaysSub = Subscription.EMPTY;
  totalFlySegments: FlightSegmentModel[];
  priceOrdL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isRoundTrip: boolean; // 是否是往返
  refresher: IonRefresher;
  scroller: IonInfiniteScroll;
  activeTab: "filter" | "time" | "price"; // 当前激活的tab
  isMoving$: Observable<boolean>;
  hasDataSj: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showFlyDaySelectPage$: Observable<boolean>;
  private autoRefreshSj: Subject<boolean>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flyService: FlightService,
    private modal: ModalController,
    private flyDayService: FlydayService
  ) {
    this.hasDataSj = new BehaviorSubject(false);
    this.autoRefreshSj = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flights = [];
    this.route.params.subscribe(d => {
      if (d && d.data) {
        // console.log("路由参数：",d.data);
        this.s = JSON.parse(d.data);
        this.s.curPage = 1;
        this.s.pageSize = 5;
        this.isRoundTrip = this.s.isRoundTrip;
        this.vmFromCity$ = this.flyService.getFlyCityByCode(this.s.FromCode).pipe(tap(c => {
          console.log("出发城市：" + (c && c.CityName));
        }));
        this.vmToCity$ = this.flyService.getFlyCityByCode(this.s.ToCode).pipe(
          tap(t => {
            console.log("到达城市" + (t && t.CityName));
            this.toCityName = t && t.CityName;
          })
        );
      }
      // console.log(this.s);
    });
    this.showAdvSearchPage$ = this.flyService.getShowAdvSearchCond();
    this.showFlyDaySelectPage$ = this.flyDayService.getShowFlyDaySelectPage();
  }
  onCalenderClick() {
    this.flyDayService.setShowFlyDaySelectPage(true);
  }
  onChangedDay(day: DayModel) {
    if (!day) {
      return;
    }
    this.s.Date = day.date;
    this.vmFlights = [];
    this.doRefresh(null);
  }
  doRefresh(evt: CustomEvent) {
    // console.log(evt);
    this.flyService.setResetAdvCond(true);
    this.refresher = evt && ((evt.target as any) as IonRefresher);
    this.s = { ...this.s, AdvSCon: new AdvSearchCondModel() };
    this.s.curPage = 1;
    this.s.pageSize = 5;
    this.vmFlights = [];
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.searchFlys();
  }
  stopAutoRefresh() {
    this.autoRefreshSj.next(true);
    console.log("【停止了】自动刷新");
    this.intervalSub.unsubscribe();
  }
  startAutoRefresh() {
    console.log("【启动】自动刷新");
    this.intervalSub = interval(50 * 1000).pipe(takeUntil(this.autoRefreshSj.asObservable())).subscribe(() => {
      // 五秒钟自动刷新一遍
      this.doRefresh(null);
    });
  }
  loadMore(evt: CustomEvent) {
    console.log("loadmore", this.s.curPage, this.totalFlySegments.length);
    this.scroller = evt && evt.target as any as IonInfiniteScroll;
    const slice = this.totalFlySegments.slice((this.s.curPage - 1) * this.s.pageSize, this.s.curPage * this.s.pageSize);
    this.vmFlights = this.vmFlights.concat(slice);
    if (this.scroller) {
      this.scroller.complete();
      this.scroller.disabled = slice.length === 0;
    }
    this.s.curPage = slice.length ? this.s.curPage + 1 : this.s.curPage;
  }
  private searchFlys() {
    console.log("高阶查询", this.s.AdvSCon);
    this.stopAutoRefresh();// 停止自动刷新
    this.flightsSub = this.flyService
      .searchFlightList(this.s)
      .subscribe(flys => {
        this.flights = JSON.parse(JSON.stringify(flys)); // 深拷贝对象，数组
        const vmFlights = this.advSearch(flys, this.s);
        this.totalFlySegments = vmFlights.reduce((acc, fly) => {
          acc = [...acc, ...fly.FlightRoutes.reduce((frAcc, fr) => {
            frAcc = [...frAcc, ...fr.FlightSegments.reduce((frsAcc, s) => {
              frsAcc = [...frsAcc, s];
              return frsAcc;
            }, [])]
            return frAcc;
          }, [])]
          return acc;
        }, []);
        vmFlights.forEach(vf => {
          this.hasDataSj.next(
            vf.FlightRoutes.some(r => r.FlightSegments.length > 0)
          );
        });

        setTimeout(() => {
          if (this.cnt) {
            this.cnt.scrollToTop(300);
          }
        }, 300);
        if (this.refresher) {
          this.refresher.complete();
        }
        this.loadMore(null);
        this.startAutoRefresh();// 启动自动刷新
      });
  }
  onItemClick(f: FlightSegmentModel) {
    // console.log(f);
  }
  private advSearch(flys: FlightJouneyModel[], data: SearchFlightModel) {
    let result = flys;
    if (!data.AdvSCon) {
      return result;
    }
    if (data.AdvSCon.airCompanies && data.AdvSCon.airCompanies.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.airCompanies.some(a => a.id === s.Airline)
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.airports && data.AdvSCon.airports.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.airports.some(a => a.id === s.ToAirport)
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.airTypes && data.AdvSCon.airTypes.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.airTypes.some(a => a.id === s.PlaneType)
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.cabins && data.AdvSCon.cabins.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            data.AdvSCon.cabins.some(
              a => a.id === CabinTypeEnum[s.LowestCabinFareType]
            )
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.takeOffTimeSpan) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => {
            // console.log(moment(s.TakeoffTime).hour());
            return (
              data.AdvSCon.takeOffTimeSpan.lower <=
              moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() &&
              moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() <= data.AdvSCon.takeOffTimeSpan.upper
            );
          });
          return r;
        });
        return fly;
      });
      console.log(data.AdvSCon.takeOffTimeSpan, result);
    }
    // console.log(result);
    return result;
  }
  ngOnInit() {
    this.activeTab = "filter";
    this.advSCondSub = this.flyService.getAdvSCond().subscribe(advScond => {
      this.s.AdvSCon = advScond;
      if (this.s.AdvSCon) {
        console.log("高阶查询", this.s.AdvSCon);
        this.s.curPage = 1;
        this.s.pageSize = 5;
        this.vmFlights = [];
        if (this.scroller) {
          this.scroller.disabled = false;
        }
        this.searchFlys();
      }
    });
    this.startAutoRefresh();
    this.selectedFlyDaysSub = this.flyDayService.getSelectedFlyDays().subscribe(days => {
      console.log("选择的日期", days);
      if (this.isRoundTrip) {

      }
      const day = days[0];
      if (!day) {
        return;
      }
      this.s.Date = day.date;
      this.vmFlights = [];
      this.doRefresh(null);
    })
  }
  ngOnDestroy() {
    this.selectedFlyDaysSub.unsubscribe();
    this.advSCondSub.unsubscribe();
    this.intervalSub.unsubscribe();
    this.flightsSub.unsubscribe();
    this.flyCitiesSub = Subscription.EMPTY;
  }
  ngAfterViewInit() {
    // console.dir(this.cnt);
    this.doRefresh(null);
    const cnt = document.querySelector("ion-content");
    fromEvent(cnt, "touchmove")
      .pipe(
        switchMap(() =>
          this.cnt.ionScroll.pipe(
            delay(0),
            takeUntil(
              this.cnt.ionScrollEnd.pipe(
                tap(() => {
                  console.log("滚动停止");
                  this.isMoving$ = of(false);
                })
              )
            )
          )
        )
      )
      .subscribe(() => {
        this.isMoving$ = of(true);
        console.log("正在滚动");
      });
  }
  onFilter() {
    this.activeTab = "filter";
    this.flyService.setShowAdvSearchCond(true);
  }
  onTimeOrder() {
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortFlights("time");
    this.searchFlys();
  }
  onPriceOrder() {
    this.activeTab = "price";
    this.priceOrdL2H = !this.priceOrdL2H;
    this.sortFlights("price");
    this.searchFlys();
  }
  sortFlights(key: "price" | "time") {
    this.s.curPage = 1;
    this.s.pageSize = 5;
    this.vmFlights = [];
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (key === "price") {
      this.s.PriceFromL2H = this.priceOrdL2H;
      this.s.TimeFromM2N = void 0;
    }
    if (key === "time") {
      this.s.TimeFromM2N = this.timeOrdM2N;
      this.s.PriceFromL2H = void 0;
    }
  }
}
