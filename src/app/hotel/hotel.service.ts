import { AppHelper } from "src/app/appHelper";
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
import * as moment from "moment";
import { filter, map } from "rxjs/operators";
import { HotelQueryEntity } from "./models/HotelQueryEntity";
import { HotelResultEntity } from "./models/HotelResultEntity";
import { HotelModel } from "./models/HotelModel";
import { HotelPassengerModel } from "./models/HotelPassengerModel";
import { CalendarService } from "../tmc/calendar.service";
import { ConditionModel } from "./models/ConditionModel";
import { HotelDayPriceEntity } from "./models/HotelDayPriceEntity";
export class SearchHotelModel {
  checkInDate: string;
  checkOutDate: string;
  tripType: TripType;
  isRefreshData?: boolean;
  destinationCity: TrafficlineEntity;
  tag: "Agreement" | "" | "SpecialPrice";
  hotelType: "agreement" | "normal" | "specialprice";
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
  private isInitializingSelfBookInfos = false;
  constructor(
    private apiService: ApiService,
    identityService: IdentityService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private mapService: MapService,
    private tmcService: TmcService,
    private storage: Storage,
    private calendarService: CalendarService
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchHotelModelSource = new BehaviorSubject(null);
    this.initSearchHotelModel();
    combineLatest([
      this.getBookInfoSource(),
      identityService.getIdentitySource()
    ]).subscribe(async ([bookInfos, identity]) => {
      if (identity && identity.Id && identity.Ticket) {
        await this.initSelfBookTypeBookInfos();
      }
    });
    identityService.getIdentitySource().subscribe(res => {
      this.disposal();
    });
  }
  private disposal() {
    this.initSearchHotelModel();
    this.setBookInfos([]);
    this.selfCredentials = null;
    this.isInitializingSelfBookInfos = false;
  }
  private initSearchHotelModel() {
    const m = new SearchHotelModel();
    m.checkInDate = moment().format("YYYY-MM-DD");
    m.checkOutDate = moment()
      .add(1, "days")
      .format("YYYY-MM-DD");
    m.destinationCity = new TrafficlineEntity();
    m.destinationCity.CityName = "北京";
    m.destinationCity.Name = "北京";
    m.destinationCity.Code = m.destinationCity.CityCode = "1101";
    this.setSearchHotelModel(m);
  }
  getCurPosition() {
    return this.mapService.getCurrentCityPosition();
  }
  getSearchHotelModelSource() {
    return this.searchHotelModelSource.asObservable();
  }
  getSearchHotelModel() {
    return this.searchHotelModel;
  }
  setSearchHotelModel(m: SearchHotelModel) {
    if (m) {
      this.searchHotelModel = m;
      this.searchHotelModelSource.next(m);
    }
  }
  private async initSelfBookTypeBookInfos() {
    const isSelf = await this.staffService.isSelfBookType();
    const infos = this.getBookInfos();
    console.log("initSelfBookTypeBookInfos", infos);
    if (infos.length === 0 && isSelf) {
      if (this.isInitializingSelfBookInfos) {
        return;
      }
      this.isInitializingSelfBookInfos = true;
      let IdCredential: CredentialsEntity;
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
            this.selfCredentials[0]) ||
          new CredentialsEntity()
      };
      this.addBookInfo(i);
    }
  }
  addBookInfo(bookInfo: PassengerBookInfo<IHotelInfo>) {
    console.log("hotel,addbookinfo", bookInfo);
    if (bookInfo) {
      const bookInfos = this.getBookInfos();
      bookInfos.push(bookInfo);
      this.setBookInfos(bookInfos);
    }
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  private setBookInfos(bookInfos: PassengerBookInfo<IHotelInfo>[]) {
    console.log("hotel set book infos ", bookInfos);
    this.bookInfos = bookInfos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  async openCalendar(
    checkInDate?: DayModel,
    tripType: TripType = TripType.checkIn,
    title = "请选择入离店日期"
  ): Promise<DayModel[]> {
    if (!checkInDate) {
      checkInDate = this.calendarService.generateDayModel(moment());
    }
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: checkInDate.timeStamp,
        tripType: tripType,
        isMulti: true,
        title
      }
    });
    m.present();
    const result = await m.onDidDismiss();
    if (result.data) {
      const data = result.data as DayModel[];
      if (data.length == 2) {
        this.setSearchHotelModel({
          ...this.getSearchHotelModel(),
          checkInDate: data[0].date,
          checkOutDate: data[1].date
        });
      }
    }
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
        ...this.localHotelCities.filter(it => !arr.some(c => c.Code == it.Code)),
        ...arr
      ];
      await this.setLocalHotelCityCache(this.localHotelCities);
    }
    return this.localHotelCities;
  }
  getConditions(cityCode?: string) {
    const req = new RequestEntity();
    cityCode =
      cityCode ||
      (this.getSearchHotelModel().destinationCity &&
        this.getSearchHotelModel().destinationCity.Code);
    req.Method = `TmcApiHotelUrl-Condition-Gets`;
    req.Data = {
      cityCode
    };
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<ConditionModel>(req);
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
  getHotelList(query: HotelQueryEntity) {
    const hotelquery={
      ...query
    }
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-List`;
    const city = this.getSearchHotelModel().destinationCity;
    hotelquery.CityCode = city && city.Code;
    hotelquery.BeginDate = this.getSearchHotelModel().checkInDate;
    hotelquery.EndDate = this.getSearchHotelModel().checkOutDate;
    hotelquery.IsLoadDetail = true;
    hotelquery.Tag = this.getSearchHotelModel().tag;
    req.Data = {
      ...hotelquery,
      travelformid: AppHelper.getQueryParamers()["travelformid"] || "",
      hotelType: this.getSearchHotelModel().hotelType
    };
    req.IsShowLoading = true;
    return this.apiService.getResponse<HotelResultEntity>(req).pipe(
      map(result => {
        if (result && result.Data && result.Data.HotelDayPrices) {
          result.Data.HotelDayPrices = result.Data.HotelDayPrices.map(it => {
            if (it.Hotel && it.Hotel.Variables) {
              it.Hotel.VariablesJsonObj = JSON.parse(it.Hotel.Variables);
            }
            return it;
          });
        }
        return result;
      })
    );
  }
  getHotelPolicyAsync(hotels: HotelModel[], passengerIds: string[]) {
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-Detail`;
    req.Version = "1.0";
    req.Data = {
      data: JSON.stringify(hotels),
      passengers: passengerIds.join(",")
    };
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<HotelPassengerModel[]>(req);
  }
  private loadHotelCitiesFromServer(lastUpdateTime: number) {
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-City-Gets`;
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
