import { AppHelper } from "src/app/appHelper";
import { ModalController } from "@ionic/angular";
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
import { PassengerBookInfo, TmcService } from "../tmc/tmc.service";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import * as moment from "moment";
import { LanguageHelper } from "../languageHelper";
import { CalendarService } from "../tmc/calendar.service";
import { TrainSeatEntity } from "./models/TrainSeatEntity";
import { Router } from "@angular/router";
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
  isRefreshData?: boolean;
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
  private bookInfos: PassengerBookInfo[] = [];
  private bookInfoSource: Subject<PassengerBookInfo[]>;
  private searchModelSource: Subject<SearchTrainModel>;
  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private staffService: StaffService,
    private tmcService: TmcService,
    private identityService: IdentityService,
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private router: Router
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchModelSource = new BehaviorSubject(new SearchTrainModel());
    this.selectedStationSource = new BehaviorSubject(null);
    combineLatest([
      this.getBookInfoSource(),
      this.identityService.getIdentity()
    ]).subscribe(async ([infos, identity]) => {
      if (identity && identity.Ticket) {
        this.initSelfBookTypeBookInfos();
      }
    });
    identityService.getIdentity().subscribe(res => {
      if (!res || !res.Ticket || !res.Id) {
        this.disposal();
      }
    });
  }
  async reelectBookInfo(bookInfo: PassengerBookInfo) {
    bookInfo.isReplace = true;
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss();
    }
    this.setSearchTrainModel({
      ...this.getSearchTrainModel(),
      isLocked: false,
      tripType: TripType.departureTrip
    });
    if (await this.staffService.isSelfBookType()) {
      this.setBookInfoSource([]);
    }
    this.router.navigate([AppHelper.getRoutePath("search-train")]);
  }
  async checkCanAdd() {
    if (this.getBookInfos().find(it => it.isReplace)) {
      return true;
    }
    const bookInfos = this.getBookInfos().filter(it => !!it.trainInfo);
    if (!(await this.staffService.isSelfBookType())) {
      if (bookInfos.length >= 9) {
        return false;
      }
    }
    if (await this.staffService.isSelfBookType()) {
      if (bookInfos.length == 2 && this.getSearchTrainModel().isRoundTrip) {
        return false;
      }
      if (bookInfos.length == 1 && !this.getSearchTrainModel().isRoundTrip) {
        return false;
      }
    }
    return true;
  }
  async selectReturnTrip() {
    const infos = this.getBookInfos();
    const s = this.getSearchTrainModel();
    if (
      !(await this.staffService.isSelfBookType()) ||
      infos.length == 0 ||
      !s.isRoundTrip
    ) {
      if (s.isLocked) {
        this.setSearchTrainModel({
          ...s,
          isLocked: false,
          isRefreshData: false
        });
      }
      return;
    }
    const go = infos.find(
      it => it.trainInfo && it.trainInfo.tripType == TripType.departureTrip
    );
    if (infos.length == 1) {
      this.addBookInfo({
        ...infos[0],
        trainInfo: null
      });
    }
    if (go) {
      const backParams = {
        ...s
      };
      backParams.fromCity = s.toCity;
      backParams.toCity = s.fromCity;
      backParams.FromStation = s.ToStation;
      backParams.ToStation = s.FromStation;
      backParams.Date = s.BackDate;
      backParams.isLocked = true;
      backParams.tripType = TripType.returnTrip;
      backParams.isRefreshData = true;
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
      if (bookInfos && bookInfos.length) {
        const passenger = bookInfos[0].passenger;
        const accountId =
          (passenger && passenger.AccountId) ||
          (passenger && passenger.Account && passenger.Account.Id);
        if (!currentViewtTainItem.selectedSeat.Policy) {
          const policy = currentViewtTainItem.totalPolicies.find(
            k => k.PassengerKey == accountId
          );
          if (policy) {
            currentViewtTainItem.selectedSeat.Policy = policy.TrainPolicies.find(
              i =>
                i.TrainNo == currentViewtTainItem.train.TrainNo &&
                i.SeatType == currentViewtTainItem.selectedSeat.SeatType
            );
          }
        }
        const trainInfo = {
          trainEntity: currentViewtTainItem.train,
          trainPolicy: currentViewtTainItem.selectedSeat.Policy,
          tripType: TripType.departureTrip,
          id: AppHelper.uuid(),
          selectedSeat: currentViewtTainItem.selectedSeat
        };
        const s = this.getSearchTrainModel();
        if (!s.isRoundTrip) {
          // 单程
          trainInfo.tripType = TripType.departureTrip;
          bookInfos = [
            {
              ...bookInfos[0],
              trainInfo,
              id: AppHelper.uuid()
            }
          ];
        } else {
          // 往返
          trainInfo.tripType = TripType.departureTrip;
          const go = bookInfos.find(
            it =>
              it.trainInfo && it.trainInfo.tripType == TripType.departureTrip
          );
          if (go) {
            trainInfo.tripType = TripType.returnTrip;
            bookInfos = [
              go,
              {
                ...go,
                trainInfo,
                id: AppHelper.uuid()
              }
            ];
          } else {
            bookInfos = [
              {
                ...bookInfos[0],
                trainInfo,
                id: AppHelper.uuid()
              }
            ];
          }
        }
      } else {
        this.initSelfBookTypeBookInfos();
      }

      this.setBookInfoSource(bookInfos);
    }
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
        // 给未选择的乘客选择火车信息
        if (
          !bookInfo.trainInfo ||
          !bookInfo.trainInfo.trainPolicy ||
          !bookInfo.trainInfo.trainEntity
        ) {
          bookInfo.trainInfo = {
            trainEntity: currentViewtTainItem.train,
            trainPolicy: currentViewtTainItem.selectedSeat.Policy,
            tripType,
            id: AppHelper.uuid(),
            selectedSeat: currentViewtTainItem.selectedSeat
          };
        }
        // 修改重选的火车信息,每次只能重选一个，所以直接覆盖重选的即可
        if (bookInfo.isReplace) {
          bookInfo.trainInfo = {
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
  }
  private async initSelfBookTypeBookInfos() {
    const infos = this.getBookInfos();
    if (infos.length === 0 && (await this.staffService.isSelfBookType())) {
      let IdCredential: CredentialsEntity;
      if (await this.staffService.isSelfBookType()) {
        const staff = await this.staffService.getStaff();
        if (!this.selfCredentials || this.selfCredentials.length === 0) {
          const res = await this.tmcService
            .getPassengerCredentials([staff.AccountId])
            .catch(_ => ({ [staff.AccountId]: [] }));
          this.selfCredentials = res[staff.AccountId];
        }
        IdCredential =
          this.selfCredentials &&
          this.selfCredentials.find(c => c.Type == CredentialsType.IdCard);
        const i = {
          passenger: staff,
          credential:
            IdCredential ||
            (this.selfCredentials &&
              this.selfCredentials.length &&
              this.selfCredentials[1]) ||
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
    this.searchModel = m || new SearchTrainModel();
    this.searchModelSource.next(this.searchModel);
  }
  addBookInfo(arg: PassengerBookInfo) {
    console.log("train add bookInfo", arg);
    if (arg) {
      arg.id = AppHelper.uuid();
      this.bookInfos.push(arg);
      this.setBookInfoSource(this.bookInfos);
    }
  }
  async openCalendar(isMulti: boolean) {
    const goTrain = this.getBookInfos().find(
      f => f.trainInfo && f.trainInfo.tripType == TripType.departureTrip
    );
    const s = this.getSearchTrainModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime:
          goTrain &&
          goTrain.trainInfo &&
          goTrain.trainInfo.trainEntity &&
          goTrain.trainInfo.trainEntity.ArrivalTime,
        tripType: s.tripType,
        isMulti: isMulti
      }
    });
    m.present();
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
  private setBookInfoSource(infos: PassengerBookInfo[]) {
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
  removeBookInfo(info: PassengerBookInfo) {
    if (info) {
      this.bookInfos = this.bookInfos.filter(item => item.id != info.id);
      this.setBookInfoSource(this.bookInfos);
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
  searchAsync(condition: SearchTrainModel): Promise<TrainEntity[]> {
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
        return [];
      });
  }
  async dismissAllTopOverlays() {
    let i = 10;
    let top = await this.modalCtrl.getTop();
    while (top && --i > 0) {
      await top.dismiss().catch(_ => {});
      top = await this.modalCtrl.getTop();
    }
  }

  policyAsync(
    trains: TrainEntity[],
    passengerIds: string[]
  ): Promise<TrainPassengerModel[]> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Policy`;
    req.IsShowLoading = true;
    req.Version = "1.0";
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
  getTotalSegments(): TrainEntity[] {
    return [];
  }
  private addoneday(s: TrainEntity) {
    const addDay =
      new Date(s.ArrivalTime).getDate() - new Date(s.StartTime).getDate();
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
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
  isLowerSegmentSelected?: boolean;
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
  train: TrainEntity;
}
export class TrainPassengerModel {
  PassengerKey: string;
  TrainPolicies: TrainPolicyModel[];
}
