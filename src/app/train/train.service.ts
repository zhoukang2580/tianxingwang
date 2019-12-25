import { TrainRefundComponent } from "./components/train-refund/train-refund.component";
import { OrderEntity } from "./../order/models/OrderEntity";
import { OrderTrainTicketEntity } from "src/app/order/models/OrderTrainTicketEntity";
import { ExchangeTrainModel } from "./../order/models/ExchangeTrainModel";
import { AppHelper } from "src/app/appHelper";
import { ModalController, PopoverController } from "@ionic/angular";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService, StaffEntity } from "./../hr/staff.service";
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
import { SelectAndReplaceTrainInfoComponent } from "./components/select-and-replaceinfo/select-and-replaceinfo.component";
const KEY_TRAIN_TRAFFICLINES_DATA = "train-traficlines-data";
export class SearchTrainModel {
  TrainCode: string;
  Date: string;
  FromStation: string;
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  ToStation: string;
  TrainNo: string;
  isLocked?: boolean;
  tripType: TripType;
  isRoundTrip?: boolean; // 是否是往返
  isExchange?: boolean; // 是否是改签
}

export interface ICurrentViewtTainItem {
  selectedSeat: TrainSeatEntity;
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
  private fetchPassengerCredentials: { promise: Promise<any> };
  private selfCredentials: CredentialsEntity[];
  private searchModel: SearchTrainModel;
  private bookInfos: PassengerBookInfo<ITrainInfo>[] = [];
  private bookInfoSource: Subject<PassengerBookInfo<ITrainInfo>[]>;
  private searchModelSource: Subject<SearchTrainModel>;
  private isInitializingSelfBookInfos = false;
  totalPolicies: TrainPassengerModel[];
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
    accountIds: string[],
    isShowLoading = false
  ): Promise<{ [accountId: string]: CredentialsEntity[] }> {
    if (
      this.fetchPassengerCredentials &&
      this.fetchPassengerCredentials.promise
    ) {
      return this.fetchPassengerCredentials.promise;
    }
    this.fetchPassengerCredentials = {
      promise: this.tmcService
        .getPassengerCredentials(accountIds, isShowLoading)
        .finally(() => {
          this.fetchPassengerCredentials = null;
        })
    };
    return this.fetchPassengerCredentials.promise;
  }
  filterPassengerPolicyTrains(
    bookInfo: PassengerBookInfo<ITrainInfo>,
    trains: TrainEntity[]
  ): TrainEntity[] {
    console.log(bookInfo, this.totalPolicies);
    let result = trains || [];
    if (
      !bookInfo ||
      !bookInfo.passenger ||
      !bookInfo.passenger.AccountId ||
      !bookInfo.isFilterPolicy ||
      !this.totalPolicies ||
      !this.totalPolicies.length
    ) {
      this.setBookInfoSource(
        this.getBookInfos().map(it => {
          it.isFilterPolicy = false;
          return it;
        })
      );
      return result.map(it => {
        if (it.Seats) {
          it.Seats = it.Seats.map(s => {
            s.color = "secondary";
            return s;
          });
        }
        return it;
      });
    }
    this.setBookInfoSource(
      this.getBookInfos().map(it => {
        it.isFilterPolicy = it.id == bookInfo.id;
        // it.isOnlyFilterMatchedPolicy = bookInfo.isOnlyFilterMatchedPolicy;
        return it;
      })
    );
    const onePolicies = this.totalPolicies.find(
      it => it.PassengerKey == bookInfo.passenger.AccountId
    );
    let policyTrains = onePolicies && onePolicies.TrainPolicies;
    if (policyTrains) {
      if (bookInfo.isFilterPolicy) {
        policyTrains = policyTrains.map(it => {
          if (!it.Rules || it.Rules.length == 0) {
            it.color = "success";
          } else {
            it.color = "warning";
          }
          if (!it.IsAllowBook) {
            it.color = "danger";
          }
          return it;
        });
      }
      result = result.map(it => {
        if (it.Seats) {
          it.Seats = it.Seats.map(s => {
            const trainPolicy = policyTrains.find(
              p => p.TrainNo == it.TrainNo && p.SeatType == s.SeatType
            );
            s.Policy = trainPolicy;
            s.color = (trainPolicy && trainPolicy.color) || "secondary";
            return s;
          });
        }
        return it;
      });
    }
    return result;
  }
  async reelectBookInfo(bookInfo: PassengerBookInfo<ITrainInfo>) {
    if (
      !bookInfo ||
      !bookInfo.bookInfo ||
      !bookInfo.bookInfo.trainPolicy ||
      !bookInfo.bookInfo.trainEntity
    ) {
      return;
    }
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss();
    }
    const s = this.getSearchTrainModel();
    s.Date =
      bookInfo.bookInfo.trainEntity.StartTime &&
      bookInfo.bookInfo.trainEntity.StartTime.substr(0, "2019-10-11".length);
    s.tripType = TripType.departureTrip;
    s.isLocked = false;
    this.setSearchTrainModel({
      ...s
    });
    if (await this.staffService.isSelfBookType()) {
      this.removeBookInfo(bookInfo, false);
    }
    this.setBookInfoSource(
      this.getBookInfos().map(it => {
        it.isReselect = it.id == bookInfo.id;
        if (it.id == bookInfo.id) {
          it.bookInfo = null;
        }
        return it;
      })
    );
    this.router.navigate([AppHelper.getRoutePath("train-list")], {
      queryParams: { doRefresh: true }
    });
  }
  async checkCanAdd() {
    const bookInfos = this.getBookInfos().filter(it => !!it.bookInfo);
    if (!(await this.staffService.isSelfBookType())) {
      if (bookInfos.length >= 5) {
        return false;
      }
    }
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
      backParams.isLocked = true;
      backParams.tripType = TripType.returnTrip;
      this.calendarService.setSelectedDaysSource([
        this.calendarService.generateDayModelByDate(backParams.Date)
      ]);
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
    this.setBookInfoSource(
      this.getBookInfos().map(it => {
        it.isReselect = false;
        return it;
      })
    );
  }
  private async addOrReselectSelfBookTypeBookInfo(
    currentViewtTainItem: ICurrentViewtTainItem
  ) {
    if (
      currentViewtTainItem &&
      currentViewtTainItem.selectedSeat &&
      this.totalPolicies &&
      currentViewtTainItem.train
    ) {
      let bookInfos = this.getBookInfos();
      const bookInfo = this.getTrainInfo(currentViewtTainItem, {
        ...bookInfos[0]
      });
      if (
        bookInfo &&
        bookInfo.trainPolicy &&
        !bookInfo.trainPolicy.IsAllowBook
      ) {
        let rules = bookInfo.trainPolicy.Rules || [];
        AppHelper.alert(
          `${rules.join("; ") + rules ? "," : ""}不可预订`,
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
  getTrainInfo(
    currentViewtTainItem: ICurrentViewtTainItem,
    info: PassengerBookInfo<ITrainInfo>
  ): ITrainInfo {
    if (!info || !currentViewtTainItem || !this.totalPolicies) {
      return null;
    }
    const passenger = info.passenger;
    const accountId = passenger && passenger.AccountId;
    const policy = this.totalPolicies.find(k => k.PassengerKey == accountId);
    if (policy) {
      if (currentViewtTainItem.train.Seats) {
        currentViewtTainItem.train.Seats.forEach(s => {
          s.Policy = policy.TrainPolicies.find(
            i =>
              i.TrainNo == currentViewtTainItem.train.TrainNo &&
              i.SeatType == s.SeatType
          );
          if (currentViewtTainItem.selectedSeat.SeatType == s.SeatType) {
            currentViewtTainItem.selectedSeat.Policy = s.Policy;
          }
        });
      }
    }
    const bookInfo: ITrainInfo = {
      trainEntity: { ...currentViewtTainItem.train, BookSeatLocation: "" },
      trainPolicy: { ...currentViewtTainItem.selectedSeat.Policy },
      tripType: TripType.departureTrip,
      id: AppHelper.uuid(),
      selectedSeat: { ...currentViewtTainItem.selectedSeat }
    };
    if (currentViewtTainItem.selectedSeat.Policy) {
      bookInfo.isAllowBook =
        currentViewtTainItem.selectedSeat.Policy.IsAllowBook;
    }
    return bookInfo;
  }
  private async addOrReselectNotSelfBookTypeBookInfo(
    currentViewtTainItem: ICurrentViewtTainItem
  ) {
    let bookInfos = this.getBookInfos();
    {
      const unselectBookInfos = this.getBookInfos().filter(
        it => !it.bookInfo || !it.bookInfo.trainPolicy
      );
      let cannotArr: string[] = [];
      if (unselectBookInfos.length) {
        bookInfos = bookInfos.map(item => {
          if (unselectBookInfos.find(it => it.id == item.id)) {
            const info = this.getTrainInfo(currentViewtTainItem, item);
            if (info && !info.isAllowBook) {
              let name: string;
              if (item.credential) {
                name = `${item.credential.CheckFirstName}${
                  item.credential.CheckLastName
                  }(${(item.credential.Number || "").substr(0, 6)}...)`;
              }
              cannotArr.push(name);
              item.bookInfo = null;
            } else {
              item.bookInfo = info;
            }
          }
          return item;
        });
        if (cannotArr.length) {
          AppHelper.alert(`${cannotArr.join(",")}，超标不可预订`);
        }
      } else {
        const ok = await AppHelper.alert(
          "是否替换旅客的车次信息？",
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (ok) {
          bookInfos = await this.selectAndReplaceBookInfos(
            currentViewtTainItem,
            bookInfos
          );
        }
      }
    }
  }
  private async selectAndReplaceBookInfos(
    currentViewtTainItem: ICurrentViewtTainItem,
    bookInfos: PassengerBookInfo<ITrainInfo>[]
  ) {
    const m = await this.modalCtrl.create({
      component: SelectAndReplaceTrainInfoComponent,
      componentProps: {
        trainService: this,
        train: currentViewtTainItem.train,
        seat: currentViewtTainItem.selectedSeat,
        bookInfos: this.getBookInfos().map(it => {
          return {
            info: it,
            isSelected: false
          };
        })
      }
    });
    await m.present();
    const result = await m.onDidDismiss();
    const data = result && (result.data as PassengerBookInfo<ITrainInfo>[]);
    if (data && data.length) {
      let cannotArr: string[] = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const info = this.getTrainInfo(currentViewtTainItem, item);
        if (info && !info.isAllowBook) {
          let name: string;
          if (item.credential) {
            name = `${item.credential.CheckFirstName}${
              item.credential.CheckLastName
              }(${(item.credential.Number || "").substr(0, 6)}...)`;
          }
          cannotArr.push(name);
        } else {
          item.bookInfo = info;
        }
      }
      if (cannotArr.length) {
        AppHelper.alert(`${cannotArr.join(",")}，超标不可替换`);
      }
    }
    bookInfos = bookInfos.map(it => {
      const item = data.find(d => d.id == it.id);
      if (item) {
        it.bookInfo = item.bookInfo;
      }
      return it;
    });
    return bookInfos;
  }
  disposal() {
    this.setSearchTrainModel(new SearchTrainModel());
    this.setBookInfoSource([]);
    this.selfCredentials = null;
    this.isInitializingSelfBookInfos = false;
  }
  async loadPolicyedTrainsAsync(
    fn: (status: string) => any
  ): Promise<TrainEntity[]> {
    // 先获取最新的数据
    let trains: TrainEntity[] = [];
    trains = await this.searchAsync(this.getSearchTrainModel());
    if (trains.length == 0) {
      return [];
    }
    const passengers = this.getBookInfos().map(info => info.passenger);
    const notWhitelistPs = passengers.filter(p => p.isNotWhiteList); // 非白名单乘客
    const whitelistPs = passengers.filter(p => !p.isNotWhiteList); // 白名单的乘客，需要计算差标
    const whitelistAccountId = whitelistPs
      .map(p => p.AccountId)
      .reduce((acc, item) => {
        if (!acc.find(it => it == item)) {
          acc.push(item);
        }
        return acc;
      }, []);
    if (notWhitelistPs.length) {
      const policyTrains = await this.getWhitelistPolicyTrains(
        passengers,
        trains,
        fn
      );

      // 非白名单可以预订所有的仓位
      const tmc = await this.tmcService.getTmc();
      const notWhitelistTrains = this.getNotWhitelistPolicyTrains(
        tmc && tmc.Account.Id,
        trains
      );
      this.totalPolicies = policyTrains.concat([notWhitelistTrains]);
    } else {
      if (whitelistAccountId.length) {
        this.totalPolicies = await this.policyAsync(
          trains,
          whitelistAccountId,
          fn
        );
      }
    }
    if (
      this.totalPolicies &&
      this.totalPolicies.length === 0 &&
      passengers.length
    ) {
      trains = [];
      this.totalPolicies = [];
      return [];
    }
    console.log(`所有人的差标：`, this.totalPolicies);
    return trains;
  }
  private async getWhitelistPolicyTrains(
    passengers: StaffEntity[],
    trains: TrainEntity[],
    fn: (status: string) => any
  ) {
    trains = JSON.parse(JSON.stringify(trains || []));
    let policyTrains: TrainPassengerModel[] = [];
    const identity = await this.identityService.getIdentityAsync();
    // 白名单的乘客
    const ps = passengers.filter(p => !p.isNotWhiteList);
    if (ps.length > 0) {
      policyTrains = await this.policyAsync(
        trains,
        ps.map(p => p.AccountId),
        fn
      ).catch(_ => []);
    }
    return policyTrains;
  }
  private getNotWhitelistPolicyTrains(
    PassengerKey: string,
    trains: TrainEntity[]
  ): TrainPassengerModel {
    trains = JSON.parse(JSON.stringify(trains || []));
    const trainPolicie: TrainPassengerModel = new TrainPassengerModel();
    trainPolicie.TrainPolicies = [];
    trains.forEach(it => {
      if (it.Seats) {
        it.Seats.forEach(s => {
          const p = new TrainPolicyModel();
          p.IsAllowBook = true;
          p.Rules = [];
          p.TrainNo = it.TrainNo;
          p.IsForceBook = it.IsForceBook;
          p.SeatType = s.SeatType;
          p.IsAllowBook = true;
          p.Rules = null;
          p.IsForceBook = false;
          s.Policy = p;
          trainPolicie.TrainPolicies.push(p);
        });
      }
    });
    // 非白名单的账号id 统一为一个，tmc的accountid
    trainPolicie.PassengerKey = PassengerKey;
    return trainPolicie;
  }
  async initSelfBookTypeBookInfos(isShowLoading = false) {
    const infos = this.getBookInfos();
    if (
      infos.length === 0 &&
      (await this.staffService.isSelfBookType(isShowLoading))
    ) {
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
  private async setDefaultFilterInfo() {
    const self = await this.staffService.isSelfBookType();
    const infos = this.getBookInfos();
    const unselected = infos.find(it => !it.bookInfo);
    const hasExchange = infos.find(it => it.bookInfo && it.bookInfo.isExchange);
    const hasReselect = infos.find(it => it.isReselect);
    this.setBookInfoSource(
      infos.map((it, idx) => {
        if (infos.length == 1 || self) {
          it.isFilterPolicy = idx == 0;
        } else {
          it.isFilterPolicy =
            (unselected && unselected.id == it.id) ||
            (hasReselect && hasReselect.id == it.id) ||
            (hasExchange && hasExchange.id == (it.bookInfo && it.bookInfo.id));
        }
        return it;
      })
    );
  }
  checkIfSeatIsAllowBook(
    info: PassengerBookInfo<ITrainInfo>,
    seat: TrainSeatEntity,
    train: TrainEntity
  ) {
    const trainInfo = this.getTrainInfo({ selectedSeat: seat, train }, info);
    return trainInfo && trainInfo.isAllowBook;
  }
  removeBookInfo(
    info: PassengerBookInfo<ITrainInfo>,
    isRemovePassenger: boolean
  ) {
    if (info) {
      const delInfo = { ...info };
      const s = this.getSearchTrainModel();
      let bookInfos = this.bookInfos;
      if (isRemovePassenger) {
        bookInfos = bookInfos.filter(item => item.id != info.id);
      } else {
        bookInfos = bookInfos.map(it => {
          if (it.id == delInfo.id) {
            it.bookInfo = null;
          }
          return it;
        });
      }
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
    await this.setDefaultFilterInfo();
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
              AppHelper.getDate(it.ArrivalTime).getTime() / 1000
            );
            it.StartTimeStamp = Math.floor(
              AppHelper.getDate(it.StartTime).getTime() / 1000
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

  getExchangeInfo(ticketId: string): Promise<ExchangeTrainModel> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-GetExchangeInfo`;
    req.IsShowLoading = true;
    req.Version = "2.0";
    req.Timeout = 60;
    req.Data = {
      TicketId: ticketId
    };
    return this.apiService.getPromiseData<ExchangeTrainModel>(req).catch(_ => {
      AppHelper.alert(_.Message || _);
      return null;
    });
  }
  private doRefund(
    ticketId: string
  ): Promise<{ Status: boolean; Id: string; Message: string }> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Refund`;
    req.IsShowLoading = true;
    req.Version = "2.0";
    req.Timeout = 60;
    req.Data = {
      TicketId: ticketId
    };
    return this.apiService.getPromiseData<any>(req);
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
          const rev: { Message: string; Status: boolean } = await this.doRefund(
            ticketId
          ).catch(_ => {
            AppHelper.alert(_.Message || _);
            return null;
          });
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
      const trainStations = await this.getStationsAsync();
      // .catch(_=>[]);
      if (!info || !info.OrderTrainTicket) {
        return;
      }
      let books = this.getBookInfos();
      const passenger = info.BookStaff;
      if (passenger) {
        passenger.AccountId =
          passenger.AccountId || (passenger.Account && passenger.Account.Id);
      }
      const exchangedInfo = {
        ticket: JSON.parse(JSON.stringify(info.OrderTrainTicket)),
        order: JSON.parse(JSON.stringify(info.OrderTrainTicket.Order)),
        insuranceResult: info.InsurnanceAmount
      };
      const b: PassengerBookInfo<ITrainInfo> = {
        passenger: info.BookStaff,
        credential: info.DefaultCredentials,
        id: AppHelper.uuid(),
        isFilterPolicy: true,
        exchangeInfo: exchangedInfo
      };
      books = [b];
      const fromCity = trainStations.find(it => it.Code == info.FromStation);
      const toCity = trainStations.find(it => it.Code == info.ToStation);
      console.log(
        "exchange bookInfo",
        b,
        "fromcity",
        fromCity,
        "tocity",
        toCity
      );
      this.setBookInfoSource(books);
      this.setSearchTrainModel({
        ...this.getSearchTrainModel(),
        isLocked: true,
        isExchange: true,
        isRoundTrip: false,
        fromCity,
        toCity,
        Date: info.GoDate,
      });
      this.router.navigate([AppHelper.getRoutePath("search-train")]);
    } catch (e) {
      console.error(e);
    }
  }
  async policyAsync(
    trains: TrainEntity[],
    passengerIds: string[],
    fn: (status: string) => any
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
    if (fn) {
      fn("正在获取差标");
    }
    const result = await this.apiService
      .getPromiseData<TrainPassengerModel[]>(req)
      .catch(_ => {
        return [];
      });
    if (fn) {
      fn("获取差标完成");
    }
    return result;
  }
  private addoneday(s: TrainEntity) {
    const addDay = s.ArriveDays || "0";
    return +addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Train-Initialize";
    bookDto = {
      ...bookDto,
      Passengers: bookDto.Passengers.map(p => {
        if (p.Policy) {
          p.Policy = {
            ...p.Policy,
            FlightDescription: null,
            TrainDescription: null,
            TrainSeatType: null,
            TrainSeatTypeName: null,
            TrainUpperSeatType: null,
            TrainUpperSeatTypeArray: null,
            TrainUpperSeatTypeName: null,
            HotelDescription: null,
            Setting: null,
          }
        }
        if (p.FlightCabin) {
          p.FlightCabin = { ...p.FlightCabin, RefundChange: null, Variables: null }
        }
        if (p.FlightSegment && p.FlightSegment.Cabins) {
          p.FlightSegment = {
            ...p.FlightSegment,
            Cabins: p.FlightSegment.Cabins.map(c => {
              c.RefundChange = null;
              c.Variables = null;
              return c;
            })
          }
        }
        return p;
      })
    };
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
        // 后台计算服务费根据 item.passenger.AccountId 累加,所以现在需要给每一个 item.passenger.AccountId 平均服务费
        const fees = {};
        Object.keys(res.ServiceFees).forEach(k => {
          let count = 1;
          const one = bookInfos.find(it => it.id == k);
          if (one && one.passenger) {
            count = bookInfos.filter(it => it.passenger && it.passenger.AccountId == one.passenger.AccountId).length;
          }
          fees[k] = +res.ServiceFees[k] / count;
        });
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
  async exchangeBook(bookDto: OrderBookDto): Promise<IBookOrderResult> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Train-ExchangeBook";
    bookDto.Channel = this.tmcService.getChannel();
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<IBookOrderResult>(req);
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
  isExchange?: boolean; // 是否是改签
  isAllowBook?: boolean; // 是否允许预订
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
  color: "success" | "primary" | "warning" | "secondary" | "danger";
}
export class TrainPassengerModel {
  PassengerKey: string;
  TrainPolicies: TrainPolicyModel[];
}
