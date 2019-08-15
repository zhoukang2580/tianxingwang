import { TrainSeatEntity } from "./../models/TrainSeatEntity";
import { TrainPassengerModel } from "./../train.service";
import { StaffService, StaffEntity } from "./../../hr/staff.service";
import { ApiService } from "./../../services/api/api.service";
import { CalendarService } from "./../../tmc/calendar.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import { TrainEntity } from "./../models/TrainEntity";
import {
  TrainService,
  SearchTrainModel,
  TrainPolicyModel
} from "src/app/train/train.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
  IonRefresher,
  IonContent,
  DomController,
  PopoverController,
  NavController,
  ModalController
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { DayModel } from "src/app/tmc/models/DayModel";
import { DaysCalendarComponent } from "src/app/tmc/components/days-calendar/days-calendar.component";
// tslint:disable-next-line: max-line-length
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import { Observable, of } from "rxjs";
import { SelectedTrainSegmentInfoComponent } from "../components/selected-train-segment-info/selected-train-segment-info.component";
import { FilterTrainCondition } from "../models/FilterCondition";
import { NOT_WHITE_LIST } from "src/app/tmc/select-passenger/select-passenger.page";
interface TrainSeatViewModal {
  train: TrainEntity;
  trainSeat: TrainSeatEntity;
}
@Component({
  selector: "app-train-list",
  templateUrl: "./train-list.page.html",
  styleUrls: ["./train-list.page.scss"]
})
export class TrainListPage implements OnInit {
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild(IonContent) cnt: IonContent;
  @ViewChild(DaysCalendarComponent) daysCalendarComp: DaysCalendarComponent;
  @ViewChild("list") list: ElementRef<HTMLElement>;
  private refMap = new WeakMap<TrainSeatViewModal, any>();
  trains: TrainEntity[]=[];
  vmTrainSeats: TrainSeatViewModal[];
  isLoading = false;
  isFiltered = false;
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  searchTrainModel: SearchTrainModel;
  timeoutid: any;
  isLeavePage = false;
  isShowAddPassengerButton = false;
  isShowRoundtripTip = false;
  policyTrains: TrainPassengerModel[];
  activeTab: "filter" | "time" | "price" | "none"; // 当前激活的tab
  selectedPassengersNumbers$: Observable<number> = of(0);
  goRoundTripDateTime$: Observable<{
    goArrivalDateTime: string;
    backDateTime: string;
  }>;
  priceOrderL2H: boolean; // 价格从低到高
  timeOrdM2N: boolean; // 时间从早到晚
  filterCondition: FilterTrainCondition;
  constructor(
    private tmcService: TmcService,
    private trainService: TrainService,
    private router: Router,
    private domCtrl: DomController,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private staffService: StaffService,
    private popoverController: PopoverController,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}
  ngOnInit() {
    this.route.queryParamMap.subscribe(_ => {
      this.onSearchCondition();
      this.isShowAddPassengerButton = !this.staffService.isSelfBookType;
      this.isShowRoundtripTip = this.staffService.isSelfBookType;
      this.isLeavePage = false;
    });
    this.doRefresh(true, true);
  }
  private onSearchCondition() {
    this.searchTrainModel = this.trainService.getSearchTrainModel();
    this.vmFromCity = this.searchTrainModel.fromCity;
    this.vmToCity = this.searchTrainModel.toCity;
  }
  private async loadPolicyedTrainsAsync(
    passengerId?: string
  ): Promise<TrainEntity[]> {
    // 先获取最新的数据
    this.trains = [];
    let trains = await this.trainService.searchAsync(this.searchTrainModel);
    if (trains.length == 0) {
      return [];
    }
    let passengers = this.getUnSelectPassengers();
    if (passengers.length == 0) {
      passengers = this.trainService.getBookInfos().map(info => info.passenger);
    }
    const hasreselect = this.trainService
      .getBookInfos()
      .find(item => item.isReplace);
    if (hasreselect) {
      if (
        !passengers.find(p => p.AccountId == hasreselect.passenger.AccountId)
      ) {
        passengers.push(hasreselect.passenger);
      }
    }
    const hasNotWhitelist = passengers.find(p => p.isNotWhiteList);
    const whitelist = passengers.map(p => p.AccountId);
    if (hasNotWhitelist) {
      let policyTrains: TrainPassengerModel[];
      // 白名单的乘客
      const ps = passengers.filter(p => !p.isNotWhiteList);
      if (ps.length > 0) {
        policyTrains = await this.trainService.policyAsync(
          trains,
          passengerId ? [passengerId] : ps.map(p => p.AccountId)
        );
      }
      // 非白名单可以预订所有的仓位

      const notWhitelistTrains = this.getNotWhitelistPolicyTrains(
        hasNotWhitelist.AccountId,
        trains
      );
      this.policyTrains = policyTrains.concat(notWhitelistTrains);
      console.log(this.policyTrains);
    } else {
      if (whitelist.length) {
        this.policyTrains = await this.trainService.policyAsync(
          trains,
          passengerId ? [passengerId] : whitelist
        );
      }
    }
    if (
      this.policyTrains &&
      this.policyTrains.length === 0 &&
      whitelist.length
    ) {
      trains = [];
      this.policyTrains = [];
      return [];
    }
    return (this.trains = trains);
  }

