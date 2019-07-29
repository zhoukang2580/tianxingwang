import { Subject, BehaviorSubject } from "rxjs";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { TripType } from "../tmc/models/TripType";
import { TrainEntity, TrainSeatType } from "./models/TrainEntity";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { StaffEntity } from "../hr/staff.service";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import { Storage } from "@ionic/storage";
import * as jsPy from "js-pinyin";
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
  private searchModel: SearchTrainModel;
  private selectedStationSource: Subject<ISelectedStation>;
  private bookInfos: TrainBookInfo[]=[];
  private bookInfoSource: Subject<TrainBookInfo[]>;
  private searchModelSource: Subject<SearchTrainModel>;
  constructor(private apiService: ApiService, private storage: Storage) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchModelSource = new BehaviorSubject(new SearchTrainModel());
    this.selectedStationSource = new BehaviorSubject(null);
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
    return this.searchModel || new SearchTrainModel();
  }
  setSearchTrainModel(m: SearchTrainModel) {
    this.searchModel = m || new SearchTrainModel();
    this.searchModelSource.next(this.searchModel);
  }
  addBookInfo(arg: TrainBookInfo) {
    this.bookInfos.push(arg);
    this.setBookInfoSource(this.bookInfos);
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
    if (result && result.Trafficlines && result.Trafficlines.length) {
      result.Trafficlines = result.Trafficlines.map(item => {
        if (!item.Pinyin) {
          item.FirstLetter = this.getFirstLetter(item.Nickname);
        } else {
          item.FirstLetter = item.Pinyin.substring(0, 1).toUpperCase();
        }
        return item;
      });
      await this.cacheTrafficLinesAsync(result.Trafficlines);
    }
    this.localTrafficLine = {
      lastUpdateTime: Math.floor(Date.now() / 1000),
      TrafficLines: (result && result.Trafficlines) || []
    };
    return this.localTrafficLine.TrafficLines;
  }
  private setBookInfoSource(infos: TrainBookInfo[]) {
    this.bookInfos = infos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  removeBookInfo(info: TrainBookInfo) {
    this.bookInfos = this.bookInfos.filter(item => item.id != info.id);
    this.setBookInfoSource(this.bookInfos);
  }
  private async cacheTrafficLinesAsync(lines: TrafficlineEntity[]) {
    const now = Math.floor(Date.now() / 1000);
    await this.storage.set(KEY_TRAIN_TRAFFICLINES_DATA, {
      lastUpdateTime: now,
      TrafficLines: lines
    } as CacheTrafficLineModel);
    const local: CacheTrafficLineModel = {
      lastUpdateTime: now,
      TrafficLines: lines
    };
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
    req.Data = condition;
    return this.apiService.getPromiseData<TrainEntity[]>(req).catch(_ => {
      return [];
    });
  }
  policyAsync(
    trains: TrainEntity,
    passengerIds: string[]
  ): Promise<PassengerModel[]> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Policy`;
    req.IsShowLoading = true;
    req.Timeout = 60;
    req.Data = {
      Passengers: passengerIds.join(","),
      Trains: trains
    };
    return this.apiService.getPromiseData<PassengerModel[]>(req).catch(_ => {
      return [];
    });
  }
  scheduleAsync(data: SearchTrainModel): Promise<TrainEntity[]> {
    const req = new RequestEntity();
    req.Method = `TmcApiTrainUrl-Home-Schedule`;
    req.IsShowLoading = true;
    req.Timeout = 60;
    req.Data = data;
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
export interface TrainBookInfo {
  passenger: StaffEntity;
  credential: CredentialsEntity;
  isNotWhitelist?: boolean;
  trainInfo?: ITrainInfo;
  id?: string;
  isReplace?: boolean;
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
export class PassengerModel {
  PassengerKey: string;
  TrainPolicies: TrainPolicyModel[];
}
