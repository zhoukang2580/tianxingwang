import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import { IonContent, IonRefresher, IonInfiniteScroll } from "@ionic/angular";
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
  OnDestroy,
  NgZone
} from "@angular/core";
import { tap, takeUntil, switchMap, delay, finalize } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from "../select-fly-days/flyday.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { AdvSearchCondModel } from "../models/flight/advanced-search-cond/AdvSearchCondModel";
import { DayModel } from "../models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"],
  animations: [
    trigger("showFooterAnimate", [
      state("true", style({ height: "*" })),
      state("false", style({ height: 0 })),
      transition("false<=>true", animate("100ms ease-in-out"))
    ]),
    trigger("showAdvSearchPage", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("false<=>true", animate("200ms ease-in-out"))
    ]),
    trigger("showSelectFlyDayPage", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("false<=>true", animate("200ms ease-in-out"))
    ]),
    trigger("openClose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0px" })),
      transition("false <=> true", animate(500))
    ])
  ]
})
export class FlightListPage implements OnInit, AfterViewInit, OnDestroy {
  sortCondition: SearchFlightModel;
  openSelectCity$: Observable<boolean>;
  @ViewChild("cnt")
  cnt: IonContent;
  flights: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  toCityName: string; // 到达城市名称
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  flightsSub = Subscription.EMPTY;
  flyCitiesSub = Subscription.EMPTY;
  advSCondSub = Subscription.EMPTY;
  intervalSub = Subscription.EMPTY;
  selectedFlyDaysSub = Subscription.EMPTY;
  totalFlySegments: FlightSegmentEntity[];
  priceOrdL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isRoundTrip: boolean; // 是否是往返
  refresher: IonRefresher;
  scroller: IonInfiniteScroll;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  isMoving$: Observable<boolean>;
  hasDataSj: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  private autoRefreshSj: Subject<boolean>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flyService: FlightService,
    private ngZone: NgZone,
    private flyDayService: FlydayService
  ) {
    this.openSelectCity$ = flyService.getOpenCloseSelectCityPageSources();
    this.hasDataSj = new BehaviorSubject(false);
    this.autoRefreshSj = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flights = [];
    this.route.queryParamMap.subscribe(async d => {
      if (d.get("searchFlightModel")) {
        // console.log("路由参数：",d.get("searchFlightModel"));
        this.sortCondition = JSON.parse(d.get("searchFlightModel"));
        this.sortCondition.curPage = 1;
        this.sortCondition.pageSize = 5;
        this.isRoundTrip = this.sortCondition.isRoundTrip;
      }
      if (d.get("fromCity")) {
        // console.log("路由参数：",d.data);
        this.vmFromCity = JSON.parse(d.get("fromCity"));
      }
      if (d.get("toCity")) {
        // console.log("路由参数：",d.data);
        this.vmFromCity = JSON.parse(d.get("toCity"));
      }
      // console.log(this.s);
    });
    this.showAdvSearchPage$ = this.flyService.getShowAdvSearchConditions();
  }
  onCalenderClick() {}
  bookFlight() {
    this.router.navigate([AppHelper.getRoutePath("book-flight")]);
  }
  onChangedDay(day: DayModel) {
    if (!day || this.sortCondition.Date == day.date) {
      return;
    }
    this.sortCondition.PriceFromL2H = void 0;
    this.sortCondition.TimeFromM2N = void 0;
    this.activeTab =
      this.sortCondition.AdvSCon &&
      Object.keys(this.sortCondition.AdvSCon).some(
        key =>
          this.sortCondition.AdvSCon[key] ||
          (this.sortCondition.AdvSCon[key] instanceof Array &&
            this.sortCondition.AdvSCon[key].length)
      )
        ? "filter"
        : "none";
    // console.log("active tab", this.activeTab);
    this.sortCondition.Date = day.date;
    this.vmFlights = [];
    this.doRefresh(
      {
        target: this.refresher
      } as any,
      true
    );
  }
  doRefresh(evt: CustomEvent, keepSearchCondition?: boolean) {
    // console.log(evt);
    this.flyService.setResetAdvCond(!keepSearchCondition);
    this.refresher = evt && ((evt.target as any) as IonRefresher);
    this.sortCondition = {
      ...this.sortCondition,
      AdvSCon: keepSearchCondition
        ? this.sortCondition.AdvSCon
        : new AdvSearchCondModel()
    };
    this.sortCondition.curPage = 1;
    this.sortCondition.pageSize = 5;
    this.vmFlights = [];
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (!keepSearchCondition) {
      setTimeout(() => {
        this.activeTab = "none";
      }, 0);
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
    this.intervalSub = interval(50 * 1000)
      .pipe(takeUntil(this.autoRefreshSj.asObservable()))
      .subscribe(() => {
        // 五秒钟自动刷新一遍
        this.doRefresh(null);
      });
  }
  loadMore(evt: CustomEvent) {
    console.log(
      "loadmore",
      "curPage " + this.sortCondition.curPage,
      "totalFlySegments " + this.totalFlySegments.length
    );
    this.scroller = evt && ((evt.target as any) as IonInfiniteScroll);
    const slice = this.totalFlySegments.slice(
      (this.sortCondition.curPage - 1) * this.sortCondition.pageSize,
      this.sortCondition.curPage * this.sortCondition.pageSize
    );
    this.vmFlights = [...this.vmFlights, ...slice];
    // console.log("vmflights ", this.vmFlights);
    if (this.scroller) {
      this.scroller.complete();
      this.scroller.disabled = slice.length === 0;
    }
    this.sortCondition.curPage = slice.length
      ? this.sortCondition.curPage + 1
      : this.sortCondition.curPage;
  }
  private searchFlys() {
    console.log("高阶查询", this.sortCondition.AdvSCon);
    this.stopAutoRefresh(); // 停止自动刷新
    this.flightsSub = this.flyService
      .searchFlightList(this.sortCondition)
      .pipe(
        finalize(() => {
          if (this.scroller) {
            this.scroller.complete();
          }
          if (this.refresher) {
            this.refresher.complete();
          }
        })
      )
      .subscribe(flys => {
        this.flights = JSON.parse(JSON.stringify(flys)); // 深拷贝对象，数组
        const vmFlights = this.advSearch(flys, this.sortCondition);
        this.totalFlySegments = this.flyService.getTotalFlySegments(vmFlights);
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
        this.loadMore({
          target: this.scroller
        } as any);
        this.startAutoRefresh(); // 启动自动刷新
      });
  }

  onItemClick(f: FlightSegmentEntity) {
    // console.log(f);
    this.router.navigate([
      AppHelper.getRoutePath("flight-detail"),
      { flightSegment: JSON.stringify(f) }
    ]);
  }
  private advSearch(flys: FlightJourneyEntity[], data: SearchFlightModel) {
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
              a => FlightCabinType[a.id] === s.LowestCabinType
            )
          );
          return r;
        });
        return fly;
      });
    }
    if (data.AdvSCon.takeOffTimeSpan) {
      console.log(data.AdvSCon.takeOffTimeSpan);
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => {
            console.log(moment(s.TakeoffTime).hour());
            return (
              data.AdvSCon.takeOffTimeSpan.lower <=
                moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() &&
              (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() <
                data.AdvSCon.takeOffTimeSpan.upper ||
                (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() ==
                  data.AdvSCon.takeOffTimeSpan.upper &&
                  moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").minutes() == 0))
            );
          });
          return r;
        });
        return fly;
      });
    }
    // console.log(result);
    return result;
  }
  ngOnInit() {
    this.activeTab = "filter";
    this.advSCondSub = this.flyService
      .getAdvSConditions()
      .subscribe(advScond => {
        this.sortCondition.AdvSCon = advScond;
        if (this.sortCondition.AdvSCon) {
          console.log("高阶查询", this.sortCondition.AdvSCon);
          this.sortCondition.curPage = 1;
          this.sortCondition.pageSize = 5;
          this.vmFlights = [];
          if (this.scroller) {
            this.scroller.disabled = false;
          }
          this.searchFlys();
        }
      });
    this.startAutoRefresh();
    this.selectedFlyDaysSub = this.flyDayService
      .getSelectedFlyDays()
      .subscribe(days => {
        if (days && days.length) {
          console.log("选择的日期", days);
          if (this.isRoundTrip) {
          }
          const day = days[0];
          if (!day) {
            return;
          }
          this.sortCondition.Date = day.date;
          this.vmFlights = [];
          this.doRefresh({
            target: this.refresher
          } as any);
        }
      });
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
    // this.controlFooterShowHide();
  }
  controlFooterShowHide() {
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
                  this.ngZone.run(() => {
                    this.isMoving$ = of(false);
                  });
                })
              )
            )
          )
        )
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.isMoving$ = of(true);
          console.log("正在滚动");
        });
      });
  }
  onFilter() {
    this.activeTab = "filter";
    this.flyService.setShowAdvSearchConditions(true);
  }
  onTimeOrder() {
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortFlights("time");
  }
  onPriceOrder() {
    this.activeTab = "price";
    this.priceOrdL2H = !this.priceOrdL2H;
    this.sortFlights("price");
  }
  sortFlights(key: "price" | "time") {
    this.stopAutoRefresh();
    this.sortCondition.curPage = 1;
    this.sortCondition.pageSize = 5;
    this.vmFlights = [];
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    if (key === "price") {
      this.sortCondition.PriceFromL2H = this.priceOrdL2H;
      this.sortCondition.TimeFromM2N = void 0;
    }
    if (key === "time") {
      this.sortCondition.TimeFromM2N = this.timeOrdM2N;
      this.sortCondition.PriceFromL2H = void 0;
    }
    const vmFlights = this.advSearch(this.flights, this.sortCondition);
    this.totalFlySegments = this.flyService.sortedFlightSegments(
      this.flyService.getTotalFlySegments(vmFlights),
      this.sortCondition
    );
    this.loadMore({
      target: this.scroller
    } as any);
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(300);
      }
    }, 300);
    this.startAutoRefresh();
  }
}
