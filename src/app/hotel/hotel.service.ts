import { DayModel } from "src/app/tmc/models/DayModel";
import { TripType } from "src/app/tmc/models/TripType";
import { HotelEntity } from "./models/HotelEntity";
import { IdentityService } from "./../services/identity/identity.service";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { PassengerBookInfo, TmcService } from "../tmc/tmc.service";
import { Subject, combineLatest } from "rxjs";
import { StaffService } from "../hr/staff.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { ModalController } from "@ionic/angular";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { MapService } from "../services/map/map.service";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { HotelPaymentType } from "./models/HotelPaymentType";
import { RequestEntity } from "../services/api/Request.entity";
import { Storage } from "@ionic/storage";
import * as jsPy from "js-pinyin";
export class SearchHotelModel {
  checkinDate: string;
  checkoutDate: string;
  tripType: TripType;
  isRefreshData?: boolean;
  destinationCity: TrafficlineEntity;
}
export interface LocalHotelCityCache {
  LastUpdateTime: number;
  HotelCities: TrafficlineEntity[];
}
@Injectable({
  providedIn: "root"
})
export class HotelService {
  private bookInfos: PassengerBookInfo<IHotelInfo>[];
  private bookInfoSource: Subject<PassengerBookInfo<IHotelInfo>[]>;
  private searchHotelModelSource: Subject<SearchHotelModel>;
  private searchHotelModel: SearchHotelModel;
  private selfCredentials: CredentialsEntity[];
  private localHotelCities: TrafficlineEntity[];
  private lastUpdateTime = 0;
  constructor(
    private apiService: ApiService,
    identityService: IdentityService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private mapService: MapService,
    private tmcService: TmcService,
    private storage: Storage
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchHotelModelSource = new BehaviorSubject(null);
    combineLatest([
      this.getBookInfoSource(),
      identityService.getIdentitySource()
    ]).subscribe(async ([bookInfos, identity]) => {
      if (identity && identity.Id && identity.Ticket) {
        this.initSelfBookTypeBookInfos();
      }
    });
    identityService.getIdentitySource().subscribe(res => {
      this.disposal();
    });
  }
  private disposal() {
    this.setSearchHotelModel(new SearchHotelModel());
    this.setBookInfoSource([]);
    this.selfCredentials = null;
  }
  getCurPosition() {
    return this.mapService.getCurrentCityPosition();
  }
  getSearchHotelModelSource() {
    return this.searchHotelModelSource.asObservable();
  }
  getSearchHotelModel() {
    return this.searchHotelModel || new SearchHotelModel();
  }
  setSearchHotelModel(m: SearchHotelModel) {
    if (m) {
      this.searchHotelModel = m;
      this.searchHotelModelSource.next(m);
    }
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
        const i: PassengerBookInfo<IHotelInfo> = {
          passenger: staff,
          credential:
            IdCredential ||
            (this.selfCredentials &&
              this.selfCredentials.length &&
              this.selfCredentials[1]) ||
            new CredentialsEntity()
        };
        this.addBookInfo(i);
      }
    }
  }
  addBookInfo(bookInfo: PassengerBookInfo<IHotelInfo>) {
    if (bookInfo) {
      this.setBookInfoSource([...this.getBookInfos(), bookInfo]);
    }
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  private setBookInfoSource(bookInfos: PassengerBookInfo<IHotelInfo>[]) {
    this.bookInfos = bookInfos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  async openCalendar(
    checkInDate: DayModel,
    tripType: TripType
  ): Promise<DayModel[]> {
    if (!checkInDate) {
      return [];
    }
    const s = this.getSearchHotelModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: checkInDate.timeStamp,
        tripType: tripType,
        isMulti: true
      }
    });
    m.present();
    const result = await m.onDidDismiss();
    return result.data as DayModel[];
  }
  async getHotelCityAsync(forceRefresh = false) {
    if (
      !this.localHotelCities ||
      this.localHotelCities.length == 0 ||
      !this.lastUpdateTime
    ) {
      const local = await this.getHotelCitiesFromLocalCache();
      if (local) {
        this.lastUpdateTime = local.LastUpdateTime;
        this.localHotelCities = local.HotelCities;
      }
    }
    if (
      !forceRefresh &&
      this.localHotelCities &&
      this.localHotelCities.length
    ) {
      return this.localHotelCities;
    }
    this.localHotelCities = this.localHotelCities || [];
    const cs = await this.loadHotelCitiesFromServer(this.lastUpdateTime).catch(
      _ => ({ HotelCities: [] as TrafficlineEntity[] })
    );
    if (cs && cs.HotelCities && cs.HotelCities.length) {
      const arr = cs.HotelCities.map(item => {
        if (!item.Pinyin) {
          item.FirstLetter = this.getFirstLetter(item.Name);
        } else {
          item.FirstLetter = item.Pinyin.substring(0, 1).toUpperCase();
        }
        return item;
      });
      this.localHotelCities = [
        ...this.localHotelCities.filter(it => arr.some(c => c.Code == it.Code)),
        ...arr
      ];
      await this.setLocalHotelCityCache(this.localHotelCities);
    }
    return this.localHotelCities;
  }
  private getFirstLetter(name: string) {
    const pyFl = `${jsPy.getFullChars(name)}`.charAt(0);
    return pyFl && pyFl.toUpperCase();
  }
  private async setLocalHotelCityCache(cities: TrafficlineEntity[]) {
    await this.storage.set(`LocalHotelCityCache`, {
      LastUpdateTime: this.lastUpdateTime = Math.floor(Date.now() / 1000),
      HotelCities: cities
    } as LocalHotelCityCache);
  }
  private async getHotelCitiesFromLocalCache(): Promise<LocalHotelCityCache> {
    const local = await this.storage.get(`LocalHotelCityCache`);
    return local;
  }
  private loadHotelCitiesFromServer(lastUpdateTime: number) {
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-HotelCity`;
    req.Data = {
      LastUpdateTime: lastUpdateTime
    };
    return this.apiService.getPromiseData<{
      Trafficlines: any[];
      HotelCities: TrafficlineEntity[];
    }>(req);
  }
}
export interface IHotelInfo {
  hotelEntity: HotelEntity;
  // hotelPolicy: Hotel;
  tripType?: TripType;
  id?: string;
  isLowerSegmentSelected?: boolean;
}
