import { RoomEntity } from "./models/RoomEntity";
import { AppHelper } from "src/app/appHelper";
import { DayModel } from "src/app/tmc/models/DayModel";
import { TripType } from "src/app/tmc/models/TripType";
import { HotelEntity } from "./models/HotelEntity";
import { IdentityService } from "./../services/identity/identity.service";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import {
  PassengerBookInfo,
  TmcService,
  InitialBookDtoModel
} from "../tmc/tmc.service";
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
import { HotelConditionModel } from "./models/ConditionModel";
import { HotelDayPriceEntity } from "./models/HotelDayPriceEntity";
import { RoomPlanEntity } from "./models/RoomPlanEntity";
import { HotelPolicyModel } from "./models/HotelPolicyModel";
import { HotelSupplierType } from "./models/HotelSupplierType";
import { RoomPlanRuleType } from "./models/RoomPlanRuleType";
import { OrderBookDto } from "../order/models/OrderBookDto";
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
  private conditionModelSource: Subject<HotelConditionModel>;
  private searchHotelModel: SearchHotelModel;
  private selfCredentials: CredentialsEntity[];
  private localHotelCities: TrafficlineEntity[];
  private lastUpdateTime = 0;
  private isInitializingSelfBookInfos = false;
  private conditionModel: HotelConditionModel;
  private cityConditionIsLoading: { [citycode: string]: boolean };
  private hotelPolicies: { [hotelId: string]: HotelPassengerModel[] };
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
    this.conditionModelSource = new BehaviorSubject(null);
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
  getRules(roomPlan: RoomPlanEntity) {
    return this.getRoomRateRule(roomPlan);
  }
  getAvgPrice(plan: RoomPlanEntity) {
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["AvgPrice"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["AvgPrice"];
    }
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
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["FullHouseOrCanBook"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["FullHouseOrCanBook"];
    }
  }
  isFull(p: RoomPlanEntity) {
    const res = this.getFullHouseOrCanBook(p);
    return res && res.toLowerCase().includes("full");
  }
  getRoomArea(room: RoomEntity) {
    return (
      room && room.RoomDetails && room.RoomDetails.find(it => it.Tag == "Area")
    );
  }
  getFloor(room: RoomEntity) {
    return (
      room && room.RoomDetails && room.RoomDetails.find(it => it.Tag == "Floor")
    );
  }
  getRenovationDate(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "RenovationDate")
    );
  }
  getComments(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "Comments")
    );
  }
  getCapacity(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "Capacity")
    );
  }
  getBedType(room: RoomEntity) {
    return (
      room &&
      room.RoomDetails &&
      room.RoomDetails.find(it => it.Tag == "BedType")
    );
  }
  async getConditions(forceFetch = false) {
    if (
      forceFetch ||
      !this.conditionModel ||
      !this.conditionModel.Amenities ||
      !this.conditionModel.Brands ||
      !this.conditionModel.Geos
    ) {
      const city = this.getSearchHotelModel().destinationCity;
      this.conditionModel = await this.getHotelConditions(
        city && city.Code
      ).catch(_ => null);
      // console.log(JSON.stringify(this.conditionModel));
      if (this.conditionModel) {
        this.conditionModel.city = this.getSearchHotelModel().destinationCity;
        if (this.conditionModel.Geos) {
          this.conditionModel.Geos = this.conditionModel.Geos.map(geo => {
            if (geo.Variables) {
              geo.VariablesJsonObj = JSON.parse(geo.Variables);
            }
            return geo;
          });
        }
        if (!this.conditionModel.Tmc) {
          this.conditionModel.Tmc = await this.tmcService
            .getTmc()
            .catch(_ => null);
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
    m.hotelType = "normal";
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
  setConditionModelSource(c: HotelConditionModel) {
    this.conditionModel = c;
    this.conditionModelSource.next(c);
  }
  getConditionModelSource() {
    return this.conditionModelSource.asObservable();
  }
  setSearchHotelModel(m: SearchHotelModel) {
    if (m) {
      if (
        this.conditionModel &&
        this.conditionModel.city &&
        m.destinationCity &&
        m.destinationCity.Code != this.conditionModel.city.Code
      ) {
        this.getConditions(true).then(c => {
          this.setConditionModelSource(c);
        });
      }
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
        id: AppHelper.uuid(),
        passenger: staff,
        credential:
          IdCredential ||
          (this.selfCredentials &&
            this.selfCredentials.length &&
            this.selfCredentials[0]) ||
          new CredentialsEntity()
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
  removeBookInfo(bookInfo: PassengerBookInfo<IHotelInfo>) {
    console.log("hotel,removeBookInfo", bookInfo);
    if (bookInfo) {
      const bookInfos = this.getBookInfos().map(it => {
        if (it.id === bookInfo.id) {
          it.bookInfo = null;
        }
        return it;
      });
      this.setBookInfos(bookInfos);
    }
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
        ...this.localHotelCities.filter(
          it => !arr.some(c => c.Code == it.Code)
        ),
        ...arr
      ];
      await this.setLocalHotelCityCache(this.localHotelCities);
    }
    return this.localHotelCities;
  }
  private async getHotelConditions(cityCode: string) {
    console.log("cityConditionIsLoading", this.cityConditionIsLoading);
    if (this.cityConditionIsLoading && this.cityConditionIsLoading[cityCode]) {
      return;
    }
    if (!this.cityConditionIsLoading) {
      this.cityConditionIsLoading = { [cityCode]: true };
    } else {
      this.cityConditionIsLoading[cityCode] = true;
    }
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
    const result = await this.apiService
      .getPromiseData<HotelConditionModel>(req)
      .catch(_ => {
        return null;
      });
    this.cityConditionIsLoading[cityCode] = false;
    return result;
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
    const hotelquery = {
      ...query
    };
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
    // req.IsShowLoading = true;
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
  getHotelDetail(hotelItem: HotelDayPriceEntity) {
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-Detail`;
    const hotelquery = new HotelQueryEntity();
    hotelquery.BeginDate = this.getSearchHotelModel().checkInDate;
    hotelquery.EndDate = this.getSearchHotelModel().checkOutDate;
    hotelquery.IsLoadDetail = true;
    hotelquery.HotelId = hotelItem && hotelItem.Hotel && hotelItem.Hotel.Id;
    hotelquery.CityCode =
      this.getSearchHotelModel().destinationCity &&
      this.getSearchHotelModel().destinationCity.Code;
    hotelquery.Tag = this.getSearchHotelModel().tag;
    req.IsShowLoading = true;
    req.Data = {
      ...hotelquery,
      travelformid: AppHelper.getQueryParamers()["travelformid"] || "",
      hotelType: this.getSearchHotelModel().hotelType
    };
    // req.IsShowLoading = true;
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
  async getHotelPolicy(roomPlans: RoomPlanEntity[], hotel: HotelEntity) {
    console.log("getHotelPolicy", this.hotelPolicies);
    // if (
    //   this.hotelPolicies &&
    //   this.hotelPolicies[hotel && hotel.Id] &&
    //   this.hotelPolicies[hotel && hotel.Id].length
    // ) {
    //   return [...this.hotelPolicies[hotel.Id]];
    // }
    const result = await this.getHotelPolicyAsync(roomPlans, hotel);
    if (!this.hotelPolicies) {
      this.hotelPolicies = { [hotel.Id]: result };
    } else {
      this.hotelPolicies[hotel.Id] = result;
    }
    return result;
  }
  private async getHotelPolicyAsync(
    roomPlans: RoomPlanEntity[],
    hotel: HotelEntity
  ): Promise<HotelPassengerModel[]> {
    const notWhitelistPolicies: HotelPassengerModel[] = [];
    let whitelistPolicies: HotelPassengerModel[] = [];
    const bookInfos = this.getBookInfos();
    if (bookInfos.length == 0) {
      return [];
    }
    const whitelistPs = bookInfos
      .filter(it => !it.isNotWhitelist)
      .map(it => it.passenger && it.passenger.AccountId)
      .filter(it => !!it);
    const notWhitelistPs = bookInfos
      .filter(it => it.isNotWhitelist)
      .map(it => it.passenger && it.passenger.AccountId)
      .filter(it => !!it);
    if (notWhitelistPs.length && roomPlans) {
      notWhitelistPs.forEach(it => {
        const policies: HotelPolicyModel[] = [];
        roomPlans.forEach(plan => {
          const p = new HotelPolicyModel();
          p.HotelId = hotel && hotel.Id;
          p.IsAllowBook = true;
          p.Number = plan.Number;
          p.Rules = null;
          policies.push(p);
        });
        notWhitelistPolicies.push({
          PassengerKey: it,
          HotelPolicies: policies
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
    roomPlans.forEach(it => {
      arr.push({
        Id: it.Id,
        TotalAmount: it.TotalAmount,
        Number: it.Number,
        BeginDate: it.BeginDate,
        EndDate: it.EndDate
      } as RoomPlanEntity);
    });
    const city = this.getSearchHotelModel().destinationCity;
    req.Data = {
      RoomPlans: JSON.stringify(arr),
      Passengers: whitelistPs.join(","),
      CityCode: city && city.Code
    };
    req.IsShowLoading = true;
    whitelistPolicies = await this.apiService
      .getPromiseData<HotelPassengerModel[]>(req)
      .catch(_ => []);
    return whitelistPolicies.concat(notWhitelistPolicies);
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
  searchHotelByText(keyword: string) {
    const req = new RequestEntity();
    req.Method = `TmcApiHotelUrl-Home-SearchHotel`;
    req.Data = {
      CityCode:
        this.getSearchHotelModel().destinationCity &&
        this.getSearchHotelModel().destinationCity.Code,
      Keyword: keyword
    };
    return this.apiService
      .getResponse<
        {
          Text: string;
          Value: string;
        }[]
      >(req)
      .pipe(
        map(r => {
          if (r.Status) {
            return r.Data;
          }
          return [];
        })
      );
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
      .then(res => {
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || {};
        res.ServiceFees = res.ServiceFees || ({} as any);
        if (bookInfos.length == 2 && isSelf) {
          const fees = {};
          Object.keys(res.ServiceFees).forEach(k => {
            fees[k] = +res.ServiceFees[k] / 2;
          });
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
  async dismissAllTopOverlays() {
    let i = 10;
    let top = await this.modalCtrl.getTop();
    while (top && --i > 0) {
      await top.dismiss().catch(_ => {});
      top = await this.modalCtrl.getTop();
    }
  }
  async onBook(bookDto: OrderBookDto): Promise<{ TradeNo: string }> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-Hotel-Book";
    bookDto.Channel = "Mobile";
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<{ TradeNo: string }>(req);
  }
}
export interface IHotelInfo {
  hotelEntity: HotelEntity;
  hotelRoom?: RoomEntity;
  roomPlan?: RoomPlanEntity;
  tripType?: TripType;
  id?: string;
}
