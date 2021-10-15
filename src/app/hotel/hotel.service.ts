import { environment } from "src/environments/environment";
import { RoomEntity } from "./models/RoomEntity";
import { AppHelper } from "src/app/appHelper";
import { DayModel } from "src/app/tmc/models/DayModel";
import { TripType } from "src/app/tmc/models/TripType";
import { HotelEntity } from "./models/HotelEntity";
import { IdentityService } from "./../services/identity/identity.service";
import {
  BehaviorSubject,
  throwError,
  from,
  of,
  Observable,
  Subscription,
} from "rxjs";
import { Injectable, EventEmitter } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import {
  PassengerBookInfo,
  TmcService,
  InitialBookDtoModel,
  FlightHotelTrainType,
  IBookOrderResult,
} from "../tmc/tmc.service";
import { Subject, combineLatest } from "rxjs";
import { HrService } from "../hr/hr.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { ModalController } from "@ionic/angular";
import { MapPoint, MapService } from "../services/map/map.service";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { HotelPaymentType } from "./models/HotelPaymentType";
import { RequestEntity } from "../services/api/Request.entity";
import * as jsPy from "js-pinyin";
import * as moment from "moment";
import { filter, map, switchMap, delay, finalize } from "rxjs/operators";
import { HotelQueryEntity } from "./models/HotelQueryEntity";
import { HotelResultEntity } from "./models/HotelResultEntity";
import { HotelModel } from "./models/HotelModel";
import { HotelPassengerModel } from "./models/HotelPassengerModel";
import { CalendarService } from "../tmc/calendar.service";
import { HotelConditionModel } from "./models/ConditionModel";
import { HotelDayPriceEntity } from "./models/HotelDayPriceEntity";
import { RoomPlanEntity } from "./models/RoomPlanEntity";
import { HotelPolicyModel } from "./models/HotelPolicyModel";
import { HotelSupplierType } from "./models/HotelSupplierType";
import { RoomPlanRuleType } from "./models/RoomPlanRuleType";
import { OrderBookDto } from "../order/models/OrderBookDto";
import { ConfigEntity } from "../services/config/config.entity";
import { AgentEntity } from "../tmc/models/AgentEntity";
import { CityEntity } from "../tmc/models/CityEntity";
import { AgentRegionType } from "../tmc/models/AgentRegionType";
import { StorageService } from "../services/storage-service.service";
import { LogService } from "../services/log/log.service";
export class SearchHotelModel {
  checkInDate: string;
  checkOutDate: string;
  tripType: TripType;
  destinationCity: TrafficlineEntity;
  tag: "Agreement" | "" | "SpecialPrice";
  hotelType: "agreement" | "normal" | "specialprice";
  searchText: { Value?: string; Text: string; Lat?: string; Lng?: string };
  myPosition?: { Text: string; Lat?: string; Lng?: string };
}
export interface LocalHotelCityCache {
  LastUpdateTime: number;
  HotelCities: TrafficlineEntity[];
}
@Injectable({
  providedIn: "root",
})
export class HotelService {
  private fetchPassengerCredentials: { promise: Promise<any> };
  private loadHotelCitiesFromServerPs: {
    [lastUpdatetime: number]: Promise<{ Trafficlines: TrafficlineEntity[] }>;
  } = {};
  private hotelConditionSubscription = Subscription.EMPTY;
  private bookInfos: PassengerBookInfo<IHotelInfo>[];
  private bookInfoSource: Subject<PassengerBookInfo<IHotelInfo>[]>;
  private searchHotelModelSource: Subject<SearchHotelModel>;
  private hotelQuerySource: Subject<HotelQueryEntity>;
  private conditionModelSource: Subject<HotelConditionModel>;
  private searchHotelModel: SearchHotelModel;
  private selfCredentials: CredentialsEntity[];
  private localHotelCities: TrafficlineEntity[];
  private lastUpdateTime = 0;
  private isInitializingSelfBookInfos = false;
  private conditionModel: HotelConditionModel;
  private isLoadingCondition = false;
  HotelDefaultImg: string;
  RoomDefaultImg: string;
  // private hotelPolicies: { [hotelId: string]: HotelPassengerModel[] };
  private hotelQueryModel: HotelQueryEntity;
  private testData: {
    [pageIndex: number]: { HotelDayPrices: any[]; DataCount?: number };
  };
  get isAgent() {
    return this.tmcService.isAgent;
  }
  // curViewHotel: HotelDayPriceEntity;
  showImages: any[];
  showRoomDetailInfo: {
    room: RoomEntity;
    config: ConfigEntity;
    agent?: AgentEntity;
    roomImages: string[];
    close?: EventEmitter<any>;
    bookRoom?: EventEmitter<any>;
    hotel: HotelEntity;
  };
  constructor(
    private apiService: ApiService,
    identityService: IdentityService,
    private staffService: HrService,
    private modalCtrl: ModalController,
    private mapService: MapService,
    private tmcService: TmcService,
    private storage: StorageService,
    private calendarService: CalendarService,
    private logService: LogService
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchHotelModelSource = new BehaviorSubject(null);
    this.hotelQuerySource = new BehaviorSubject(new HotelQueryEntity());
    this.conditionModelSource = new BehaviorSubject(null);
    this.initSearchHotelModel();
    identityService.getIdentitySource().subscribe((res) => {
      this.disposal();
    });
  }
  hotelIsCanSelectYesterday() {
    const hours = new Date().getHours();
    const h = 5;
    if (environment.production && !environment.mockProBuild) {
      return hours <= h && hours >= 0;
    }
    if (hours <= h && hours >= 0) {
      return true;
    }
    if (window["hotelHours"]) {
      if (!environment.production || environment.mockProBuild) {
        return !!(window["hotelHours"] >= hours);
      }
    }
    return false;
  }
  setHotelQuerySource(query: HotelQueryEntity) {
    this.hotelQueryModel = query;
    this.hotelQuerySource.next(query);
  }
  getHotelQuerySource() {
    return this.hotelQuerySource.asObservable();
  }
  getHotelQueryModel() {
    if (!this.hotelQueryModel) {
      this.setHotelQuerySource(new HotelQueryEntity());
    }
    return this.hotelQueryModel;
  }
  getRules(roomPlan: RoomPlanEntity) {
    return this.getRoomRateRule(roomPlan);
  }
  checkRoomPlanIsFreeBook(roomPlan: RoomPlanEntity) {
    if (roomPlan) {
      roomPlan.VariablesJsonObj =
        roomPlan.VariablesJsonObj ||
        (roomPlan.Variables && JSON.parse(roomPlan.Variables)) ||
        {};
      return (
        roomPlan.VariablesJsonObj.IsSelfPayAmount &&
        roomPlan.VariablesJsonObj.SelfPayAmount > 0
      );
    }
    return false;
  }
  getRoomRateRuleMessage(roomPlan: RoomPlanEntity) {
    if (!roomPlan || !roomPlan.RoomPlanRules) {
      return "";
    }
    return roomPlan.RoomPlanRules.filter((it) => !!it.Description)
      .map((it) => it.Description)
      .join(",");
  }
  getAvgPrice(plan: RoomPlanEntity) {
    let price = 0;
    if (plan && plan.VariablesJsonObj) {
      price = plan.VariablesJsonObj["AvgPrice"];
    }
    if (!price) {
      if (plan && plan.Variables) {
        plan.VariablesJsonObj = JSON.parse(plan.Variables);
        price = plan.VariablesJsonObj["AvgPrice"];
      }
    }
    if (price) {
      return price;
    }
    price = (plan.RoomPlanPrices || []).reduce(
      (acc, it) => (acc = +AppHelper.add(acc, +it.Price)),
      0
    );
    price = +AppHelper.div(price, (plan.RoomPlanPrices || []).length || 1);
    return price;
  }
  private getRoomRateRule(plan: RoomPlanEntity) {
    // 限时取消 不可取消 规则
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["RoomRateRule"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["RoomRateRule"];
    }
  }
  getInstantConfirmation(plan: RoomPlanEntity) {
    // 限时取消 不可取消 规则
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["InstantConfirmation"] == true;
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["InstantConfirmation"] == true;
    }
  }
  getBreakfast(plan: RoomPlanEntity) {
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["Breakfast"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["Breakfast"];
    }
  }
  getFullHouseOrCanBook(plan: RoomPlanEntity): string {
    return this.getVariablesObjValue(plan, "FullHouseOrCanBook");
  }
  private getVariablesObjValue(plan: RoomPlanEntity, key: string) {
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj[key];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj[key];
    }
    return null;
  }
  isFull(p: RoomPlanEntity) {
    const res = this.getFullHouseOrCanBook(p);
    return res && res.toLowerCase().includes("full");
  }
  isNoPermission(p: RoomPlanEntity) {
    const res = this.getFullHouseOrCanBook(p);
    return res && res.toLowerCase().includes("nopermission");
  }
  getRoomArea(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find((it) => it.Tag == "Area" || it.Name == "面积")
    );
  }
  getFloor(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find((it) => it.Tag == "Floor" || it.Name == "楼层")
    );
  }
  getRenovationDate(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find((it) => it.Tag == "RenovationDate")
    );
  }
  getComments(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find((it) => it.Tag == "Comments")
    );
  }
  getCapacity(room: RoomEntity) {
    const one =
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(
        (it) =>
          it.Tag == "Capacity" || (it.Name && it.Name.includes("入住人数"))
      );
    return one && one.Description && one;
  }
  getBedType(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(
        (it) => it.Tag == "BedType" || (it.Name && it.Name.includes("床型"))
      )
    );
  }

  getRoomPlanDescriptions(room: RoomEntity) {
    const itm =
      room &&
      room.RoomDetails &&
      room.RoomDetails.find((it) => it.Name == "描述");
    if (!itm || !itm.Description) {
      return [];
    }
    return itm.Description.split("、");
  }
  async getConditions(forceFetch = false) {
    const city = this.getSearchHotelModel().destinationCity;
    forceFetch =
      forceFetch ||
      city.Code !=
        (this.conditionModel &&
          this.conditionModel.city &&
          this.conditionModel.city.Code);
    if (
      forceFetch ||
      !this.conditionModel ||
      !this.conditionModel.Amenities ||
      !this.conditionModel.Brands ||
      !this.conditionModel.Geos
    ) {
      this.conditionModel = await this.getHotelConditionsAsync(
        city && city.Code
      ).catch((_) => null);
      // console.log(JSON.stringify(this.conditionModel));
      if (this.conditionModel) {
        this.conditionModel.city = this.getSearchHotelModel().destinationCity;
        if (this.conditionModel.Geos) {
          this.conditionModel.Geos = this.conditionModel.Geos.map((geo) => {
            if (geo.Variables) {
              geo.VariablesJsonObj = JSON.parse(geo.Variables);
            }
            return geo;
          });
        }
        if (!this.conditionModel.Tmc) {
          this.conditionModel.Tmc = await this.tmcService
            .getTmc()
            .catch((_) => null);
        }
      }
    }
    return this.conditionModel;
  }
  private disposal() {
    this.initSearchHotelModel();
    this.setBookInfos([]);
    this.selfCredentials = null;
    this.isInitializingSelfBookInfos = false;
    this.hotelQueryModel = null;
  }
  private initSearchHotelModel() {
    const m = new SearchHotelModel();
    m.checkInDate = moment().format("YYYY-MM-DD");
    m.checkOutDate = moment().add(1, "days").format("YYYY-MM-DD");
    m.destinationCity = new TrafficlineEntity();
    m.destinationCity.CityName = "北京";
    m.destinationCity.Name = "北京";
    m.destinationCity.Code = m.destinationCity.CityCode = "1101";
    m.hotelType = "normal";
    this.setSearchHotelModel(m);
  }
  private async getCurPosition() {
    const res = await this.mapService.getMyPositionInfo();
    return res;
  }
  async getMyPosition(isByUser = false) {
    try {
      console.log("getMyPosition this.searchHotelModel", this.searchHotelModel);
      if (this.searchHotelModel) {
        const curPos = await this.getCurPosition();
        console.log("onPosition curPos ", curPos);
        const cities = await this.getHotelCityAsync();
        if (cities) {
          const cName = curPos && curPos.position && curPos.position.cityName;
          let c: TrafficlineEntity;
          if (cName) {
            c = cities.find(
              (it) =>
                it.Name == cName ||
                cName.includes(it.Name) ||
                it.Name.includes(cName)
            );
          }
          if (!c) {
            c = await this.getCityByMap({
              lat: curPos.position.lat,
              lng: curPos.position.lng,
            }).catch(() => null);
          }
          if (c) {
            const city = c;
            this.setSearchHotelModel({
              ...this.getSearchHotelModel(),
              destinationCity: city,
              myPosition:
                curPos && curPos.position
                  ? {
                      Lat: curPos.position.lat,
                      Lng: curPos.position.lng,
                      Text:
                        isByUser && curPos.position.address
                          ? `${curPos.position.address.city}${curPos.position.address.district}${curPos.position.address.street}`
                          : "",
                    }
                  : null,
            });
            await this.getConditions(isByUser);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  getSearchHotelModelSource() {
    return this.searchHotelModelSource.asObservable();
  }
  getSearchHotelModel() {
    return this.searchHotelModel;
  }
  setConditionModelSource(c: HotelConditionModel) {
    this.conditionModel = c;
    this.conditionModelSource.next(c);
  }
  getConditionModelSource() {
    return this.conditionModelSource.asObservable();
  }
  setSearchHotelModel(m: SearchHotelModel) {
    if (m) {
      this.searchHotelModel = m;
      this.searchHotelModel.tag =
        m.hotelType == "normal"
          ? ""
          : m.hotelType == "agreement"
          ? "Agreement"
          : "SpecialPrice";
      this.searchHotelModelSource.next(this.searchHotelModel);
    }
  }
  private getPassengerCredentials(
    accountIds: string[],
    isShowLoading: boolean
  ) {
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
        }),
    };
    return this.fetchPassengerCredentials.promise;
  }
  private async initSelfBookTypeBookInfos(isShowLoading = false) {
    const isSelf = await this.staffService.isSelfBookType(isShowLoading);
    const infos = this.getBookInfos();
    if (infos.length === 0 && isSelf) {
      if (this.isInitializingSelfBookInfos) {
        return;
      }
      this.isInitializingSelfBookInfos = true;
      let IdCredential: CredentialsEntity;
      const staff = await this.staffService.getStaff(false, isShowLoading);
      if (!this.selfCredentials || this.selfCredentials.length === 0) {
        const res = await this.getPassengerCredentials(
          [staff.AccountId],
          isShowLoading
        ).catch((_) => ({ [staff.AccountId]: [] }));
        this.selfCredentials = res[staff.AccountId];
      }
      IdCredential =
        this.selfCredentials &&
        this.selfCredentials.find((c) => c.Type == CredentialsType.IdCard);
      const i: PassengerBookInfo<IHotelInfo> = {
        id: AppHelper.uuid(),
        passenger: staff,
        credential:
          IdCredential ||
          (this.selfCredentials &&
            this.selfCredentials.length &&
            this.selfCredentials[0]) ||
          new CredentialsEntity(),
      };
      this.addBookInfo(i);
      this.isInitializingSelfBookInfos = false;
    }
  }
  addBookInfo(bookInfo: PassengerBookInfo<IHotelInfo>) {
    console.log("hotel,addbookinfo", bookInfo);
    if (bookInfo) {
      bookInfo.id = AppHelper.uuid();
      const bookInfos = this.getBookInfos();
      bookInfos.push(bookInfo);
      this.setBookInfos(bookInfos);
    }
  }
  removeBookInfo(
    bookInfo: PassengerBookInfo<IHotelInfo>,
    isRemovePassenger: boolean
  ) {
    const arg = { ...bookInfo };
    if (isRemovePassenger) {
      this.bookInfos = this.bookInfos.filter((it) => it.id !== arg.id);
    } else {
      this.bookInfos = this.bookInfos.map((it) => {
        if (it.id == arg.id) {
          it.bookInfo = null;
        }
        return it;
      });
    }
    this.setBookInfos(this.bookInfos);
  }
  removeAllBookInfos() {
    this.setBookInfos([]);
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  setBookInfos(bookInfos: PassengerBookInfo<IHotelInfo>[]) {
    console.log("hotel set book infos ", bookInfos);
    this.bookInfos = bookInfos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  calcTotalNights(d1: string, d2: string) {
    return Math.abs(moment(d1).diff(moment(d2), "days"));
  }
  async openCalendar(data: {
    checkInDate?: DayModel;
    tripType?: TripType;
    title?: string;
  }): Promise<DayModel[]> {
    if (!data.checkInDate) {
      data.checkInDate = this.calendarService.generateDayModel(moment());
    }
    const isCan = this.hotelIsCanSelectYesterday();
    const res = await this.calendarService.openCalendar({
      goArrivalTime: "",
      tripType: data.tripType || TripType.checkIn,
      isMulti: true,
      isCanSelectYesterday: isCan,
      title: data.title || "请选择入离店日期",
      forType: FlightHotelTrainType.Hotel,
      beginDate: this.searchHotelModel && this.searchHotelModel.checkInDate,
      endDate: this.searchHotelModel && this.searchHotelModel.checkOutDate,
    });
    if (res) {
      if (res.length == 2) {
        this.setSearchHotelModel({
          ...this.getSearchHotelModel(),
          checkInDate: res[0].date,
          checkOutDate: res[1].date,
        });
      }
    }
    return res;
  }

  async getHotelCityAsync(forceRefresh = false) {
    try {
      if (
        !this.localHotelCities ||
        this.localHotelCities.length == 0 ||
        !this.lastUpdateTime
      ) {
        const local = await this.getHotelCitiesFromLocalCache();
        if (local) {
          this.lastUpdateTime = local.LastUpdateTime;
          this.localHotelCities = local.HotelCities || [];
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
      const cs = await this.loadHotelCitiesFromServer(this.lastUpdateTime);
      if (cs && cs.Trafficlines && cs.Trafficlines.length) {
        const arr = cs.Trafficlines.map((item) => {
          const fl = this.getFirstLetter(item.Name);
          if (!item.FirstLetter) {
            if (!item.Pinyin) {
              item.FirstLetter = this.getFirstLetter(item.Name);
            } else {
              item.FirstLetter = item.Pinyin.substring(0, 1).toUpperCase();
            }
          }
          return item;
        });
        this.localHotelCities = [
          ...this.localHotelCities.filter(
            (it) => !arr.some((c) => c.Code == it.Code)
          ),
          ...arr,
        ];
        await this.setLocalHotelCityCache(this.localHotelCities);
      }
    } catch (e) {
      console.error(e);
    }
    return this.localHotelCities;
  }
  async getCityByMap(p: MapPoint) {
    const req = new RequestEntity();
    req.Method = "TmcApiHotelUrl-City-GetCityByMap";
    req.Data = {
      position: {
        lat: p.lat,
        lng: p.lng,
      },
    };
    return this.apiService.getPromiseData<TrafficlineEntity>(req);
  }
  private async getHotelConditionsAsync(cityCode: string) {
    if (this.isLoadingCondition) {
      return;
    }
    const req = new RequestEntity();
    cityCode =
      cityCode ||
      (this.getSearchHotelModel().destinationCity &&
        this.getSearchHotelModel().destinationCity.Code);
    req.Method = `TmcApiHotelUrl-Condition-Gets`;
    req.Data = {
      cityCode,
    };
    req.IsShowLoading = true;
    this.isLoadingCondition = true;
    this.conditionModel = await this.apiService
      .getPromiseData<HotelConditionModel>(req)
      .finally(() => {
        this.isLoadingCondition = false;
      });
    return this.conditionModel;
  }
  // private async getHotelConditions(cityCode: string) {
  //   return new Promise<HotelConditionModel>((resolve) => {
  //     const req = new RequestEntity();
  //     cityCode =
  //       cityCode ||
  //       (this.getSearchHotelModel().destinationCity &&
  //         this.getSearchHotelModel().destinationCity.Code);
  //     req.Method = `TmcApiHotelUrl-Condition-Gets`;
  //     req.Data = {
  //       cityCode,
  //     };
  //     req.IsShowLoading = true;
  //     this.hotelConditionSubscription.unsubscribe();
  //     this.hotelConditionSubscription = this.apiService
  //       .getResponse<HotelConditionModel>(req)
  //       .pipe(
  //         finalize(() => {
  //           this.apiService.hideLoadingView();
  //           setTimeout(() => {
  //             this.hotelConditionSubscription.unsubscribe();
  //           }, 200);
  //         })
  //       )
  //       .subscribe(
  //         (res) => {
  //           const result = res && res.Data;
  //           resolve(result);
  //         },
  //         () => {
  //           resolve(null);
  //         }
  //       );
  //   });
  // }
  private getFirstLetter(name: string) {
    const pyFl = `${jsPy.getFullChars(name)}`.charAt(0);
    return pyFl && pyFl.toUpperCase();
  }
  private async setLocalHotelCityCache(cities: TrafficlineEntity[]) {
    if (AppHelper.isApp()) {
      await this.storage.set(`LocalHotelCityCache`, {
        LastUpdateTime: (this.lastUpdateTime = AppHelper.getTimestamp()),
        HotelCities: cities,
      } as LocalHotelCityCache);
    }
  }
  private async getHotelCitiesFromLocalCache(): Promise<LocalHotelCityCache> {
    const local = await this.storage.get(`LocalHotelCityCache`);
    return local;
  }

  async getBoutiqueHotel() {
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home`;
  }

  getHotelList(query: HotelQueryEntity) {
    const hotelquery: HotelQueryEntity = {
      ...this.getHotelQueryModel(),
      ...query,
      starAndPrices: null,
      locationAreas: null,
      ranks: null,
      filters: null,
      City: null,
      // lat: null,
      // Lng: null
    };
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-List`;
    if (query.searchGeoId) {
      req["searchGeoId"] = query.searchGeoId;
    }
    const cond = this.getSearchHotelModel();
    const city = cond.destinationCity;
    req.IsShowLoading = query.PageIndex < 1;
    hotelquery.CityCode = city && city.Code;
    hotelquery.BeginDate = this.getSearchHotelModel().checkInDate;
    hotelquery.EndDate = this.getSearchHotelModel().checkOutDate;
    hotelquery.IsLoadDetail = true;
    hotelquery.Tag = this.getSearchHotelModel().tag;
    if (hotelquery.HotelId) {
      hotelquery.SearchKey = "";
      // hotelquery.Lat = "";
      // hotelquery.Lng = "";
    }
    req.Data = {
      ...hotelquery,
      travelformid: AppHelper.getQueryParamers()["travelformid"] || "",
      hotelType: this.getSearchHotelModel().hotelType,
      Stars: null,
    };
    if (query.Stars && query.Stars.length) {
      req.Data.Categories = query.Stars;
    }
    if (cond && cond.searchText) {
      req.Data["SearchKey"] = cond.searchText.Text;
      if (cond.searchText.Lat && cond.searchText.Lng) {
        req.Data["Lat"] = cond.searchText.Lat;
        req.Data["Lng"] = cond.searchText.Lng;
      }
      if (cond.searchText.Value) {
        req.Data["HotelId"] = cond.searchText.Value;
      } else {
        req.Data["SearchKey"] = cond.searchText.Text;
        delete req.Data["HotelId"];
      }
    }
    if (
      this.searchHotelModel.myPosition &&
      this.searchHotelModel.myPosition.Lat &&
      this.searchHotelModel.myPosition.Lng &&
      this.searchHotelModel.myPosition.Text
    ) {
      req.Data["Lat"] = this.searchHotelModel.myPosition.Lat;
      req.Data["Lng"] = this.searchHotelModel.myPosition.Lng;
    }
    // req.IsShowLoading = true;
    return this.apiService.getResponse<HotelResultEntity>(req).pipe(
      map((result) => {
        if (result && result.Data && result.Data.HotelDayPrices) {
          this.RoomDefaultImg = result.Data.RoomDefaultImg;
          this.HotelDefaultImg = result.Data.HotelDefaultImg;
          result.Data.HotelDayPrices = result.Data.HotelDayPrices.map((it) => {
            if (it.Hotel) {
              if (it.Hotel.Variables) {
                try {
                  it.Hotel.VariablesJsonObj = JSON.parse(it.Hotel.Variables);
                } catch (e) {
                  console.error(e);
                }
              }
            }
            return it;
          });
          // if (this.testData) {
          //   this.testData[query.PageIndex] = {
          //     HotelDayPrices: result.Data.HotelDayPrices,
          //     DataCount: result.Data.DataCount,
          //   };
          //   if (!environment.production) {
          //     this.storage.set("test_big_hote_list", this.testData);
          //   }
          // } else {
          //   this.testData = {} as any;
          // }
        }
        return result;
      })
    );
  }
  getHotelDetail(hotelId: string, hotelprice: string) {
    // return throwError("没获取列表")
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-Detail`;
    const hotelquery = new HotelQueryEntity();
    hotelquery.BeginDate = this.getSearchHotelModel().checkInDate;
    hotelquery.EndDate = this.getSearchHotelModel().checkOutDate;
    hotelquery.IsLoadDetail = true;
    hotelquery.HotelId = hotelId;
    hotelquery.CityCode =
      this.getSearchHotelModel().destinationCity &&
      this.getSearchHotelModel().destinationCity.Code;
    hotelquery.Tag = this.getSearchHotelModel().tag;

    req.IsShowLoading = true;
    req.Data = {
      ...hotelquery,
      travelformid: AppHelper.getQueryParamers()["travelformid"] || "",
      hotelType: this.getSearchHotelModel().hotelType,
      MinPrice: hotelprice,
    };
    // req.IsShowLoading = true;
    return from(this.setDefaultFilterPolicy()).pipe(
      switchMap((_) => from(this.initSelfBookTypeBookInfos(true))),
      switchMap((_) => this.apiService.getResponse<HotelResultEntity>(req)),
      map((result) => {
        if (result && result.Data && result.Data.HotelDayPrices) {
          result.Data.HotelDayPrices = result.Data.HotelDayPrices.map((it) => {
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
  private async setDefaultFilterPolicy() {
    const isSelf = await this.staffService.isSelfBookType();
    const bookInfos = this.getBookInfos();
    const unSelected = bookInfos.find((it) => !it.bookInfo);
    if (isSelf || bookInfos.length == 1) {
      this.setBookInfos(
        bookInfos.map((it, idx) => {
          it.isFilterPolicy = idx == 0;
          return it;
        })
      );
    } else {
      if (unSelected) {
        this.setBookInfos(
          bookInfos.map((it) => {
            it.isFilterPolicy = it.id == unSelected.id;
            return it;
          })
        );
      }
    }
  }
  async getHotelPolicy(roomPlans: RoomPlanEntity[], hotel: HotelEntity) {
    // console.log("getHotelPolicy", this.hotelPolicies);
    // if (
    //   this.hotelPolicies &&
    //   this.hotelPolicies[hotel && hotel.Id] &&
    //   this.hotelPolicies[hotel && hotel.Id].length
    // ) {
    //   return [...this.hotelPolicies[hotel.Id]];
    // }
    await this.setDefaultFilterPolicy();
    const result = await this.getHotelPolicyAsync(roomPlans, hotel);
    // if (!this.hotelPolicies) {
    //   this.hotelPolicies = { [hotel.Id]: result };
    // } else {
    //   this.hotelPolicies[hotel.Id] = result;
    // }
    return result;
  }
  getRoomPlanUniqueId(p: RoomPlanEntity) {
    if (!p) {
      return "";
    }
    p.VariablesJsonObj = p.VariablesJsonObj || JSON.parse(p.Variables) || {};
    return p.VariablesJsonObj["RoomPlanUniqueId"] as string;
  }
  private async getHotelPolicyAsync(
    rpls: RoomPlanEntity[],
    hotel: HotelEntity
  ): Promise<HotelPassengerModel[]> {
    const roomPlans: RoomPlanEntity[] = [];
    if (rpls) {
      rpls.forEach((it) => {
        const id = this.getRoomPlanUniqueId(it);
        if (!roomPlans.find((i) => id == this.getRoomPlanUniqueId(i))) {
          roomPlans.push(it);
        }
      });
    }
    const notWhitelistPolicies: HotelPassengerModel[] = [];
    let whitelistPolicies: HotelPassengerModel[] = [];
    const bookInfos = this.getBookInfos();
    if (bookInfos.length == 0) {
      return [];
    }
    const whitelistPs = bookInfos
      .filter((it) => !it.isNotWhitelist)
      .map((it) => it.passenger && it.passenger.AccountId)
      .filter((it) => !!it);
    const notWhitelistPs = bookInfos
      .filter((it) => it.isNotWhitelist)
      .map((it) => it.passenger && it.passenger.AccountId)
      .filter((it) => !!it);
    if (notWhitelistPs.length && roomPlans) {
      notWhitelistPs.forEach((it) => {
        const policies: HotelPolicyModel[] = [];
        roomPlans.forEach((plan) => {
          const p = new HotelPolicyModel();
          p.HotelId = hotel && hotel.Id;
          p.IsAllowBook = true;
          p.Number = plan.Number;
          p.Rules = null;
          p.UniqueIdId = this.getRoomPlanUniqueId(plan);
          policies.push(p);
        });
        notWhitelistPolicies.push({
          PassengerKey: it,
          HotelPolicies: policies,
        });
      });
    }
    if (whitelistPs.length === 0 || !roomPlans || !roomPlans.length) {
      whitelistPolicies = [];
      return whitelistPolicies.concat(notWhitelistPolicies);
    }
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-Policy`;
    req.Version = "1.0";
    req.IsShowLoading = true;
    const arr: RoomPlanEntity[] = [];
    roomPlans.forEach((it) => {
      const a = new RoomPlanEntity();
      a.TotalAmount = it.TotalAmount;
      a.Number = it.Number;
      a.BeginDate = it.BeginDate;
      a.EndDate = it.EndDate;
      if (it.Room) {
        a.Room = new RoomEntity();
        a.Room.Id = it.Room.Id;
      }
      if (it.Id == "0" || !it.Id) {
        a.SupplierType = it.SupplierType;
      } else {
        a.Id = it.Id;
      }
      arr.push(a);
    });
    const city = this.getSearchHotelModel().destinationCity;
    req.Data = {
      RoomPlans: JSON.stringify(arr),
      Passengers: whitelistPs.join(","),
      CityCode: city && city.Code,
    };
    req.IsShowLoading = true;
    whitelistPolicies = await this.apiService
      .getPromiseData<HotelPassengerModel[]>(req)
      .catch((_) => []);
    return whitelistPolicies.concat(notWhitelistPolicies);
  }
  async openHotelCityPage(isShow = true) {
    let page = document.body.querySelector(".domestic-hotel-city-page");
    if (!page) {
      page = await this.getHotelCitiesHtml();
    }
    if (isShow) {
      page.classList.add("show");
    } else {
      page.classList.remove("show");
    }
  }
  private async getHotelCitiesHtml() {
    const cities = await this.getHotelCityAsync();
    const letter2Citites = this.getLetter2Cities(cities);
    const letters = Object.keys(letter2Citites);
    const page = document.createElement("div");
    page.classList.add("domestic-hotel-city-page");
    const list = document.createElement("div");

    page.append(list);
    document.body.append(page);
    return page;
  }
  private getLetter2Cities(arr: TrafficlineEntity[]) {
    const letter2Citites: { [letter: string]: TrafficlineEntity[] } = {};
    if (arr) {
      if (arr) {
        arr.forEach((c) => {
          const tmp = letter2Citites[c.FirstLetter];
          if (tmp) {
            if (!tmp.find((it) => it.Code == c.Code)) {
              tmp.push(c);
            }
          } else {
            letter2Citites[c.FirstLetter] = [c];
          }
        });
      }
    }
    return letter2Citites;
  }
  private loadHotelCitiesFromServer(lastUpdateTime: number) {
    const req = new RequestEntity();
    req.Method = `ApiHomeUrl-Resource-DomesticHotelCity`;
    req.Data = {
      LastUpdateTime: lastUpdateTime,
    };
    req.IsShowLoading = true;
    if (this.loadHotelCitiesFromServerPs[lastUpdateTime]) {
      return this.loadHotelCitiesFromServerPs[lastUpdateTime];
    }
    this.loadHotelCitiesFromServerPs[lastUpdateTime] = this.apiService
      .getPromiseData<{
        Trafficlines: TrafficlineEntity[];
        // HotelCities: TrafficlineEntity[];
      }>(req)
      .finally(() => {
        return (this.loadHotelCitiesFromServerPs[lastUpdateTime] = null);
      });
    return this.loadHotelCitiesFromServerPs[lastUpdateTime];
  }
  searchHotelByText(keyword: string, pageIndex: number) {
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-SearchHotel`;
    req.Data = {
      PageIndex: pageIndex,
      CityName:
        this.getSearchHotelModel().destinationCity &&
        this.getSearchHotelModel().destinationCity.Name,
      CityCode:
        this.getSearchHotelModel().destinationCity &&
        this.getSearchHotelModel().destinationCity.Code,
      Keyword: keyword,
    };
    return this.apiService.getResponse<
      {
        Text: string;
        Value: string;
        IsHotel: boolean;
      }[]
    >(req);
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Hotel-Initialize";
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    const isSelf = await this.staffService.isSelfBookType();
    const bookInfos = this.getBookInfos();
    return this.apiService
      .getPromiseData<InitialBookDtoModel>(req)
      .then((res) => {
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || {};
        res.ServiceFees = res.ServiceFees || ({} as any);
        res.ExpenseTypes = (res.ExpenseTypes || []).filter(
          (it) => !it.Tag || it.Tag.toLowerCase() == "hotel"
        );
        if (bookInfos.length == 2 && isSelf) {
          const fees = {};
          Object.keys(res.ServiceFees).forEach((k) => {
            fees[k] = +res.ServiceFees[k] / 2;
          });
        }
        res.Staffs = res.Staffs || [];
        res.Staffs = res.Staffs.map((it) => {
          return {
            ...it,
            CredentialStaff: { ...it } as any,
          };
        });
        res.Tmc = res.Tmc || ({} as any);
        res.TravelFrom = res.TravelFrom || ({} as any);
        return res;
      });
  }
  async dismissAllTopOverlays() {
    let i = 10;
    let top = await this.modalCtrl.getTop();
    while (top && --i > 0) {
      await top.dismiss().catch((_) => {});
      top = await this.modalCtrl.getTop();
    }
  }
  async onBook(bookDto: OrderBookDto) {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Hotel-Book";
    bookDto.Channel = await this.tmcService.getChannel();
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    this.apiService.showLoadingView({ msg: "正在预订，请稍候" });
    return this.apiService
      .getPromiseData<IBookOrderResult>(req)
      .then((r) => {
        if (r && r.TradeNo && r.TradeNo == "0") {
          this.logService.addException({
            Tag: `酒店订单下单异常 返回的订单号${r.TradeNo}`,
            Error: r,
            Method: req.Method,
            Message: r.Message,
          });
        }
        return r;
      })
      .finally(() => {
        this.apiService.hideLoadingView();
      });
  }
}
export interface IHotelInfo {
  hotelEntity: HotelEntity;
  hotelRoom?: RoomEntity;
  roomPlan?: RoomPlanEntity;
  tripType?: TripType;
  id?: string;
}
