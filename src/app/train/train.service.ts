import { TrainRefundComponent } from './components/train-refund/train-refund.component';
import { OrderEntity } from './../order/models/OrderEntity';
import { OrderTrainTicketEntity } from 'src/app/order/models/OrderTrainTicketEntity';
import { ExchangeTrainModel } from './../order/models/ExchangeTrainModel';
import { AppHelper } from "src/app/appHelper";
import { ModalController, PopoverController } from "@ionic/angular";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService } from "./../hr/staff.service";
import { Subject, BehaviorSubject, combineLatest } from "rxjs";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { TripType } from "../tmc/models/TripType";
import { TrainEntity, TrainSeatType } from "./models/TrainEntity";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import { Storage } from "@ionic/storage";
import * as jsPy from "js-pinyin";
import {
  PassengerBookInfo,
  TmcService,
  InitialBookDtoModel,
  FlightHotelTrainType,
  IBookOrderResult
} from "../tmc/tmc.service";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import * as moment from "moment";
import { LanguageHelper } from "../languageHelper";
import { CalendarService } from "../tmc/calendar.service";
import { TrainSeatEntity } from "./models/TrainSeatEntity";
import { Router } from "@angular/router";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { DayModel } from "../tmc/models/DayModel";
const KEY_TRAIN_TRAFFICLINES_DATA = "train-traficlines-data";
export class SearchTrainModel {
  TrainCode: string;
  Date: string;
  BackDate: string;
  FromStation: string;
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  ToStation: string;
  TrainNo: string;
  isLocked?: boolean;
  tripType: TripType;
  isRoundTrip?: boolean; // 是否是往返
  isExchange?: boolean;// 是否是改签
}
export interface ISelectedStation {
  isSelectFrom: boolean;
  isSelectTo: boolean;
  fromStation: TrafficlineEntity;
  toStation: TrafficlineEntity;
}
export interface ICurrentViewtTainItem {
  selectedSeat: TrainSeatEntity;
  totalPolicies: TrainPassengerModel[];
  train: TrainEntity;
}
@Injectable({
  providedIn: "root"
})
export class TrainService {
  private localTrafficLine: CacheTrafficLineModel = {
    lastUpdateTime: 0,
    TrafficLines: []
  };
  private selfCredentials: CredentialsEntity[];
  private searchModel: SearchTrainModel;
  private selectedStationSource: Subject<ISelectedStation>;
  private bookInfos: PassengerBookInfo<ITrainInfo>[] = [];
  private bookInfoSource: Subject<PassengerBookInfo<ITrainInfo>[]>;
  private searchModelSource: Subject<SearchTrainModel>;
  private isInitializingSelfBookInfos = false;
  exchangedTrainTicketInfo: { order: OrderEntity, ticket: OrderTrainTicketEntity };
  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private staffService: StaffService,
    private tmcService: TmcService,
    private identityService: IdentityService,
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private router: Router,
    private popoverCtrl: PopoverController
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchModelSource = new BehaviorSubject(new SearchTrainModel());
    this.selectedStationSource = new BehaviorSubject(null);
    combineLatest([
      this.getBookInfoSource(),
      this.identityService.getIdentitySource()
    ]).subscribe(async ([infos, identity]) => {
      if (identity && identity.Ticket) {
        if (this.isInitializingSelfBookInfos) {
          return;
        }
        await this.initSelfBookTypeBookInfos();
      }
    });
    identityService.getIdentitySource().subscribe(res => {
      this.disposal();
    });
  }
  async getPassengerCredentials(
    accountIds: string[]
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    return this.tmcService.getPassengerCredentials(accountIds);
  }
  filterPassengerPolicyTrains(
    bookInfo: PassengerBookInfo<ITrainInfo>,
    trains: TrainEntity[],
    policies: TrainPassengerModel[]
  ): TrainEntity[] {
    console.log(bookInfo, policies);
    let result = trains || [];
    if (
      !bookInfo ||
      !bookInfo.passenger ||
      !bookInfo.passenger.AccountId ||
      !policies ||
      !policies.length
    ) {
      this.setBookInfoSource(
        this.getBookInfos().map(it => {
          it.isFilteredPolicy = false;
          it.isOnlyFilterMatchedPolicy = false;
          it.isAllowBookPolicy = false;
          return it;
        })
      );
      return result;
      // return result.map(it => {
      //   if (it.Seats) {
      //     it.Seats = it.Seats.map(s => {
      //       s.Policy = null;
      //       return s;
      //     });
      //   }
      //   return it;
      // });
    }
    this.setBookInfoSource(
      this.getBookInfos().map(it => {
        it.isFilteredPolicy = it.id == bookInfo.id;
        it.isOnlyFilterMatchedPolicy = bookInfo.isOnlyFilterMatchedPolicy;
        return it;
      })
    );
    const onePolicies = policies.find(
      it => it.PassengerKey == bookInfo.passenger.AccountId
    );
    let policyTrainNos: string[] = [];
    let policyTrains = onePolicies && onePolicies.TrainPolicies;
    if (policyTrains) {
      if (bookInfo.isAllowBookPolicy) {
        policyTrains = policyTrains.filter(it => it.IsAllowBook);
      }
      if (bookInfo.isOnlyFilterMatchedPolicy) {
        policyTrains = policyTrains.filter(
          it => it.IsAllowBook && (!it.Rules || it.Rules.length == 0)
        );
      }
      policyTrainNos = policyTrains.map(it => it.TrainNo);
      result = trains.filter(
        t =>
          policyTrainNos.includes(t.TrainNo) &&
          t.Seats &&
          t.Seats.some(s => +s.Count > 0)
      );
      result = this.filterTrainSeatPolicy(bookInfo, result, onePolicies.TrainPolicies);
    }
    return result;
  }
  private filterTrainSeatPolicy(bookInfo: PassengerBookInfo<ITrainInfo>, trains: TrainEntity[], trainPolicies: TrainPolicyModel[]) {
    const result = trains.map(it => {
      if (it.Seats) {
        it.Seats = it.Seats.map(s => {
          const trainPolicy = trainPolicies.find(
            p => p.TrainNo == it.TrainNo && p.SeatType == s.SeatType
          );
          s.Policy = trainPolicy;
          return s;
        });
        if (bookInfo.isOnlyFilterMatchedPolicy) {
          it.Seats = it.Seats.filter(
            s => (!s.Policy || !s.Policy.Rules || !s.Policy.Rules.length) &&
              +s.Count > 0);
          if (it.Seats.length == 0) {
            return null;
          }
        }
      }
      return it;
    })
      .filter(it => !!it);
    return result;
  }
  async reelectBookInfo(bookInfo: PassengerBookInfo<ITrainInfo>) {
    if (!bookInfo || !bookInfo.bookInfo || !bookInfo.bookInfo.trainPolicy || !bookInfo.bookInfo.trainEntity) {
      return;
    }
    bookInfo.isReplace = true;
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss();
    }
    const s = this.getSearchTrainModel();
    s.Date = bookInfo.bookInfo.trainEntity.StartTime && bookInfo.bookInfo.trainEntity.StartTime.substr(0, '2019-10-11'.length);
    s.BackDate = moment(s.Date)
      .add(1, "days")
      .format("YYYY-MM-DD");
    s.tripType = TripType.departureTrip;
    s.isLocked = false;
    this.setSearchTrainModel({
      ...s
    });
    if (await this.staffService.isSelfBookType()) {
      this.setBookInfoSource([]);
    }
    this.router.navigate([AppHelper.getRoutePath("train-list")], { queryParams: { doRefresh: true } });
  }
  async checkCanAdd() {
    // if (this.getBookInfos().find(it => it.isReplace)) {
    //   return true;
    // }
    const bookInfos = this.getBookInfos().filter(it => !!it.bookInfo);
    if (!(await this.staffService.isSelfBookType())) {
      if (bookInfos.length >= 9) {
        return false;
      }
    }
    // if (await this.staffService.isSelfBookType()) {
    //   if (bookInfos.length == 2 && this.getSearchTrainModel().isRoundTrip) {
    //     return false;
    //   }
    //   if (bookInfos.length == 1 && !this.getSearchTrainModel().isRoundTrip) {
    //     return false;
    //   }
    // }
    return true;
  }
  async selectReturnTrip() {
    const infos = this.getBookInfos();
    const s = this.getSearchTrainModel();
    const isSelfBookType = await this.staffService.isSelfBookType();
    if (!isSelfBookType || infos.length == 0 || !s.isRoundTrip) {
      this.setSearchTrainModel({
        ...s,
        isLocked: false
      });
      return;
    }
    const go = infos.find(
      it => it.bookInfo && it.bookInfo.tripType == TripType.departureTrip
    );
    if (go) {
      const backParams = {
        ...s
      };
      const stations = await this.getStationsAsync();
      backParams.fromCity = stations.find(
        station => station.Code == go.bookInfo.trainEntity.ToStationCode
      );
      backParams.toCity = stations.find(
        station => station.Code == go.bookInfo.trainEntity.FromStationCode
      );
      backParams.FromStation = go.bookInfo.trainEntity.ToStationCode;
      backParams.ToStation = go.bookInfo.trainEntity.FromStationCode;
      if (+moment(s.BackDate) - +moment(s.Date) < 0) {
        s.BackDate = s.Date;
      }
      backParams.Date = s.BackDate;
      backParams.isLocked = true;
      backParams.tripType = TripType.returnTrip;
      this.calendarService.setSelectedDaysSource([this.calendarService.generateDayModelByDate(backParams.Date)]);
      await this.dismissAllTopOverlays();
      await this.router.navigate([AppHelper.getRoutePath("train-list")]);
      this.setSearchTrainModel(backParams);
    }
  }
  async addOrReselectBookInfo(currentViewtTainItem: ICurrentViewtTainItem) {
    console.log("add or reselect book info ", currentViewtTainItem);
    const isSelftBookType = await this.staffService.isSelfBookType();
    if (isSelftBookType) {
      await this.addOrReselectSelfBookTypeBookInfo(currentViewtTainItem);
    } else {
      await this.addOrReselectNotSelfBookTypeBookInfo(currentViewtTainItem);
    }
  }
  private async addOrReselectSelfBookTypeBookInfo(
    currentViewtTainItem: ICurrentViewtTainItem
  ) {
    if (
      currentViewtTainItem &&
      currentViewtTainItem.selectedSeat &&
      currentViewtTainItem.totalPolicies &&
      currentViewtTainItem.train
    ) {
      let bookInfos = this.getBookInfos();
      const bookInfo = this.getTrainInfo(currentViewtTainItem);
      if (
        bookInfo &&
        bookInfo.trainPolicy &&
        !bookInfo.trainPolicy.IsAllowBook
      ) {
        AppHelper.alert(
          LanguageHelper.Train.getDontAllowBookTip(),
          true,
          LanguageHelper.getConfirmTip()
        );
        return;
      }
      const s = this.getSearchTrainModel();
      if (bookInfo) {
        if (s.isRoundTrip) {
          // 往返
          const selected = bookInfos.filter(it => !!it.bookInfo);
          if (selected.length) {
            const go = selected.find(
              it => it.bookInfo.tripType == TripType.departureTrip
            );
            if (go) {
              if (s.tripType == TripType.returnTrip) {
                bookInfo.tripType = TripType.returnTrip;
                bookInfos = [
                  go,
                  {
                    ...bookInfos[0],
                    bookInfo,
                    id: AppHelper.uuid()
                  }
                ];
              } else {
                bookInfos = [
                  {
                    ...bookInfos[0],
                    bookInfo,
                    id: AppHelper.uuid()
                  }
                ];
              }
            } else {
              bookInfo.tripType = TripType.departureTrip;
              bookInfos = [
                {
                  ...bookInfos[0],
                  bookInfo,
                  id: AppHelper.uuid()
                }
              ];
            }
          } else {
            bookInfo.tripType = TripType.departureTrip;
            bookInfos = [
              {
                ...bookInfos[0],
                bookInfo,
                id: AppHelper.uuid()
              }
            ];
          }
        } else {
          // 单程,直接替换
          if (bookInfos.length) {
            bookInfo.tripType = TripType.departureTrip;
            bookInfos = [
              {
                ...bookInfos[0],
                bookInfo,
                id: AppHelper.uuid()
              }
            ];
          }
        }
      }
      if (s.isRoundTrip) {
        if (
          bookInfos.find(
            it => !it.bookInfo || it.bookInfo.tripType == TripType.returnTrip
          )
        ) {
          this.setSearchTrainModel({ ...s, isLocked: false });
        }
      }
      this.setBookInfoSource(bookInfos);
    }
  }
  private getTrainInfo(
    currentViewtTainItem: ICurrentViewtTainItem
  ): ITrainInfo {
    const bookInfos = this.getBookInfos();
    if (bookInfos && bookInfos.length) {
      const passenger = bookInfos[0].passenger;
      const accountId = passenger && passenger.AccountId;
      if (!currentViewtTainItem.selectedSeat.Policy) {
        const policy = currentViewtTainItem.totalPolicies.find(
          k => k.PassengerKey == accountId
        );
        if (policy) {
          if (currentViewtTainItem.train.Seats) {
            currentViewtTainItem.train.Seats.forEach(s => {
              s.Policy = policy.TrainPolicies.find(
                i =>
                  i.TrainNo == currentViewtTainItem.train.TrainNo &&
                  i.SeatType == s.SeatType
              );
            });
          }
        }
      }
      const bookInfo: ITrainInfo = {
        trainEntity: currentViewtTainItem.train,
        trainPolicy: currentViewtTainItem.selectedSeat.Policy,
        tripType: TripType.departureTrip,
        id: AppHelper.uuid(),
        selectedSeat: currentViewtTainItem.selectedSeat
      };
      return bookInfo;
    }
    return null;
  }
  private async addOrReselectNotSelfBookTypeBookInfo(
    currentViewtTainItem: ICurrentViewtTainItem
  ) {
    if (
      currentViewtTainItem &&
      currentViewtTainItem.selectedSeat &&
      currentViewtTainItem.totalPolicies &&
      currentViewtTainItem.train
    ) {
      let bookInfos = this.getBookInfos();
      bookInfos = bookInfos.map(bookInfo => {
        const tripType = TripType.departureTrip;
        if (!currentViewtTainItem.selectedSeat.Policy) {
          const policy = currentViewtTainItem.totalPolicies.find(
            k => k.PassengerKey == bookInfo.passenger.AccountId
          );
          if (policy) {
            currentViewtTainItem.selectedSeat.Policy = policy.TrainPolicies.find(
              i =>
                i.TrainNo == currentViewtTainItem.train.TrainNo &&
                i.SeatType == currentViewtTainItem.selectedSeat.SeatType
            );
          }
        }
        bookInfo.bookInfo = {
          trainEntity: currentViewtTainItem.train,
          trainPolicy: currentViewtTainItem.selectedSeat.Policy,
          tripType,
          id: AppHelper.uuid(),
          selectedSeat: currentViewtTainItem.selectedSeat
        };
        if (!currentViewtTainItem.selectedSeat.Policy.IsAllowBook) {
          bookInfo.bookInfo = null;
        }

        // 修改重选的火车信息,每次只能重选一个，所以直接覆盖重选的即可
        if (bookInfo.isReplace) {
          bookInfo.bookInfo = {
            ...bookInfo,
            trainEntity: currentViewtTainItem.train,
            trainPolicy: currentViewtTainItem.selectedSeat.Policy,
            tripType: TripType.departureTrip,
            id: AppHelper.uuid(),
            selectedSeat: currentViewtTainItem.selectedSeat
          };
          bookInfo.isReplace = false;
        }
        return bookInfo;
      });
      this.setBookInfoSource(bookInfos);
    }
  }
  disposal() {
    this.setSearchTrainModel(new SearchTrainModel());
    this.setBookInfoSource([]);
    this.selfCredentials = null;
    this.exchangedTrainTicketInfo = null;
    this.isInitializingSelfBookInfos = false;
  }
  async initSelfBookTypeBookInfos(isShowLoading = false) {
    const infos = this.getBookInfos();
    if (infos.length === 0 && (await this.staffService.isSelfBookType(isShowLoading))) {
      if (this.isInitializingSelfBookInfos) {
        return;
      }
      this.isInitializingSelfBookInfos = true;
      let IdCredential: CredentialsEntity;
      if (await this.staffService.isSelfBookType(isShowLoading)) {
        const staff = await this.staffService.getStaff(false, isShowLoading);
        if (!this.selfCredentials || this.selfCredentials.length === 0) {
          const res = await this.tmcService
            .getPassengerCredentials([staff.AccountId], isShowLoading)
            .catch(_ => ({ [staff.AccountId]: [] }));
          this.selfCredentials = res[staff.AccountId];
        }
        IdCredential =
          this.selfCredentials &&
          this.selfCredentials.find(c => c.Type == CredentialsType.IdCard);
        const i: PassengerBookInfo<ITrainInfo> = {
          passenger: staff,
          credential:
            IdCredential ||
            (this.selfCredentials &&
              this.selfCredentials.length &&
              this.selfCredentials[0]) ||
            new CredentialsEntity()
        };
        this.addBookInfo(i);
        this.setSearchTrainModel({
          ...this.getSearchTrainModel(),
          isLocked: false
        });
        if (this.getSearchTrainModel().isRoundTrip) {
          this.addBookInfo(i);
        } else {
          this.setBookInfoSource([i]);
        }
        this.isInitializingSelfBookInfos = false;
      }
    }
  }
  setSelectedStation(station: ISelectedStation) {
    this.selectedStationSource.next(station);
  }
  getSelectedStationSource() {
    return this.selectedStationSource.asObservable();
  }
  getSearchTrainModelSource() {
    return this.searchModelSource.asObservable();
  }
  getSearchTrainModel() {
    const s = new SearchTrainModel();
    s.tripType = TripType.departureTrip;
    s.Date = moment().format("YYYY-MM-DD");
    return this.searchModel || s;
  }
  setSearchTrainModel(m: SearchTrainModel) {
    console.log("setSearchTrainModel", m);
    this.searchModel = m || new SearchTrainModel();
    if (m.fromCity) {
      m.FromStation = m.fromCity.Code;
    }
    if (m.toCity) {
      m.ToStation = m.toCity.Code;
    }
    this.searchModelSource.next(this.searchModel);
  }
  addBookInfo(arg: PassengerBookInfo<ITrainInfo>) {
    console.log("train add bookInfo", arg);
    if (arg) {
      arg.id = AppHelper.uuid();
      this.bookInfos.push(arg);
      this.setBookInfoSource(this.bookInfos);
    }
  }
  async openCalendar(isMulti: boolean) {
    const goTrain = this.getBookInfos().find(
      f => f.bookInfo && f.bookInfo.tripType == TripType.departureTrip
    );
    const s = this.getSearchTrainModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime:
          goTrain &&
          goTrain.bookInfo &&
          goTrain.bookInfo.trainEntity &&
          goTrain.bookInfo.trainEntity.ArrivalTime,
        tripType: s.tripType || TripType.departureTrip,
        isMulti: isMulti,
        forType: FlightHotelTrainType.Train
      }
    });
    await m.present();
    // this.calendarService.setSelectedDaysSource(this.calendarService.getSelectedDays());
    const result = await m.onDidDismiss();
    return result && (result.data as DayModel[]);
  }
  async getStationsAsync(forceUpdate = false): Promise<TrafficlineEntity[]> {
    if (!forceUpdate) {
      if (
        !this.localTrafficLine ||
        !this.localTrafficLine.TrafficLines ||
        this.localTrafficLine.TrafficLines.length == 0
      ) {
        this.localTrafficLine = await this.getCachedTrafficLinesAsync();
      }
      if (this.localTrafficLine.TrafficLines.length) {
        return Promise.resolve(this.localTrafficLine.TrafficLines);
      }
    }
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-TrainStation`;
    req.Data = {
      LastUpdateTime: this.localTrafficLine.lastUpdateTime
    };
    const result = await this.apiService
      .getPromiseData<{
        Trafficlines: TrafficlineEntity[];
        HotelCities: any[];
      }>(req)
      .catch(
        _ =>
          ({} as {
            Trafficlines: TrafficlineEntity[];
          })
      );
    let arr: CacheTrafficLineModel = this.localTrafficLine;
    if (result && result.Trafficlines && result.Trafficlines.length) {
      result.Trafficlines = result.Trafficlines.map(item => {
        if (!item.Pinyin) {
          item.FirstLetter = this.getFirstLetter(item.Nickname);
        } else {
          item.FirstLetter = item.Pinyin.substring(0, 1).toUpperCase();
        }
        return item;
      });
      arr = await this.cacheTrafficLinesAsync(result.Trafficlines);
    }
    this.localTrafficLine = {
      lastUpdateTime: Math.floor(Date.now() / 1000),
      TrafficLines:
        (arr && arr.TrafficLines) ||
        (this.localTrafficLine && this.localTrafficLine.TrafficLines) ||
        []
    };
    return this.localTrafficLine.TrafficLines;
  }
  setBookInfoSource(infos: PassengerBookInfo<ITrainInfo>[]) {
    console.log("setBookInfoSource", infos);
    this.bookInfos = infos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  removeBookInfo(info: PassengerBookInfo<ITrainInfo>) {
    if (info) {
      const delInfo = { ...info };
      this.bookInfos = this.bookInfos.filter(item => item.id != info.id);
      const s = this.getSearchTrainModel();
      let bookInfos = this.bookInfos.map(it => {
        if (it.id == info.id) {
          it.bookInfo = null;
        }
        return it;
      });
      if (
        s.isRoundTrip &&
        delInfo.bookInfo &&
        delInfo.bookInfo.tripType == TripType.returnTrip
      ) {
        this.setSearchTrainModel({
          ...s,
          isLocked: false
        });
      }
      if (
        s.isRoundTrip &&
        delInfo.bookInfo &&
        delInfo.bookInfo.tripType == TripType.departureTrip
      ) {
        bookInfos = this.bookInfos.map(it => {
          it.bookInfo = null;
          return it;
        });
        this.setSearchTrainModel({
          ...s,
          isLocked: false,
          tripType: TripType.departureTrip
        });
      }
      this.setBookInfoSource(bookInfos);
    }
  }
  private async cacheTrafficLinesAsync(lines: TrafficlineEntity[]) {
    const now = Math.floor(Date.now() / 1000);
    const lastLocal = await this.getCachedTrafficLinesAsync();
    const local: CacheTrafficLineModel = {
      lastUpdateTime: now,
      TrafficLines: [
        ...lastLocal.TrafficLines,
        ...lines.filter(
          one => !lastLocal.TrafficLines.find(item => item.Code == one.Code)
        )
      ]
    };
    await this.storage.set(KEY_TRAIN_TRAFFICLINES_DATA, local);
    return local;
  }
  private async getCachedTrafficLinesAsync() {
    const local: CacheTrafficLineModel = await this.storage.get(
      KEY_TRAIN_TRAFFICLINES_DATA
    );
    return (
      local || {
        lastUpdateTime: 0,
        TrafficLines: []
      }
    );
  }
  private getFirstLetter(name: string) {
    const pyFl = `${jsPy.getFullChars(name)}`.charAt(0);
    return pyFl && pyFl.toUpperCase();
  }
  async searchAsync(condition: SearchTrainModel): Promise<TrainEntity[]> {
    await this.initSelfBookTypeBookInfos();
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Search`;
    req.IsShowLoading = true;
    req.Timeout = 60;
    req.Data = {
      Date: condition.Date,
      FromStation: condition.FromStation,
      ToStation: condition.ToStation,
      TrainCode: condition.TrainCode
    };
    req.Version = "1.0";
    return this.apiService
      .getPromiseData<TrainEntity[]>(req)
      .then(res => {
        let result = res;
        if (res) {
          result = res.map(it => {
            it.ArrivalTimeStamp = Math.floor(
              new Date(it.ArrivalTime).getTime() / 1000
            );
            it.StartTimeStamp = Math.floor(
              new Date(it.StartTime).getTime() / 1000
            );
            it.AddOneDayTip = this.addoneday(it);
            it.StartShortTime = this.calendarService.getHHmm(it.StartTime);
            it.ArrivalShortTime = this.calendarService.getHHmm(it.ArrivalTime);
            return it;
          });
        }
        return result;
      })
      .catch(_ => {
        AppHelper.alert(_);
        return [];
      });
  }
  async dismissAllTopOverlays() {
    let i = 10;
    let top = await this.modalCtrl.getTop();
    while (top && --i > 0) {
      await top.dismiss().catch(_ => { });
      top = await this.modalCtrl.getTop();
    }
  }

  getExchangeInfo(
    ticketId: string
  ): Promise<ExchangeTrainModel> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-GetExchangeInfo`;
    req.IsShowLoading = true;
    req.Version = "2.0";
    req.Timeout = 60;
    req.Data = {
      TicketId: ticketId
    };
    return this.apiService
      .getPromiseData<ExchangeTrainModel>(req)
      .catch(_ => {
        AppHelper.alert(_.Message || _);
        return null;
      });
  }
  private doRefund(
    ticketId: string
  ): Promise<{ Status: boolean; Id: string; Message: string; }> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Refund`;
    req.IsShowLoading = true;
    req.Version = "2.0";
    req.Timeout = 60;
    req.Data = {
      TicketId: ticketId
    };
    return this.apiService
      .getPromiseData<any>(req);
  }
  async refund(ticketId: string) {
    let isRefund = false;
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-GetTrainPassenger`;
    req.IsShowLoading = true;
    req.Version = "2.0";
    req.Timeout = 60;
    req.Data = {
      TicketId: ticketId
    };
    const info = await this.apiService
      .getPromiseData<{
        Id: string;
        CheckName: string;
        CredentialsNumber: string;
        StartTime: string;
        ArrivalTime: string;
        FromStationName: string;
        ToStationName: string;
        TrainCode: string;
      }>(req)
      .catch(_ => {
        AppHelper.alert(_.Message || _);
        return null;
      });
    if (info) {
      const p = await this.popoverCtrl.create({
        component: TrainRefundComponent,
        cssClass: "train-refund-comp",
        componentProps: {
          ...info
        }
      });
      p.backdropDismiss = false;
      await p.present();
      const result = await p.onDidDismiss();
      if (result) {
        if (result.data) {
          const rev: { Message: string; Status: boolean; } = await this.doRefund(ticketId)
            .catch(_ => {
              AppHelper.alert(_.Message || _);
              return null;
            })
          AppHelper.alert(rev.Message || "申请已提交");
          isRefund = true;
        }
      }
    }
    return isRefund;
  }
  async onExchange(orderTrainTicket: OrderTrainTicketEntity) {
    try {
      const info = await this.getExchangeInfo(orderTrainTicket.Id);
      const trainStations = await this.getStationsAsync()
      // .catch(_=>[]);
      if (!info || !info.OrderTrainTicket) {
        return;
      }
      let books = this.getBookInfos();
      const trip = info.OrderTrainTicket.OrderTrainTrips && info.OrderTrainTicket.OrderTrainTrips[0];
      const passenger = info.BookStaff;
      if (passenger) {
        passenger.AccountId = passenger.AccountId || (passenger.Account && passenger.Account.Id);
      }
      const b: PassengerBookInfo<ITrainInfo> = {
        passenger: info.BookStaff,
        credential: info.DefaultCredentials,
        // isNotWhitelist?: boolean;
        // bookInfo: {
        //   trainEntity: {
        //     FromStationCode: info.FromStation,
        //     FromStationName: info.FromStationName,
        //     ToStationCode: info.ToStation,
        //     ToStationName: info.ToStationName,
        //     ArrivalShortTime: this.calendarService.getHHmm(trip && trip.ArrivalTime),
        //     ArrivalTimeStamp: +moment(trip && trip.ArrivalTime),
        //     ArrivalTime: trip && trip.ArrivalTime,
        //     StartShortTime: this.calendarService.getHHmm(trip && trip.StartTime),
        //     StartTime: trip && trip.StartTime,
        //     StartTimeStamp: +moment(trip && trip.StartTime),
        //     TrainNo: trip && trip.TrainNo,
        //     TrainCode: trip && trip.TrainCode
        //   },
        //   selectedSeat: {
        //     SeatType: info.OrderTrainTicket.SeatType,
        //     SeatTypeName: info.OrderTrainTicket.SeatTypeName,
        //   },
        //   tripType: TripType.departureTrip,
        //   id: AppHelper.uuid(),
        //   isExchange: true,
        // } as ITrainInfo,
        id: AppHelper.uuid(),
        isFilteredPolicy: true
      };
      books = [b];
      this.exchangedTrainTicketInfo = { ticket: JSON.parse(JSON.stringify(info.OrderTrainTicket)), order: JSON.parse(JSON.stringify(info.OrderTrainTicket.Order)) };
      const fromCity = trainStations.find(it => it.Code == info.FromStation);
      const toCity = trainStations.find(it => it.Code == info.ToStation);
      console.log("exchange bookInfo", b, 'fromcity', fromCity, 'tocity', toCity);
      this.setBookInfoSource(books)
      this.setSearchTrainModel({
        ...this.getSearchTrainModel(),
        isLocked: true,
        isExchange: true,
        isRoundTrip: false,
        fromCity,
        toCity,
        Date: info.GoDate,
        BackDate: info.BackDate || moment().format("YYYY-MM-DD")
      });
      this.router.navigate([AppHelper.getRoutePath('search-train')]);
    } catch (e) {
      console.error(e);
    }
  }
  policyAsync(
    trains: TrainEntity[],
    passengerIds: string[]
  ): Promise<TrainPassengerModel[]> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Policy`;
    req.IsShowLoading = true;
    req.Version = "2.0";
    req.Timeout = 60;
    req.Data = {
      Passengers: passengerIds.join(","),
      Trains: JSON.stringify(trains)
    };
    return this.apiService
      .getPromiseData<TrainPassengerModel[]>(req)
      .catch(_ => {
        return [];
      });
  }
  private addoneday(s: TrainEntity) {
    const addDay = s.ArriveDays || "0";
    // new Date(s.ArrivalTime).getDate() - new Date(s.StartTime).getDate();
    return +addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Train-Initialize";
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    const bookInfos = this.getBookInfos();
    const isSelf = await this.staffService.isSelfBookType();
    return this.apiService
      .getPromiseData<InitialBookDtoModel>(req)
      .then(res => {
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || {};
        res.ServiceFees = res.ServiceFees || ({} as any);
        if (bookInfos.length == 2 && isSelf) {
          const fees = {};
          Object.keys(res.ServiceFees).forEach(k => {
            fees[k] = +res.ServiceFees[k] / 2;
          });
          res.ServiceFees = fees;
        }
        res.Staffs = res.Staffs || [];
        res.Staffs = res.Staffs.map(it => {
          return {
            ...it,
            CredentialStaff: { ...it } as any
          };
        });
        res.Tmc = res.Tmc || ({} as any);
        res.TravelFrom = res.TravelFrom || ({} as any);
        return res;
      });
  }
  scheduleAsync(data: {
    Date: string;
    FromStation: string;
    ToStation: string;
    TrainNo: string;
    TrainCode: string;
  }): Promise<TrainEntity[]> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Schedule`;
    req.IsShowLoading = true;
    req.Timeout = 60;
    req.Data = data;
    req.Version = "1.0";
    return this.apiService.getPromiseData<TrainEntity[]>(req).catch(_ => {
      return [];
    });
  }
  async bookTrain(bookDto: OrderBookDto): Promise<IBookOrderResult> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Train-Book";
    bookDto.Channel = this.tmcService.getChannel();
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<IBookOrderResult>(req);
  }
  removeAllBookInfos() {
    this.bookInfos = [];
    this.exchangedTrainTicketInfo = null;
    this.setBookInfoSource(this.bookInfos);
  }
}
export interface CacheTrafficLineModel {
  lastUpdateTime: number;
  TrafficLines: TrafficlineEntity[];
}
export interface ITrainInfo {
  trainEntity: TrainEntity;
  selectedSeat?: TrainSeatEntity;
  trainPolicy: TrainPolicyModel;
  tripType?: TripType;
  id?: string;
  pickSeat?: string;
  isLowerSegmentSelected?: boolean;
  isExchange?: boolean;// 是否是改签
}
export class TrainPolicyModel {
  /// <summary>
  /// 列车号
  /// </summary>
  TrainNo: string;
  /// <summary>
  /// 座位类型
  /// </summary>
  SeatType: TrainSeatType;
  /// <summary>
  /// 是否可预订
  /// </summary>
  IsAllowBook: boolean;
  IsForceBook: boolean;
  /// <summary>
  /// 违反具体的差标
  /// </summary>
  Rules: string[];
}
export class TrainPassengerModel {
  PassengerKey: string;
  TrainPolicies: TrainPolicyModel[];

}