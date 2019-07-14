import { environment } from "src/environments/environment";
import { ApiService } from "src/app/services/api/api.service";
import { FlyFilterComponent } from "./../components/fly-filter/fly-filter.component";
import { FlightPolicy, SearchFlightModel, TripType } from "./../flight.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { HrService } from "../../hr/staff.service";
import { AppHelper } from "src/app/appHelper";
import { animate } from "@angular/animations";
import { trigger, state, style, transition } from "@angular/animations";
import { IonContent, IonRefresher } from "@ionic/angular";
import {
  Observable,
  Subscription,
  fromEvent,
  Subject,
  BehaviorSubject,
  from
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef
} from "@angular/core";
import { tap, takeUntil, switchMap, delay, map } from "rxjs/operators";
import * as moment from "moment";
import { FlydayService } from "../flyday.service";
import { DayModel } from "../models/DayModel";
import { FlightService, Trafficline } from "../flight.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { FlightJourneyEntity } from "../models/flight/FlightJourneyEntity";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";
import { FlyDaysCalendarComponent } from "../components/fly-days-calendar/fly-days-calendar.component";
import { Storage } from "@ionic/storage";
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
  searchFlightModel: SearchFlightModel;
  filterCondition: FilterConditionModel;
  @ViewChild("cnt") cnt: IonContent;
  @ViewChild("list") list: ElementRef<HTMLElement>;
  flightJourneyList: FlightJourneyEntity[]; // 保持和后台返回的数据一致
  vmFlights: FlightSegmentEntity[]; // 用于视图展示
  vmToCity: Trafficline;
  vmFromCity: Trafficline;
  filterConditionSubscription = Subscription.EMPTY;
  searchConditionSubscription = Subscription.EMPTY;
  selectDaySubscription = Subscription.EMPTY;
  loadDataSubscription = Subscription.EMPTY;
  vmFlightJourneyList: FlightJourneyEntity[];
  totalFilteredSegments: FlightSegmentEntity[];
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  loading = false;
  isFiltered = false;
  st = 0;
  goDate$: Observable<string>;
  @ViewChild(FlyFilterComponent) filterComp: FlyFilterComponent;
  @ViewChild(FlyDaysCalendarComponent)
  flyDaysCalendarComp: FlyDaysCalendarComponent;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  hasDataSource: Subject<boolean>;
  showAdvSearchPage$: Observable<boolean>;
  showSelectFlyDayPage$: Observable<boolean>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private ngZone: NgZone,
    private flyDayService: FlydayService,
    private hrService: HrService,
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.hasDataSource = new BehaviorSubject(false);
    this.vmFlights = [];
    this.flightJourneyList = [];
    this.searchFlightModel = new SearchFlightModel();
    this.goDate$ = flightService.getPassengerFlightSegmentSource().pipe(
      switchMap(item =>
        from(hrService.getStaff()).pipe(map(r => ({ staff: r, pfs: item })))
      ),
      map(({ staff, pfs }) => {
        if (
          staff &&
          staff.BookType == StaffBookType.Self &&
          pfs &&
          pfs[0] &&
          pfs[0].selectedInfo
        ) {
          const goflight = pfs[0].selectedInfo.find(
            it => it.tripType == TripType.departureTrip
          );
          if (goflight && goflight.flightSegment) {
            return moment(goflight.flightSegment.ArrivalTime).format(
              "YYYY-MM-DD HH:mm"
            );
          }
        }
        return "";
      })
    );
    this.route.queryParamMap.subscribe(async () => {
      this.flightService.setFilterPanelShow(false);
      if (!this.isStaffTypeSelf()) {
        // 必须先选择一个客户
        console.log("goToSelectPassengerPage ");
        this.goToSelectPassengerPage();
        return;
      }
    });
    this.showAdvSearchPage$ = this.flightService.getFilterPanelShow();
    this.searchConditionSubscription = flightService
      .getSearchFlightModelSource()
      .subscribe(s => {
        this.searchFlightModel = s;
        if (this.searchFlightModel) {
          // this.isRoundTrip = this.searchFlightModel.IsRoundTrip;
          this.vmFromCity = this.searchFlightModel.fromCity;
          this.vmToCity = this.searchFlightModel.toCity;
          if (!this.loading) {
            this.doRefresh(true, true);
          }
        }
      });
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
  async onChangedDay(day: DayModel, byUser: boolean) {
    if (
      byUser &&
      (!day || this.searchFlightModel.Date == day.date || this.loading)
    ) {
      return;
    }
    if (this.searchFlightModel.tripType == TripType.returnTrip) {
      const goFlight = this.flightService.getPassengerFlightSegments()[0];
      if (goFlight && goFlight.selectedInfo && goFlight.selectedInfo.length) {
        let goDay = moment(
          goFlight.selectedInfo.find(i => i.tripType == TripType.departureTrip)
            .flightSegment.ArrivalTime
        );
        goDay = moment(goDay.format("YYYY-MM-DD"));
        const backDate = day;
        if (+moment(backDate.date) < +goDay) {
          await AppHelper.toast(
            LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip(),
            1000,
            "middle"
          );
          return;
        }
      }
    } else {
      if (this.searchFlightModel.IsRoundTrip) {
        if (+moment(day.date) > +moment(this.searchFlightModel.BackDate)) {
          this.searchFlightModel.BackDate = moment(day.date)
            .add(1, "days")
            .format("YYYY-MM-DD");
        }
      }
    }
    if (!this.filterCondition) {
      this.filterCondition = FilterConditionModel.init();
    }
    this.filterCondition.priceFromL2H = "initial";
    this.filterCondition.timeFromM2N = "initial";
    this.activeTab =
      this.filterComp &&
      Object.keys(this.filterComp.userOps).some(k => this.filterComp.userOps[k])
        ? "filter"
        : "none";
    this.searchFlightModel.Date = day.date;
    this.flightService.setSearchFlightModel(this.searchFlightModel);
  }
  async onBookTicket() {
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
    try {
      this.moveDayToSearchDate();
      if (this.loading) {
        return;
      }
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
        this.loading = true;
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
      await this.renderFlightList2(segments);
      this.hasDataSource.next(!!this.vmFlights.length && !this.loading);
      if (this.refresher) {
        this.refresher.complete();
      }
      this.apiService.hideLoadingView();
      this.loading = false;
    } catch (e) {
      if (!environment.production) {
        console.error(e);
      }
      this.loading = false;
    }
  }
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(100);
      }
    }, 100);
  }
  private async loadPolicyedFlights() {
    if (this.loadDataSubscription) {
      this.loadDataSubscription.unsubscribe();
    }
    return new Promise<FlightJourneyEntity[]>(async s => {
      // 先获取最新的数据
      const isStaffTypeSelf = await this.isStaffTypeSelf();
      const identity = await this.identityService.getIdentityAsync();
      if (isStaffTypeSelf) {
        this.loadDataSubscription = this.flightService
          .getFlightJourneyDetailList(this.searchFlightModel)
          .pipe(
            switchMap(flightJourneyList => {
              return this.flightService
                .policyflights(flightJourneyList, [identity.Id])
                .pipe(map(flights => ({ flights, flightJourneyList })));
            })
          )
          .subscribe(
             ({ flights, flightJourneyList }) => {
              // 个人差标
              if (flights.length) {
                this.flightJourneyList = this.replaceCabinInfo(
                  flights,
                  flightJourneyList
                );
                s(flightJourneyList);
              } else {
                this.flightJourneyList = [];
                s([]);
              }
              console.log(
                `${this.searchFlightModel.Date} 共 ${
                  this.flightService.getTotalFlySegments(flightJourneyList)
                    .length
                }个航班`
              );
            },
            _ => {
              this.flightJourneyList = [];
              s([]);
            }
          );
      } else {
        this.loadDataSubscription = this.flightService
          .getFlightJourneyDetailList(this.searchFlightModel)
          .subscribe(
            async res => {
              // 角色： 代理和秘书、特殊
              const passengerFlightSegments = this.flightService.getPassengerFlightSegments();
              if (passengerFlightSegments.length) {
                // 过滤未选择航班的乘客
                const unSelectFlightSegmentPassengers = passengerFlightSegments
                  .filter(pf => pf.selectedInfo.length === 0)
                  .map(pf => pf.passenger);
                if (unSelectFlightSegmentPassengers.length) {
                  const flights = await this.flightService.policyflightsAsync(
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
                  const flights = await this.flightService.policyflightsAsync(
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
              s(res);
              console.log(
                `${this.searchFlightModel.Date} 共 ${
                  this.flightService.getTotalFlySegments(this.flightJourneyList)
                    .length
                }个航班`
              );
            },
            _ => {
              s([]);
            }
          );
      }
    });
  }
  async goToFlightCabinsDetails(fs: FlightSegmentEntity) {
    const validate = await this.flightService.validateReturnTripFlightSegment(
      fs
    );
    if (!validate) {
      AppHelper.alert(
        LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip(),
        true,
        LanguageHelper.getConfirmTip()
      );
      return;
    }
    this.flightService.setCurrentViewtFlightSegment(
      fs,
      this.flightService.getTotalFlySegments(this.flightJourneyList)
    );
    this.router.navigate([AppHelper.getRoutePath("flight-item-cabins")]);
  }

  private replaceCabinInfo(
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
      .subscribe(async days => {
        if (days && days.length) {
          console.log("选择的日期", days);
          const day = days[0];
          if (!day) {
            return;
          }
          if (this.searchFlightModel.tripType == TripType.returnTrip) {
            const goDay = this.flyDayService.generateDayModelByDate(
              this.searchFlightModel.Date
            );
            const backDay = day;
            if (backDay.timeStamp < goDay.timeStamp) {
              await AppHelper.toast(
                LanguageHelper.Flight.getBackDateCannotBeforeGoDateTip(),
                1000,
                "middle"
              );
              this.moveDayToSearchDate();
            }
            return;
          }
          if (this.searchFlightModel.Date != day.date) {
            this.searchFlightModel.Date = day.date;
            if (this.flyDaysCalendarComp) {
              this.flyDaysCalendarComp.onDaySelected(day);
            }
          }
          this.searchFlightModel.Date = day.date;
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
    if (this.searchFlightModel && this.searchFlightModel.Date) {
      this.moveDayToSearchDate();
      setTimeout(() => {
        this.doRefresh(true, false);
      }, 1000);
    }
    // console.dir(this.cnt);

    // this.controlFooterShowHide();
  }
  private moveDayToSearchDate(d?: DayModel) {
    if (this.flyDaysCalendarComp) {
      const day =
        d ||
        this.flyDayService.generateDayModelByDate(this.searchFlightModel.Date);
      setTimeout(() => {
        this.flyDaysCalendarComp.onDaySelected(day);
      }, 1200);
    }
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
    if (!this.filterCondition) {
      this.filterCondition = FilterConditionModel.init();
    }
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
    const segments = fs.map(s => {
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