  private getNotWhitelistPolicyTrains(
    passengerKey: string,
    trains: TrainEntity[]
  ): {
    PassengerKey: string;
    TrainPolicies: TrainPolicyModel[];
  } {
    const TrainPolicies: TrainPolicyModel[] = [];
    trains.forEach(it => {
      if (it.Seats) {
        it.Seats.forEach(s => {
          const m = new TrainPolicyModel();
          m.IsAllowBook = true;
          m.Rules = [];
          m.TrainNo = it.TrainNo;
          m.SeatType = s.SeatType;
          TrainPolicies.push(m);
        });
      }
    });
    return {
      PassengerKey: passengerKey, // 非白名单的账号id 统一为一个，tmc的accountid
      TrainPolicies
    };
  }
  private getUnSelectPassengers() {
    return this.trainService
      .getBookInfos()
      .filter(
        item =>
          !item.trainInfo ||
          !item.trainInfo.trainEntity ||
          !item.trainInfo.trainPolicy
      )
      .map(item => item.passenger)
      .reduce(
        (arr, item) => {
          if (!arr.find(i => i.AccountId == item.AccountId)) {
            arr.push(item);
          }
          return arr;
        },
        [] as StaffEntity[]
      );
  }

  async filterPolicyTrains() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      componentProps: {
        bookInfos$: this.trainService.getBookInfoSource()
      },
      translucent: true
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    if (d && d.data) {
      this.doRefresh(true, false, d.data, true);
    } else {
      this.doRefresh(true, false);
    }
  }
  goToSelectPassengerPage() {
    this.isLeavePage = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  onFilter() {
    this.activeTab = "filter";
    // this.trainService.setFilterPanelShow(true);
  }
  async onTimeOrder() {
    console.time("time");
    this.isLoading = true;
    this.activeTab = "time";
    this.timeOrdM2N = !this.timeOrdM2N;
    this.sortTrains("time");
    this.isLoading = false;
    console.timeEnd("time");
  }
  async onPriceOrder() {
    console.time("price");
    this.isLoading = true;
    this.activeTab = "price";
    this.priceOrderL2H = !this.priceOrderL2H;
    this.sortTrains("price");
    this.isLoading = false;
    console.timeEnd("price");
  }
  async showSelectedBookInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedTrainSegmentInfoComponent
    });
    await this.trainService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
  }
  private moveDayToSearchDate(d?: DayModel) {
    this.domCtrl.write(_ => {
      if (this.daysCalendarComp) {
        const day =
          d ||
          this.calendarService.generateDayModelByDate(
            this.searchTrainModel.Date
          );
        setTimeout(() => {
          if (this.daysCalendarComp) {
            this.daysCalendarComp.onDaySelected(day);
          }
        }, 1000);
      }
    });
  }
  async doRefresh(
    loadDataFromServer: boolean,
    keepSearchCondition: boolean,
    toBeFilteredPassengerId?: string,
    filterPolicy?: boolean
  ) {
    this.moveDayToSearchDate();
    if (this.timeoutid) {
      clearTimeout(this.timeoutid);
    }
    this.timeoutid = setTimeout(async () => {
      try {
        if (this.isLeavePage || this.isLoading) {
          return;
        }
        this.moveDayToSearchDate();
        if (this.list) {
          this.list.nativeElement.innerHTML = "";
        }
        if (this.ionRefresher) {
          this.ionRefresher.complete();
        }
        this.apiService.showLoadingView();
        if (!keepSearchCondition) {
          setTimeout(() => {
            this.activeTab = "none";
          }, 0);
        }
        this.vmTrainSeats = [];
        this.isLoading = true;
        let data: TrainEntity[] = JSON.parse(JSON.stringify(this.trains));
        if (loadDataFromServer) {
          // 强制从服务器端返回新数据
          data = await this.loadPolicyedTrainsAsync(toBeFilteredPassengerId);
        }
        // 根据筛选条件过滤航班信息：
        data = this.filterTrains(data);
        let segments: TrainSeatViewModal[];
        if (filterPolicy) {
          segments = this.getSeats(data);
          if (segments.length == 0) {
            if (
              `${toBeFilteredPassengerId}`
                .toLowerCase()
                .includes(NOT_WHITE_LIST)
            ) {
              // 非白名单的是可以选择所有的航班
              segments = this.getSeats(data);
            }
          }
        }
        this.vmTrainSeats = segments;
        this.renderList(segments);
        this.apiService.hideLoadingView();
        this.isLoading = false;
      } catch (e) {
        console.error(e);
        this.isLoading = false;
      }
    }, 0);
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")]);
  }
  private renderList(trains: TrainSeatViewModal[]) {}
  private scrollToTop() {
    setTimeout(() => {
      if (this.cnt) {
        this.cnt.scrollToTop(100);
      }
    }, 100);
  }
  private filterTrains(trains: TrainEntity[]) {
    let result = trains;
    return result;
  }
  onChangedDay() {}
  onCalenderClick() {
    this.trainService.openCalendar(false);
  }

  back() {
    this.isLeavePage = true;
    this.navCtrl.back();
  }
  private sortTrains(key: "price" | "time") {
    if (!this.filterCondition) {
      this.filterCondition = FilterTrainCondition.init();
    }
    if (key === "price") {
      this.filterCondition.priceFromL2H = this.priceOrderL2H
        ? "low2Height"
        : "height2Low";
      this.filterCondition.timeFromM2N = "initial";
      const segments = this.sortByPrice(this.vmTrainSeats, this.priceOrderL2H);
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
        this.renderList(segments);
      }
      // this.renderFlightList2(segments);
      this.scrollToTop();
    }
    if (key === "time") {
      this.filterCondition.timeFromM2N = this.timeOrdM2N ? "am2pm" : "pm2am";
      this.filterCondition.priceFromL2H = "initial";
      const segments = this.sortByTime(this.vmTrainSeats, this.timeOrdM2N);
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
        this.renderList(segments);
      }
      this.scrollToTop();
    }
  }
  private sortByTime(seats: TrainSeatViewModal[], timeOrdM2N: Boolean) {
    seats.sort((a, b) => {
      const sub =
        a.train && b.train && a.train.StartTimeStamp - b.train.StartTimeStamp;
      return timeOrdM2N ? sub : -sub;
    });
    return seats;
  }
  private sortByPrice(seats: TrainSeatViewModal[], l2h: Boolean) {
    seats.sort((a, b) => {
      const sub =
        a.trainSeat &&
        b.trainSeat &&
        +a.trainSeat.TicketPrice - +b.trainSeat.TicketPrice;
      return l2h ? sub : -sub;
    });
    return seats;
  }
  private getSeats(trains: TrainEntity[]): TrainSeatViewModal[] {
    const seats: TrainSeatViewModal[] = [];
    if (!trains) {
      return seats;
    }
    trains.forEach(train => {
      if (train.Seats) {
        train.Seats.forEach(s => {
          seats.push({
            train,
            trainSeat: s
          });
        });
      }
      return seats;
    });
    return seats;
  }
}
