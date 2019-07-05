import { FlightPolicy } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { HrService, StaffEntity } from "./../../hr/hr.service";
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
  BehaviorSubject
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
import { tap, takeUntil, switchMap, delay } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from "../select-fly-days/flyday.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { DayModel } from "../models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { FlightCabinEntity } from "../models/flight/FlightCabinEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";
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
  searchFlightCondition: SearchFlightModel;
  filterCondition: FilterConditionModel;
  @ViewChild("cnt") cnt: IonContent;
  flightJourneyList: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  advSCondSub = Subscription.EMPTY;
  selectedFlyDaysSub = Subscription.EMPTY;
  vmFlightJourneyList: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrdL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isRoundTrip: boolean; // 是否是往返
  loading = true;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSj: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  private staff: StaffEntity;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private ngZone: NgZone,
    private flyDayService: FlydayService,
    private hrService: HrService,
    private identityService: IdentityService
  ) {
    this.hasDataSj = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flightJourneyList = [];
    this.searchFlightCondition = new SearchFlightModel();
    this.route.queryParamMap.subscribe(async d => {
      this.staff = await this.hrService.getStaff();
      console.log("staff ", this.staff);
      console.log("路由参数：", d);
      if (d.get("searchFlightModel")) {
        this.searchFlightCondition = JSON.parse(d.get("searchFlightModel"));
        this.isRoundTrip = this.searchFlightCondition.IsRoundTrip;
      }
      if (d.get("fromCity")) {
        // console.log("路由参数：",d.data);
        this.vmFromCity = JSON.parse(d.get("fromCity"));
      }
      if (d.get("toCity")) {
        // console.log("路由参数：",d.data);
        this.vmToCity = JSON.parse(d.get("toCity"));
      }
      // console.log(this.s);
    });
    this.showAdvSearchPage$ = this.flightService.getFilterPanelShow();
  }
  async isStaffTypeSelf() {
    const s = await this.hrService.getStaff();
    return s.BookType == StaffBookType.Self;
  }
  onCalenderClick() {}
  bookFlight() {
    this.router.navigate([AppHelper.getRoutePath("book-flight")]);
  }
  onChangedDay(day: DayModel) {
    if (!day || this.searchFlightCondition.Date == day.date || this.loading) {
      return;
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab =
      this.filterCondition &&
      Object.keys(this.filterCondition)
        .filter(key => key != "priceFromL2H" && key != "timeFromM2N")
        .some(
          key =>
            this.filterCondition[key] ||
            (this.filterCondition[key] instanceof Array &&
              this.filterCondition[key].length)
        )
        ? "filter"
        : "none";
    // console.log("active tab", this.activeTab);
    this.searchFlightCondition.Date = day.date;
    this.vmFlights = [];
    this.doRefresh(true);
  }
  async onBookTicket(evt: {
    cabin: FlightCabinEntity;
    flightSegment: FlightSegmentEntity;
  }) {
    this.staff = await this.hrService.getStaff();
    if (!this.isStaffTypeSelf()) {
      if (this.flightService.getSelectedPassengers.length === 0) {
        const ok = await AppHelper.alert(
          LanguageHelper.getSelectPassengersTip(),
          true,
          LanguageHelper.getConfirmTip()
        );
        if (ok) {
          this.goToSelectPassengerPage();
        }
      } else {
        const ok = await AppHelper.alert(
          LanguageHelper.getSelectPassengersTip(),
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (ok) {
          this.goToSelectPassengerPage();
        }
      }
    } else {
    }
  }
  goToSelectPassengerPage() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  async doRefresh(keepSearchCondition?: boolean) {
    // console.log(evt);
    this.flightService.setResetFilerCondition(!keepSearchCondition);
    if (!keepSearchCondition) {
      this.filterCondition = new FilterConditionModel();
      setTimeout(() => {
        this.activeTab = "none";
      }, 0);
    }
    this.vmFlights = [];
    const data = await this.loadData();
    this.loading = true;
    await this.renderView(data);
    this.loading = false;
    this.hasDataSj.next(!!this.vmFlights.length);
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(300);
      }
    }, 300);
  }
  private async loadData() {
    const flightJourneyList = (this.flightJourneyList = await this.flightService.searchFlightJourneyDetailList(
      this.searchFlightCondition
    ));
    const filteredFlightJourneyList = await this.filterFlightJourneyList(
      flightJourneyList
    );
    if (this.isStaffTypeSelf()) {
      const identity = await this.identityService.getIdentityPromise();
      const flights = await this.flightService.policyflights(
        filteredFlightJourneyList,
        [identity.Id]
      );
      if (flights.length) {
        this.flightJourneyList = await this.replaceCabinInfo(
          flights[0].FlightPolicies,
          this.flightJourneyList
        );
      }
    }
    return filteredFlightJourneyList;
  }
  private async renderView(filteredFlightJourneyList: FlightJourneyEntity[]) {
    return new Promise(s => {
      this.loading = true;
      const st = Date.now();
      const pageSize = 5;
      const totalFilteredSegments = this.flightService.getTotalFlySegments(
        filteredFlightJourneyList
      );
      console.log(
        `totalFilteredSegments.length=${totalFilteredSegments.length}`
      );
      const loop = () => {
        const slice = totalFilteredSegments.splice(0, pageSize);
        slice.forEach(item => {
          this.vmFlights.push(item);
        });
        console.log(
          `looping , ${Date.now() - st} ms `,
          this.vmFlights.length,
          totalFilteredSegments.length
        );
        if (totalFilteredSegments.length) {
          window.requestAnimationFrame(loop);
        } else {
          console.log(`loopEnd ,总耗时： ${Date.now() - st} ms `);
          s(true);
        }
      };
      loop();
    });
  }
  private async replaceCabinInfo(
    flightPolicies: FlightPolicy[],
    flights: FlightJourneyEntity[]
  ) {
    if (flightPolicies && flightPolicies.length && flights && flights.length) {
      flights.forEach(f => {
        f.FlightRoutes.forEach(r => {
          r.FlightSegments.forEach(s => {
            const cabins = flightPolicies.filter(fp => fp.FlightNo == s.Number);
            if (cabins.length) {
              cabins.forEach(c => {
                s.Cabins.forEach(sc => {
                  if (sc.Code == c.CabinCode) {
                    sc.Discount = c.Discount;
                    sc.IsAllowOrder = c.IsAllowBook;
                    sc.LowerSegment = {
                      ...sc.LowerSegment,
                      ...c.LowerSegment
                    };
                    // sc.Rules = c.Rules;
                  }
                });
              });
            }
          });
        });
      });
    }
    return flights;
  }
  onItemClick(f: FlightSegmentEntity) {
    // console.log(f);
    this.router.navigate([
      AppHelper.getRoutePath("flight-detail"),
      { flightSegment: JSON.stringify(f) }
    ]);
  }
  private filterFlightJourneyList(flys: FlightJourneyEntity[]) {
    let result = flys;
    if (!this.filterCondition) {
      return result;
    }
    if (
      this.filterCondition.airCompanies &&
      this.filterCondition.airCompanies.length > 0
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.airCompanies.some(a => a.id === s.Airline)
          );
          return r;
        });
        return fly;
      });
    }
    if (
      this.filterCondition.airports &&
      this.filterCondition.airports.length > 0
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.airports.some(a => a.id === s.ToAirport)
          );
          return r;
        });
        return fly;
      });
    }
    if (
      this.filterCondition.airTypes &&
      this.filterCondition.airTypes.length > 0
    ) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.airTypes.some(a => a.id === s.PlaneType)
          );
          return r;
        });
        return fly;
      });
    }
    if (this.filterCondition.cabins && this.filterCondition.cabins.length > 0) {
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s =>
            this.filterCondition.cabins.some(
              a => FlightCabinType[a.id] === s.LowestCabinType
            )
          );
          return r;
        });
        return fly;
      });
    }
    if (this.filterCondition.takeOffTimeSpan) {
      console.log(this.filterCondition.takeOffTimeSpan);
      result = result.map(fly => {
        fly.FlightRoutes = fly.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => {
            // console.log(moment(s.TakeoffTime).hour());
            return (
              this.filterCondition.takeOffTimeSpan.lower <=
                moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() &&
              (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() <
                this.filterCondition.takeOffTimeSpan.upper ||
                (moment(s.TakeoffTime, "YYYY-MM-DDTHH:mm:ss").hour() ==
                  this.filterCondition.takeOffTimeSpan.upper &&
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
    this.advSCondSub = this.flightService
      .getFilterCondition()
      .subscribe(filterCondition => {
        console.log("高阶查询", filterCondition);
        this.filterCondition = filterCondition || new FilterConditionModel();
        if (this.filterCondition) {
          this.vmFlights = [];
          // this.filterFlightJourneyList();
        }
      });
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
          this.searchFlightCondition.Date = day.date;
          this.vmFlights = [];
          this.doRefresh(null);
        }
      });
  }
  ngOnDestroy() {
    this.selectedFlyDaysSub.unsubscribe();
    this.advSCondSub.unsubscribe();
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
                  this.ngZone.run(() => {});
                })
              )
            )
          )
        )
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          console.log("正在滚动");
        });
      });
  }
  onFilter() {
    this.activeTab = "filter";
    this.flightService.setFilterPanelShow(true);
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
  private sortFlights(key: "price" | "time") {
    this.vmFlights = [];
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrdL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
    }
    const vmFlights = this.filterFlightJourneyList(this.flightJourneyList);
    this.vmFlightJourneyList = this.getSortedFlightJourneys(
      vmFlights,
      this.filterCondition
    );
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(300);
      }
    }, 300);
  }
  private getSortedFlightJourneys(
    flysegs: FlightJourneyEntity[],
    data: FilterConditionModel
  ) {
    if (data.priceFromL2H !== "initial") {
      // 按照价格排序
      return this.sortByPrice(flysegs, data.priceFromL2H == "low2Height");
    }
    if (data.timeFromM2N !== "initial") {
      // 按照时间排序
      return this.sortByTime(flysegs, data.timeFromM2N == "am2pm");
    }
    return flysegs;
  }
  private sortByPrice(arr: FlightJourneyEntity[], l2h: boolean) {
    return arr.map(item => {
      item.FlightRoutes = item.FlightRoutes.map(r => {
        r.FlightSegments.sort((s1, s2) => {
          let sub = +s1.LowestFare - +s2.LowestFare;
          sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
          return l2h ? sub : -sub;
        });
        return r;
      });
      return item;
    });
  }
  private sortByTime(arr: FlightJourneyEntity[], l2h: boolean) {
    return arr.map(item => {
      item.FlightRoutes = item.FlightRoutes.sort((s1, s2) => {
        let sub =
          +moment(s1.FirstTime, "YYYY-MM-DDTHH:mm:ss") -
          +moment(s2.FirstTime, "YYYY-MM-DDTHH:mm:ss");
        sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
        // console.log("时间排序，l2h",sub);
        return l2h ? sub : -sub;
      });
      return item;
    });
  }
}
