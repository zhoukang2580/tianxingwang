import { CredentialsEntity } from "./../tmc/models/CredentialsEntity";
import { IdentityService } from "./../services/identity/identity.service";
import { CredentialsType } from "./../member/pipe/credential.pipe";
import {
  TmcService,
  PassengerBookInfo,
  FlightHotelTrainType,
  InitialBookDtoModel,
  IBookOrderResult
} from "src/app/tmc/tmc.service";
import { TripType } from "src/app/tmc/models/TripType";
import { ModalController } from "@ionic/angular";
import { CalendarService } from "./../tmc/calendar.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { BehaviorSubject, of } from "rxjs";
import { Subject } from "rxjs";
import { ApiService } from "./../services/api/api.service";
import { Injectable, EventEmitter } from "@angular/core";
import { Storage } from "@ionic/storage";
import { map } from "rxjs/operators";
import { RoomEntity } from "../hotel/models/RoomEntity";
import { ConfigEntity } from "../services/config/config.entity";
import { HotelEntity } from "../hotel/models/HotelEntity";
import { HotelQueryEntity } from "../hotel/models/HotelQueryEntity";
import { HotelConditionModel } from "../hotel/models/ConditionModel";
import { environment } from "src/environments/environment";
import { MOCK_HOTEL_DETIAL_INFO } from "./mockData";
import { StaffService } from "../hr/staff.service";
import { RoomPlanEntity } from "../hotel/models/RoomPlanEntity";
import { AppHelper } from "../appHelper";
import { HotelPassengerModel } from "../hotel/models/HotelPassengerModel";
import { HotelPolicyModel } from "../hotel/models/HotelPolicyModel";
import { DayModel } from "../tmc/models/DayModel";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { CountryEntity } from "../tmc/models/CountryEntity";
import { OrderBookDto } from "../order/models/OrderBookDto";

export const KEY_INTERNATIONAL_HOTEL_TRAFFICLINES =
  "key_international_hotel_trafficlines";
export const KEY_INTERNATIONAL_HOTEL_COUNTRIES =
  "key_international_hotel_countries";
