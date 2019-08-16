import { ModalController } from "@ionic/angular";
import { IdentityService } from "./../services/identity/identity.service";
import { StaffService } from "./../hr/staff.service";
import { Subject, BehaviorSubject } from "rxjs";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable, EventEmitter } from "@angular/core";
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
import { SelectedTrainSegmentInfoComponent } from "./components/selected-train-segment-info/selected-train-segment-info.component";
import { LanguageHelper } from "../languageHelper";
import { CalendarService } from "../tmc/calendar.service";
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
}
export interface ISelectedStation {
  isSelectFrom: boolean;
  isSelectTo: boolean;
  fromStation: TrafficlineEntity;
  toStation: TrafficlineEntity;
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
  currentViewtTainItem: TrainEntity;
  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private staffService: StaffService,
    private tmcService: TmcService,
    private identityService: IdentityService,
    private modalCtrl: ModalController,
    private calendarService: CalendarService
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchModelSource = new BehaviorSubject(new SearchTrainModel());
    this.selectedStationSource = new BehaviorSubject(null);
    this.bookInfoSource.subscribe(infos => {
      this.initSelfBookTypeBookInfos(infos);
    });
    identityService.getIdentity().subscribe(res => {
      if (!res || !res.Ticket || !res.Id) {
        this.disposal();
      }
    });
  }
  disposal() {
    this.setSearchTrainModel(new SearchTrainModel());
    this.setBookInfoSource([]);
    this.currentViewtTainItem = null;
    this.selfCredentials = null;
  }
  private async initSelfBookTypeBookInfos(infos: PassengerBookInfo[]) {
    if (infos.length === 0) {
      let IdCredential: CredentialsEntity;
      if (this.staffService.isSelfBookType) {
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
        this.addBookInfo({
          passenger: staff,
          credential:
            IdCredential ||
            (this.selfCredentials &&
              this.selfCredentials.length &&
              this.selfCredentials[1]) ||
            new CredentialsEntity()
        });
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
    this.bookInfos.push(arg);
    this.setBookInfoSource(this.bookInfos);
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
    this.bookInfos = this.bookInfos.filter(item => item.id != info.id);
    this.setBookInfoSource(this.bookInfos);
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
    req.Timeout = 60;
    req.Data = {
      Passengers: passengerIds.join(","),
      Trains: trains
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
  /// <summary>
  /// 违反具体的差标
  /// </summary>
  Rules: string[];
}
export class TrainPassengerModel {
  PassengerKey: string;
  TrainPolicies: TrainPolicyModel[];
}
