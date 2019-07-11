import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import { FlightPolicy } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { HrService, StaffEntity } from "./../../hr/hr.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import {
  IonContent,
  IonRefresher,
  IonInfiniteScroll,
  DomController,
  IonList
} from "@ionic/angular";
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
  NgZone,
  QueryList,
  ElementRef,
  ViewChildren
} from "@angular/core";
import { tap, takeUntil, switchMap, delay } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from "../flyday.service";
import { SearchFlightModel } from "../models/flight/SearchFlightModel";
import { DayModel } from "../models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { FlightCabinEntity } from "../models/flight/FlightCabinEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";
import { FlyDaysCalendarComponent } from "../components/fly-days-calendar/fly-days-calendar.component";
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
  private refMap = new WeakMap<FlightSegmentEntity, any>();
  searchFlightCondition: SearchFlightModel;
  filterCondition: FilterConditionModel;
  @ViewChild("cnt") cnt: IonContent;
  @ViewChild("list") list: ElementRef<HTMLElement>;
  flightJourneyList: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  filterConditionSubscription = Subscription.EMPTY;
  selectDaySubscription = Subscription.EMPTY;
  vmFlightJourneyList: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  isRoundTrip: boolean; // 是否是往返
  loading = true;
  isFiltered = false;
  st = 0;
  @ViewChild(FlyFilterComponent) filterComp: FlyFilterComponent;
  @ViewChild(FlyDaysCalendarComponent)
  flyDaysCalendarComp: FlyDaysCalendarComponent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSource: Subject<boolean>;
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
    private apiService: ApiService,
    private identityService: IdentityService,
    private domCtrl: DomController
  ) {
    this.hasDataSource = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flightJourneyList = [];
    this.searchFlightCondition = new SearchFlightModel();
    this.route.queryParamMap.subscribe(async d => {
      this.flightService.setFilterPanelShow(false);
      this.staff = await this.hrService.getStaff();
      if (
        !this.isStaffTypeSelf()
        //  &&        this.flightService.getPassengerFlightSegments().length === 0
      ) {
        // 必须先选择一个客户
        console.log("goToSelectPassengerPage ");
        this.goToSelectPassengerPage();
        return;
      }
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
    return s.BookType && s.BookType == StaffBookType.Self;
  }
  onCalenderClick() {
    this.flyDayService.setFlyDayMulti(false);
    this.flyDayService.showFlyDayPage(true);
  }
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
      this.filterComp &&
      Object.keys(this.filterComp.userOps).some(k => this.filterComp.userOps[k])
        ? "filter"
        : "none";
    this.searchFlightCondition.Date = day.date;
    this.doRefresh(true, true);
  }
  async onBookTicket(evt: {
    cabin: FlightCabinEntity;
    flightSegment: FlightSegmentEntity;
  }) {
    this.staff = await this.hrService.getStaff();
    if (!this.isStaffTypeSelf()) {
      if (this.flightService.getPassengerFlightSegments.length === 0) {
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
  async doRefresh(loadDataFromServer: boolean, keepSearchCondition: boolean) {
    this.apiService.showLoadingView();
    // 如果不是个人，则必须先选择一个客户
    if (
      !this.isStaffTypeSelf() &&
      this.flightService.getPassengerFlightSegments().length === 0
    ) {
      this.goToSelectPassengerPage();
      return;
    }
    if (!keepSearchCondition) {
      if (this.filterComp) {
        this.filterComp.onReset();
      }
      this.filterCondition = FilterConditionModel.init();
      setTimeout(() => {
        this.activeTab = "none";
      }, 0);
    }
    this.vmFlights = [];
    this.loading = true;
    let data = this.flightJourneyList;
    this.hasDataSource.next(false);
    if (loadDataFromServer) {
      // 强制从服务器端返回新数据
      data = await this.loadPolicyedFlights();
    }
    // 根据筛选条件过滤航班信息：
    const filteredFlightJourenyList = this.filterFlightJourneyList(data);
    this.isFiltered =
      this.filterComp &&
      Object.keys(this.filterComp.userOps).some(
        k => this.filterComp.userOps[k]
      );
    const segments = this.flightService.getTotalFlySegments(
      filteredFlightJourenyList
    );
    this.st = Date.now();
    this.vmFlights = segments;
    this.renderFlightList2(segments);
    this.loading = false;
    this.hasDataSource.next(!!this.vmFlights.length && !this.loading);
    if (this.refresher) {
      this.refresher.complete();
    }
    this.apiService.hideLoadingView();
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(100);
      }
    }, 100);
  }
  private async loadPolicyedFlights() {
    // 先获取最新的数据
    this.flightJourneyList = await this.flightService.getFlightJourneyDetailList(
      this.searchFlightCondition
    );
    console.log(
      `${this.searchFlightCondition.Date} 共 ${
        this.flightService.getTotalFlySegments(this.flightJourneyList).length
      }个航班`
    );
    // 配置差标
    if (this.isStaffTypeSelf()) {
      // 个人差标
      if (this.flightJourneyList.length) {
        const identity = await this.identityService.getIdentityPromise();
        const flights = await this.flightService.policyflights(
          this.flightJourneyList,
          [identity.Id]
        );
        if (flights.length) {
          this.flightJourneyList = await this.replaceCabinInfo(
            flights,
            this.flightJourneyList
          );
        }
      }
    } else {
      // 角色： 代理和秘书、特殊
      const passengerFlightSegments = this.flightService.getPassengerFlightSegments();
      if (passengerFlightSegments.length) {
        // 过滤未选择航班的乘客
        const unSelectFlightSegmentPassengers = passengerFlightSegments
          .filter(pf => pf.selectedInfo.length === 0)
          .map(pf => pf.passenger);
        if (unSelectFlightSegmentPassengers.length) {
          const flights = await this.flightService.policyflights(
            this.flightJourneyList,
            unSelectFlightSegmentPassengers.map(p => p.AccountId)
          );
          if (flights.length) {
            this.flightJourneyList = await this.replaceCabinInfo(
              flights,
              this.flightJourneyList
            );
          }
        } else {
          // 重新获取全部人员的差标信息
          const flights = await this.flightService.policyflights(
            this.flightJourneyList,
            passengerFlightSegments
              .map(item => item.passenger)
              .map(p => p.AccountId)
          );
          if (flights.length) {
            this.flightJourneyList = await this.replaceCabinInfo(
              flights,
              this.flightJourneyList
            );
          }
        }
      } else {
        this.goToSelectPassengerPage();
      }
    }
    return this.flightJourneyList;
  }
  goToFlightCabinsDetails(fs: FlightSegmentEntity) {
    this.flightService.setCurrentViewtFlightSegment(
      fs,
      this.flightService.getTotalFlySegments(this.flightJourneyList)
    );
    this.router.navigate([AppHelper.getRoutePath("flight-item-cabins")]);
  }

  private async replaceCabinInfo(
    passengerPolicyflights: {
      PassengerKey: string;
      FlightPolicies: FlightPolicy[];
    }[],
    flights: FlightJourneyEntity[]
  ) {
    console.time("replaceCabinInfo");
    if (passengerPolicyflights && flights) {
      const passengerKeyFlightNoCabins = passengerPolicyflights.map(pf => {
        return {
          PassengerKey: pf.PassengerKey,
          FlightPolicy: pf.FlightPolicies.reduce(
            (obj, item) => {
              if (!obj[item.FlightNo]) {
                obj[item.FlightNo] = [item];
              } else {
                obj[item.FlightNo].push(item);
              }
              return obj;
            },
            {} as { [key: string]: FlightPolicy[] }
          )
        };
      });
      flights.forEach(f => {
        f.FlightRoutes.forEach(r => {
          r.FlightSegments.forEach(s => {
            passengerKeyFlightNoCabins.forEach(item => {
              s.PassengerKeys = s.PassengerKeys || [];
              if (!s.PassengerKeys.find(k => k == item.PassengerKey)) {
                s.PassengerKeys.push(item.PassengerKey);
              }
              if (item.FlightPolicy[s.Number]) {
                s.PoliciedCabins = item.FlightPolicy[s.Number];
                s.PoliciedCabins.forEach(pc => {
                  const sc = s.Cabins.find(
                    scabin => scabin.Code == pc.CabinCode
                  );
                  if (sc) {
                    pc.Cabin = sc;
                  }
                });
              }
            });
          });
        });
      });
      console.timeEnd("replaceCabinInfo");
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

  async ngOnInit() {
    // this.goToSelectPassengerPage();
    this.activeTab = "filter";
    this.filterConditionSubscription = this.flightService
      .getFilterCondition()
      .subscribe(filterCondition => {
        console.log("高阶查询", filterCondition);
        this.filterCondition = filterCondition;
        if (this.filterCondition) {
          // this.filterFlightJourneyList();
          this.doRefresh(false, true);
        }
      });
    this.selectDaySubscription = this.flyDayService
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
          if (this.searchFlightCondition.Date != day.date) {
            this.searchFlightCondition.Date = day.date;
            if (this.flyDaysCalendarComp) {
              this.flyDaysCalendarComp.onDaySelected(day);
            }
          }
          this.searchFlightCondition.Date = day.date;
          if (this.loading) {
            return;
          }
          this.doRefresh(true, false);
        }
      });
  }
  ngOnDestroy() {
    this.vmFlights = [];
    this.selectDaySubscription.unsubscribe();
    this.filterConditionSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.apiService.showLoadingView();
    if (this.searchFlightCondition && this.searchFlightCondition.Date) {
      if (this.flyDaysCalendarComp) {
        const day = this.flyDayService.generateDayModelByDate(
          this.searchFlightCondition.Date
        );
        setTimeout(() => {
          this.flyDaysCalendarComp.onDaySelected(day);
        }, 1200);
      }
      setTimeout(() => {
        this.doRefresh(true, false);
      }, 1000);
    }
    // console.dir(this.cnt);

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
  async onTimeOrder() {
    console.time("time");
    this.loading = true;
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    await this.sortFlights("time");
    this.loading = false;
    console.timeEnd("time");
  }
  async onPriceOrder() {
    console.time("price");
    this.loading = true;
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    await this.sortFlights("price");
    this.loading = false;
    console.timeEnd("price");
  }
  private async sortFlights(key: "price" | "time") {
    this.st = Date.now();
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrderL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
      const segments = await this.flightService.sortByPrice(
        this.vmFlights,
        this.priceOrderL2H
      );
      let isRerender = false;
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        const li = this.refMap.get(s);
        if (!li) {
          isRerender = true;
          break;
        }
        if (this.list) {
          const old = this.list.nativeElement.childNodes[i];
          this.list.nativeElement.insertBefore(li, old);
        }
      }
      if (isRerender) {
        console.log(`重新渲染整个列表`);
        this.renderFlightList2(segments);
      }
      // this.renderFlightList2(segments);
      this.scrollToTop();
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      const segments = await this.flightService.sortByTime(
        this.vmFlights,
        this.timeOrdM2N
      );
      let isRerender = false;
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        const li = this.refMap.get(s);
        if (!li) {
          isRerender = true;
          break;
        }
        if (this.list) {
          const old = this.list.nativeElement.childNodes[i];
          this.list.nativeElement.insertBefore(li, old);
        }
      }
      if (isRerender) {
        console.log(`重新渲染整个列表`);
        this.renderFlightList2(segments);
      }
      this.scrollToTop();
    }
  }

  private async renderFlightList2(fs: FlightSegmentEntity[]) {
    console.time("renderFlightList2");
    this.loading = true;
    const segments = fs.map((s, i) => {
      const template = `<div class='left'>
          <h4 class="time">
    <strong>${s.TakeoffShortTime}</strong>
              <span class="line">-----&nbsp;${
                s.IsStop ? `经停` : `直飞`
              }&nbsp;-----</span>
              <strong>${s.ArrivalShortTime}
                ${
                  s.AddOneDayTip
                    ? `<span class='addoneday'>${s.AddOneDayTip}</span>`
                    : ``
                }
              </strong>
          </h4>
          <div class="airports">
              <span>${s.FromAirportName}${
        s.FromTerminal ? `(${s.FromTerminal})` : ``
      }</span>
              <span>${s.ToAirportName}${
        s.ToTerminal ? `(${s.ToTerminal})` : ``
      }</span>
          </div>
          <div class="desc">
              <img src="${s.AirlineSrc}" class="airlinesrc">
              <label>${s.AirlineName}</label>
              <label>|${s.Number}</label>
              <label>|${s.PlaneType}</label>
              ${
                s.CodeShareNumber
                  ? `|<span class='code-share-number'>共享${
                      s.CodeShareNumber
                    }</span>`
                  : ``
              }
          </div>
      </div>
      <div class="price">
          ￥${s.LowestFare}
      </div>`;
      return {
        item: s,
        templateHtmlString: template
      };
    });
    //  segments = await this.flightService.getHtmlTemplate(fs, "");
    // console.log("getHtmlTemplate", segments);
    if (this.list) {
      this.list.nativeElement.innerHTML = "";
    }
    this.refMap = new WeakMap<FlightSegmentEntity, any>();
    segments.forEach(s => {
      const li = document.createElement("li");
      li.onclick = () => {
        this.goToFlightCabinsDetails(s.item);
      };
      li.classList.add("list-item");
      li.innerHTML = s.templateHtmlString;
      this.refMap.set(s.item, li);
      if (this.list) {
        this.list.nativeElement.appendChild(li);
      }
    });
    this.loading = false;
    this.scrollToTop();
    console.timeEnd("renderFlightList2");
  }
  private filterFlightJourneyList(flys: FlightJourneyEntity[]) {
    console.log(
      "filterFlightJourneyList",
      this.filterCondition,
      "flights",
      flys
    );
    let result = flys;
    if (!this.filterCondition) {
      return result;
    }
    if (this.filterCondition.onlyDirect) {
      result = result.map(f => {
        f.FlightRoutes = f.FlightRoutes.map(r => {
          r.FlightSegments = r.FlightSegments.filter(s => !s.IsStop);
          return r;
        });
        return f;
      });
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
      // console.log(this.filterCondition.takeOffTimeSpan);
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
}