interface ILocalCache<T> {
  lastUpdateTime: number;
  data: T;
}
export interface IshowRoomDetailInfo {
  room: RoomEntity;
  config: ConfigEntity;
  agent?: any;
  roomImages: string[];
  close?: EventEmitter<any>;
  bookRoom?: EventEmitter<any>;
  hotel: HotelEntity;
}
@Injectable({
  providedIn: "root"
})
export class InternationalHotelService {
  private fetchPassengerCredentials: {
    promise: Promise<{ [accountId: string]: CredentialsEntity[] }>;
  };
  private isInitializingSelfBookInfos: { promise: Promise<any> };
  private bookInfos: PassengerBookInfo<IInterHotelInfo>[];
  private bookInfoSource: Subject<PassengerBookInfo<IInterHotelInfo>[]>;
  private hotelQuerySource: Subject<HotelQueryEntity>;
  private hotelQueryModel: HotelQueryEntity;
  private searchConditon: IInterHotelSearchCondition;
  private searchConditionSource: Subject<IInterHotelSearchCondition>;
  private trafficlines: ILocalCache<TrafficlineEntity[]>;
  private countries: ILocalCache<CountryEntity[]>;
  private fetchTrafficlines: { promise: Promise<TrafficlineEntity[]> };
  private fetchCountries: { promise: Promise<CountryEntity[]> };
  private selfCredentials: CredentialsEntity[];
  private conditionModel: HotelConditionModel;
  // = !environment.production    ? (MOCK_HOTEL_DETIAL_INFO as any)    : null; // 查看详情的hotel
  viewHotel: HotelEntity = !environment.production
    ? (MOCK_HOTEL_DETIAL_INFO as any)
    : null; // 查看详情的hotel;
  showRoomDetailInfo: IshowRoomDetailInfo;
  showImages: any[];
  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private calendarService: CalendarService,
    private modalCtrl: ModalController,
    private staffService: StaffService,
    private tmcService: TmcService,
    identityService: IdentityService
  ) {
    this.initSearchCondition();
    this.bookInfoSource = new BehaviorSubject([]);
    this.hotelQuerySource = new BehaviorSubject(new HotelQueryEntity());
    identityService.getIdentitySource().subscribe(() => {
      this.disposal();
    });
  }
  async onBook(bookDto: OrderBookDto): Promise<IBookOrderResult> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-InternationalHotel-Book";
    bookDto.Channel = this.tmcService.getChannel();
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    this.apiService.showLoadingView();
    return this.apiService.getPromiseData<IBookOrderResult>(req);
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-InternationalHotel-Initialize";
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
  private disposal() {
    this.removeAllBookInfos();
    this.showImages = [];
    this.showRoomDetailInfo = null;
    this.selfCredentials = [];
    if (environment.production) {
      this.viewHotel = null;
    }
  }
  private initSearchCondition() {
    this.searchConditon = {
      checkinDate: this.calendarService.getMoment(4).format("YYYY-MM-DD"),
      checkoutDate: this.calendarService.getMoment(5).format("YYYY-MM-DD"),
      adultCount: 2,
      children: [],
      hotelType: "normal",
      country: {
        Name: "中国",
        EnglishName: "China",
        Code: "CN"
      } as CountryEntity,
      destinationCity: ({
        CityCode: "US1576",
        CityEnglishName: "",
        CityName: "奥兰多",
        Code: "US15760001",
        CountryCode: "US",
        CountryName: "美国(Usa)",
        DestinationAreaType: 7,
        DestinationAreaTypeName: "北美洲",
        EnglishName: "Orlando",
        Initial: "ALD",
        IsHot: false,
        Name: "奥兰多",
        Nickname: "奥兰多",
        Pinyin: "aolanduo",
        Tag: "InternationalHotel",
        Country: {
          Name: "美国",
          EnglishName: "Usa",
          Code: "US"
        }
      } as any) as TrafficlineEntity
    } as IInterHotelSearchCondition;
    this.searchConditionSource = new BehaviorSubject(this.searchConditon);
  }
  async getConditions(forceFetch = false) {
    const city = this.getSearchCondition().destinationCity;
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
      this.conditionModel = await this.getHotelConditions(
        city && city.Code
      ).catch(_ => null);
      // console.log(JSON.stringify(this.conditionModel));
      if (this.conditionModel) {
        this.conditionModel.city = this.getSearchCondition().destinationCity;
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
  private async getHotelConditions(cityCode: string) {
    const req = new RequestEntity();
    const cond = this.getSearchCondition();
    cityCode = cityCode || (cond.destinationCity && cond.destinationCity.Code);
    req.Method = `TmcApiInternationalHotelUrl-Condition-Gets`;
    req.Data = {
      cityCode
    };
    req.IsShowLoading = true;
    const result = await this.apiService
      .getPromiseData<HotelConditionModel>(req)
      .catch(_ => {
        return null;
      });
    return result;
  }
  setHotelQuerySource(query: HotelQueryEntity) {
    this.hotelQueryModel = query;
    this.hotelQuerySource.next(query);
  }
  getHotelQuerySource() {
    return this.hotelQuerySource.asObservable();
  }
  getHotelQueryModel() {
    return this.hotelQueryModel || new HotelQueryEntity();
  }
  async getCountries(forceFetch = false) {
    if (!this.countries) {
      this.countries = await this.getLocalCountries();
    }
    if (!forceFetch) {
      if (this.countries && this.countries.data && this.countries.data.length) {
        return Promise.resolve(this.countries.data);
      }
    }
    if (this.fetchCountries && this.fetchCountries.promise) {
      return this.fetchCountries.promise;
    }
    const req = new RequestEntity();
    req.Method = "TmcApiInternationalHotelUrl-Country-GetCoutries";
    this.fetchCountries = {
      promise: this.apiService
        .getPromiseData<CountryEntity[]>(req)
        .then(res => {
          this.countries.data = res;
          this.cacheCountries(res);
          return res;
        })
        .finally(() => {
          this.fetchCountries = null;
        })
    };
    return this.fetchCountries.promise;
  }
  searchHotel(name: string, pageIndex: number) {
    const req = new RequestEntity();
    const cond = this.getSearchCondition();
    req.Data = {
      Keyword: name || "",
      CityCode: cond && cond.destinationCity && cond.destinationCity.Code,
      PageIndex: pageIndex
    };
    req.Method = "TmcApiInternationalHotelUrl-Home-SearchHotel";
    return this.apiService.getResponse<ISearchTextValue[]>(req);
  }
  getHotelDetail(id: string) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalHotelUrl-Home-Detail`;
    const cond = this.getSearchCondition();
    // if (!environment.production) {
    //   return of((MOCK_HOTEL_DETIAL_INFO as any) as HotelEntity);
    // }
    req.IsShowLoading = true;
    req.Data = {
      HotelId: id,
      BeginDate: cond.checkinDate,
      EndDate: cond.checkoutDate,
      CityCode: cond.destinationCity && cond.destinationCity.Code,
      NationalityCode: cond.country && cond.country.Code,
      AdultCount: cond.adultCount,
      ChildCount: (cond.children && cond.children.length) || 0,
      ChildAges:
        cond.children && cond.children.length
          ? cond.children.map(it => it.age).join(",")
          : "",
      Langs: ["cn"],
      IsLoadDetail: true
    };
    return this.apiService
      .getResponse<{ Hotel: HotelEntity }>(req)
      .pipe(map(r => r.Data && r.Data.Hotel));
  }
  getHotelList(pageIndex: number) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalHotelUrl-Home-List`;
    const cond = this.getSearchCondition();
    // console.log("hotelQueryModel", this.hotelQueryModel);
    this.hotelQueryModel.Tag = cond.tag;
    req.Data = {
      ...this.hotelQueryModel,
      travelformid: AppHelper.getQueryParamers()["travelformid"] || "",
      hotelType: cond.hotelType,
      starAndPrices: null,
      PageSize: 20,
      BeginDate: cond.checkinDate,
      EndDate: cond.checkoutDate,
      CityCode: cond && cond.destinationCity && cond.destinationCity.Code,
      NationalityCode: cond && cond.country && cond.country.Code,
      AdultCount: cond.adultCount || 1,
      PageIndex: pageIndex
    };
    if (cond && cond.searchText) {
      req.Data["SearchKey"] = cond.searchText.Text;
      if (cond.searchText.Value) {
        req.Data["HotelId"] = cond.searchText.Value;
      }
    }
    return this.apiService.getResponse<IInterHotelSearchResult>(req).pipe(
      map(res => {
        if (res && res.Data && res.Data.HotelDayPrices) {
          res.Data.HotelDayPrices = res.Data.HotelDayPrices.map(it => {
            if (it.Hotel) {
              it.Hotel.VariablesJsonObj = this.parseVariables(
                it.Hotel.Variables
              );
            }
            return it;
          });
          return res;
        }
        return res;
      })
    );
  }
  private async setDefaultFilterPolicy() {
    const isSelf = await this.staffService.isSelfBookType();
    const bookInfos = this.getBookInfos();
    const unSelected = bookInfos.find(it => !it.bookInfo);
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
          bookInfos.map(it => {
            it.isFilterPolicy = it.id == unSelected.id;
            return it;
          })
        );
      }
    }
  }
  async getHotelPolicy(roomPlans: RoomPlanEntity[], hotel: HotelEntity) {
    await this.initSelfBookTypeBookInfos();
    await this.setDefaultFilterPolicy();
    const result = await this.getHotelPolicyAsync(roomPlans, hotel);
    return result;
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
        })
    };
    return this.fetchPassengerCredentials.promise;
  }
  isPassportHmTwPass(type: CredentialsType) {
    return (
      type == CredentialsType.Passport ||
      type == CredentialsType.HmPass ||
      type == CredentialsType.TwPass
    );
  }
  async checkCredentialValidate(infos: PassengerBookInfo<IInterHotelInfo>[]) {
    const isSelf = await this.staffService.isSelfBookType();
    if (isSelf) {
      const one = infos.find(it => !it.credential || !it.credential.Number);
      if (one) {
        await this.initSelfBookTypeBookInfos(true);
      }
    } else {
      const res = await this.getPassengerCredentials(
        infos.map(it => it.passenger && it.passenger.AccountId),
        true
      ).catch(_ => ({} as { [accountId: string]: [] }));
      this.setBookInfos(
        this.getBookInfos().map(it => {
          const o = infos.find(itm => itm.id == it.id);
          if (o) {
            if (res[it.passenger.AccountId]) {
              it.credential = res[it.passenger.AccountId].find(c =>
                this.isPassportHmTwPass(c.Type)
              );
              o.credential = it.credential;
            }
          }
          return it;
        })
      );
    }
  }
  private async initSelfBookTypeBookInfos(isShowLoading = false) {
    if (this.isInitializingSelfBookInfos) {
      return this.isInitializingSelfBookInfos.promise;
    } else {
      this.isInitializingSelfBookInfos = {
        promise: new Promise(async resolve => {
          const isSelf = await this.staffService.isSelfBookType(isShowLoading);
          const infos = this.getBookInfos();
          if (infos.length === 0 && isSelf) {
            let passportOrHmTwPass: any;
            const staff = await this.staffService.getStaff(
              false,
              isShowLoading
            );
            const res = await this.getPassengerCredentials(
              [staff.AccountId],
              isShowLoading
            ).catch(_ => ({ [staff.AccountId]: [] }));
            this.selfCredentials = res[staff.AccountId];
            passportOrHmTwPass =
              this.selfCredentials &&
              this.selfCredentials.find(c => this.isPassportHmTwPass(c.Type));
            const i: PassengerBookInfo<IInterHotelInfo> = {
              id: AppHelper.uuid(),
              passenger: staff,
              credential: passportOrHmTwPass
            };
            this.addBookInfo(i);
            resolve();
          } else {
            resolve();
          }
        }).finally(() => {
          this.isInitializingSelfBookInfos = null;
        })
      };
    }
    return this.isInitializingSelfBookInfos.promise;
  }
  addBookInfo(bookInfo: PassengerBookInfo<IInterHotelInfo>) {
    console.log("hotel,addbookinfo", bookInfo);
    if (bookInfo) {
      bookInfo.id = AppHelper.uuid();
      const bookInfos = this.getBookInfos();
      bookInfos.push(bookInfo);
      this.setBookInfos(bookInfos);
    }
  }
  removeBookInfo(
    bookInfo: PassengerBookInfo<IInterHotelInfo>,
    isRemovePassenger: boolean
  ) {
    const arg = { ...bookInfo };
    if (isRemovePassenger) {
      this.bookInfos = this.bookInfos.filter(it => it.id !== arg.id);
    } else {
      this.bookInfos = this.bookInfos.map(it => {
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
  setBookInfos(bookInfos: PassengerBookInfo<IInterHotelInfo>[]) {
    console.log("hotel set book infos ", bookInfos);
    this.bookInfos = bookInfos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  private async getHotelPolicyAsync(
    rpls: RoomPlanEntity[],
    hotel: HotelEntity
  ): Promise<HotelPassengerModel[]> {
    const roomPlans: RoomPlanEntity[] = [];
    if (rpls) {
      rpls.forEach(it => {
        const id = this.getRoomPlanUniqueId(it);
        if (!roomPlans.find(i => id == this.getRoomPlanUniqueId(i))) {
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
          p.UniqueIdId = this.getRoomPlanUniqueId(plan);
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
    req.Method = `TmcApiInternationalHotelUrl-Home-Policy`;
    req.Version = "1.0";
    req.IsShowLoading = true;
    const arr: RoomPlanEntity[] = [];
    roomPlans.forEach(it => {
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
    const city = this.getSearchCondition().destinationCity;
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
  getRoomRateRuleMessage(roomPlan: RoomPlanEntity) {
    if (!roomPlan || !roomPlan.RoomPlanRules) {
      return "";
    }
    return roomPlan.RoomPlanRules.filter(it => it.Name == "DidIncrease")
      .map(it => it.Description)
      .join(",");
  }
  async openCalendar(
    checkInDate?: DayModel | string,
    tripType: TripType = TripType.checkIn,
    title = "请选择入离店日期"
  ): Promise<DayModel[]> {
    if (typeof checkInDate == "string") {
      checkInDate = this.calendarService.generateDayModelByDate(checkInDate);
    }
    if (!checkInDate) {
      checkInDate = this.calendarService.getMoment().format("YYYY-MM-DD");
    }
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: checkInDate,
        tripType,
        isMulti: true,
        title,
        forType: FlightHotelTrainType.Hotel
      }
    });
    await m.present();
    // this.calendarService.setSelectedDaysSource(this.calendarService.getSelectedDays());
    const result = await m.onDidDismiss();
    if (result.data) {
      const data = result.data as DayModel[];
      if (data.length == 2) {
        this.setSearchConditionSource({
          ...this.getSearchCondition(),
          checkinDate: data[0].date,
          checkoutDate: data[1].date
        });
      }
    }
    return result.data as DayModel[];
  }
  private parseVariables(jsonStr: string) {
    let obj = {};
    if (jsonStr) {
      obj = JSON.parse(jsonStr);
    }
    return obj;
  }
  async getTrafficlinesAsync(forceFetch = false) {
    if (!forceFetch) {
      if (
        !this.trafficlines ||
        !this.trafficlines.data ||
        this.trafficlines.data.length == 0
      ) {
        this.trafficlines = await this.getLocalTrafficlines();
      }
      if (
        this.trafficlines &&
        this.trafficlines.data &&
        this.trafficlines.data.length
      ) {
        return Promise.resolve(this.trafficlines.data);
      }
    }
    if (!this.trafficlines) {
      this.trafficlines = await this.getLocalTrafficlines();
    }
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiInternationalHotelUrl-Trafficline-GetTrafficlines";
    req.Data = {};
    if (this.fetchTrafficlines && this.fetchTrafficlines.promise) {
      return this.fetchTrafficlines.promise;
    }
    const countries = await this.getCountries();
    this.fetchTrafficlines = {
      promise: this.apiService
        .getPromiseData<TrafficlineEntity[]>(req)
        .then(res => {
          if (countries && countries.length) {
            res = res.map(it => {
              it.Country = countries.find(c => c.Code == it.CountryCode);
              return it;
            });
          }
          this.trafficlines.data = res;
          this.cacheTrafficlines(this.trafficlines.data);
          return res;
        })
        .finally(() => {
          this.fetchTrafficlines = null;
        })
    };
    return this.fetchTrafficlines.promise;
  }
  private searchHotelCities(name: string, pageIndex: number, pageSize = 20) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiInternationalHotelUrl-Trafficline-Search";
    req.Data = {
      Name: name,
      PageIndex: pageIndex,
      lang: AppHelper.getLanguage() || "cn",
      PageSize: pageSize
    };
    return this.apiService.getResponse<ISearchTextValue[]>(req);
  }
  private async cacheTrafficlines(list: TrafficlineEntity[]) {
    if (AppHelper.isApp()) {
      if (list && list.length) {
        await this.storage.set(KEY_INTERNATIONAL_HOTEL_TRAFFICLINES, {
          lastUpdateTime: Date.now(),
          data: list
        } as ILocalCache<TrafficlineEntity[]>);
      }
    }
  }
  private async getLocalTrafficlines(): Promise<
    ILocalCache<TrafficlineEntity[]>
  > {
    let result: ILocalCache<TrafficlineEntity[]> = {
      lastUpdateTime: 0,
      data: []
    };
    result =
      (await this.storage.get(KEY_INTERNATIONAL_HOTEL_TRAFFICLINES)) || result;
    return result;
  }
  private async cacheCountries(countries: CountryEntity[]) {
    if (countries && countries.length) {
      await this.storage.set(KEY_INTERNATIONAL_HOTEL_COUNTRIES, {
        lastUpdateTime: Date.now(),
        data: countries
      } as ILocalCache<CountryEntity[]>);
    }
  }
  private async getLocalCountries(): Promise<ILocalCache<CountryEntity[]>> {
    let result: ILocalCache<CountryEntity[]> = {
      lastUpdateTime: 0,
      data: []
    };
    result =
      (await this.storage.get(KEY_INTERNATIONAL_HOTEL_COUNTRIES)) || result;
    return result;
  }
  getSearchCondition() {
    return { ...this.searchConditon };
  }
  setSearchConditionSource(condition: IInterHotelSearchCondition) {
    this.searchConditon = condition;
    this.searchConditionSource.next(condition);
  }
  getSearchConditionSource() {
    return this.searchConditionSource.asObservable();
  }
  getRules(roomPlan: RoomPlanEntity) {
    return this.getRoomRateRule(roomPlan);
  }
  async dismissAllTopOverlays() {
    let i = 10;
    let top = await this.modalCtrl.getTop();
    while (top && --i > 0) {
      await top.dismiss().catch(_ => {});
      top = await this.modalCtrl.getTop();
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
  getAvgPrice(plan: RoomPlanEntity) {
    if (plan && plan.VariablesJsonObj) {
      return plan.VariablesJsonObj["AvgPrice"];
    }
    if (plan && plan.Variables) {
      plan.VariablesJsonObj = JSON.parse(plan.Variables);
      return plan.VariablesJsonObj["AvgPrice"];
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
  getRoomPlanUniqueId(p: RoomPlanEntity) {
    if (!p) {
      return "";
    }
    p.VariablesJsonObj = p.VariablesJsonObj || JSON.parse(p.Variables) || {};
    return p.VariablesJsonObj["RoomPlanUniqueId"] as string;
  }
}
export interface IInterHotelSearchCondition {
  checkinDate: string;
  checkoutDate: string;
  destinationCity: TrafficlineEntity;
  country: CountryEntity;
  adultCount: number;
  children: { age: number }[];
  searchText: ISearchTextValue;
  tripType: TripType;
  tag: "Agreement" | "" | "SpecialPrice";
  hotelType: "agreement" | "normal" | "specialprice";
}

export interface ISearchTextValue {
  Text: string;
  Value: string; // Code
}
export interface IInterHotelSearchResult {
  CityCode: string;
  Hotel: HotelEntity;
  HotelQuery: any;
  DataCount: number;
  HotelDayPrices: IHotelDayPrices[];
}
export interface IHotelDayPrices {
  Id: string;
  Hotel: HotelEntity;
  Variables: string;
  VariablesObj: any;
}

export interface IHotelSummary {
  Hotel: HotelEntity;
  Tag: string;
  Content: string;
}
export interface IHotelDetail {
  Hotel: HotelEntity;
  Name: string;
  Description: string;
  Tag: string;
  Number: string;
}
export interface IHotelComment {
  Hotel: HotelEntity;
  Name: string;
  Detail: string;
  HotelCommentType: number;
}
export interface IInterHotelInfo {
  hotelEntity: HotelEntity;
  hotelRoom?: RoomEntity;
  roomPlan?: RoomPlanEntity;
  tripType?: TripType;
  id?: string;
}
