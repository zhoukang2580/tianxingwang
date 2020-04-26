import { FlightFareEntity } from "./../flight/models/FlightFareEntity";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { FlightSegmentEntity } from "../flight/models/flight/FlightSegmentEntity";
import { FlightPolicy } from "../flight/models/PassengerFlightInfo";
import { Subject, BehaviorSubject } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import {
  PassengerBookInfo,
  TmcService,
  FlightHotelTrainType,
  InitialBookDtoModel,
  IBookOrderResult,
} from "../tmc/tmc.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { CalendarService } from "../tmc/calendar.service";
import { AppHelper } from "../appHelper";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
import { TripType } from "../tmc/models/TripType";
import { DayModel } from "../tmc/models/DayModel";
import { RequestEntity } from "../services/api/Request.entity";
import { FlightResultEntity } from "../flight/models/FlightResultEntity";
import { IResponse } from "../services/api/IResponse";
import { tap, switchMap } from "rxjs/operators";
import {
  MockInternationalFlightListData,
  MOCK_MultiCity_SEARCHMODEL,
} from "./mock-data";
import { environment } from "src/environments/environment";
import { IdentityEntity } from "../services/identity/identity.entity";
import { LanguageHelper } from "../languageHelper";
import { FlightRouteEntity } from "../flight/models/flight/FlightRouteEntity";
import { StaffService } from "../hr/staff.service";
import { MemberService } from "../member/member.service";
import { CredentialsEntity } from "../tmc/models/CredentialsEntity";
import { CredentialsType } from "../member/pipe/credential.pipe";
import { OrderBookDto } from "../order/models/OrderBookDto";
export interface IFlightCabinType {
  label:
    | "经济舱"
    | "超级经济舱"
    | "头等舱"
    | "商务舱"
    | "超级商务舱"
    | "超级头等舱";
  value: FlightCabinInternationalType;
}
export enum FlightCabinInternationalType {
  /// <summary>
  /// 经济舱
  /// </summary>
  // [Description("经济舱")]
  ECONOMY = 11,
  /// <summary>
  /// 超级经济舱
  /// </summary>
  // [Description("超级经济舱")]
  PREMIUM_ECONOMY = 12,
  /// <summary>
  /// 头等舱
  /// </summary>
  // [Description("头等舱")]
  FIRST = 13,
  /// <summary>
  /// 商务舱
  /// </summary>
  // [Description("商务舱")]
  BUSINESS = 14,
  /// <summary>
  /// 超级商务舱
  /// </summary>
  // [Description("超级商务舱")]
  PREMIUM_BUSINESS = 15,
  /// <summary>
  /// 超级头等舱
  /// </summary>
  // [Description("超级头等舱")]
  PREMIUM_FIRST = 16,
}
export enum FlightVoyageType {
  OneWay = 1,
  GoBack = 2,
  MultiCity = 3,
}
export interface IConditionItem {
  label: string;
  isChecked?: boolean;
  logoPic?: string;
}
export interface IFromToAir extends IConditionItem {
  ToAirport?: string; // "KIX";
  ToAirportName?: string; // "大阪关西国际机场";
  ToCityName?: string; // "大阪";
  ToTerminal?: string; // "1";
  FromAirport?: string;
  FromAirportName?: string;
  FromCityName?: string;
  FromTerminal?: string;
}
export interface IFilterCondition {
  airComponies?: IConditionItem[];
  price?: "asc" | "desc" | "none";
  time?: "asc" | "desc" | "none";
  isFilter?: boolean;
  fromAirports?: IFromToAir[];
  toAirports?: IFromToAir[];
  timeSpan?: { lower: number; upper: number };
  isDirectFly?: boolean;
}
const toCity: TrafficlineEntity = {
  AirportCityCode: "BJS",
  CityCode: "1101",
  CityName: "北京",
  Code: "BJS",
  CountryCode: "CN",
  Description: "",
  EnglishName: "Beijing",
  Id: "9278",
  Initial: "bj",
  IsHot: true,
  Name: "北京",
  Nickname: "北京",
  Pinyin: "Beijing",
  Sequence: 2,
  Tag: "AirportCity",
} as TrafficlineEntity;
const fromCity = {
  AirportCityCode: "SHA",
  CityCode: "3101",
  CityName: "上海",
  Code: "SHA",
  CountryCode: "CN",
  Description: "",
  EnglishName: "Shanghai",
  Id: "9260",
  Initial: "",
  IsHot: true,
  Name: "上海",
  Nickname: "上海",
  Pinyin: "Shanghai",
  Sequence: 1,
  // 出发城市，不是出发城市的那个机场
  Tag: "AirportCity",
} as TrafficlineEntity;
@Injectable({
  providedIn: "root",
})
export class InternationalFlightService {
  private fetchPassengerCredentials: {
    promise: Promise<{ [accountId: string]: CredentialsEntity[] }>;
  };
  private isInitializingSelfBookInfos: { promise: Promise<any> };
  private selfCredentials: CredentialsEntity[];
  private identity: IdentityEntity;
  private lastOneWaySearchModel: IInternationalFlightSearchModel; // 上一次选择的单程trip信息
  private lastGobackSearchModel: IInternationalFlightSearchModel; // 上一次选择的往返trip信息
  private lastMultiTripSearchModel: IInternationalFlightSearchModel; // 上一次选择的多程trip信息
  private filterCondition: IFilterCondition;
  private filterConditionSource: Subject<IFilterCondition>;
  private searchModel: IInternationalFlightSearchModel;
  private searchModelSource: Subject<IInternationalFlightSearchModel>;
  private bookInfos: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  private bookInfoSource: Subject<
    PassengerBookInfo<IInternationalFlightSegmentInfo>[]
  >;
  private flightPolicyResult: FlightResultEntity;
  flightListResult: FlightResultEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private calendarService: CalendarService,
    private tmcService: TmcService,
    private router: Router,
    private modalCtrl: ModalController,
    private staffService: StaffService,
    private memerService: MemberService
  ) {
    this.initOneWaySearModel();
    this.bookInfoSource = new BehaviorSubject([]);
    this.initFilterCondition();
    this.identityService.getIdentitySource().subscribe((it) => {
      this.identity = it;
      this.disposal();
    });
    memerService.getCredentialsChangeSource().subscribe(async () => {
      this.selfCredentials = [];
      const staff = await this.staffService.getStaff(false, true);
      const isSelf = await this.staffService.isSelfBookType();
      if (!isSelf) {
        return;
      }
      const res = await this.getPassengerCredentials(
        [staff.AccountId],
        true
      ).catch((_) => ({ [staff.AccountId]: [] }));
      this.selfCredentials = res[staff.AccountId];
      const passportOrHmTwPass =
        this.selfCredentials &&
        this.selfCredentials.find((c) => this.isPassportHmTwPass(c.Type));
      const bookInfos = this.getBookInfos();
      const exists = bookInfos
        .filter((it) =>
          this.isPassportHmTwPass(it.credential && it.credential.Type)
        )
        .map((it) => it.credential);

      if (passportOrHmTwPass) {
        if (!exists || !exists.length) {
          this.setBookInfoSource(
            bookInfos.map((it) => {
              it.credential = passportOrHmTwPass;
              return it;
            })
          );
        } else {
          this.setBookInfoSource(
            bookInfos.map((it) => {
              if (
                this.isPassportHmTwPass(
                  it && it.credential && it.credential.Type
                )
              ) {
                it.credential = passportOrHmTwPass;
              }
              return it;
            })
          );
        }
      }
    });
  }
  async getInitializeBookDto(
    bookDto: OrderBookDto
  ): Promise<InitialBookDtoModel> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-InternationalFlight-Initialize";
    bookDto = {
      ...bookDto,
      Passengers: bookDto.Passengers.map((p) => {
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
          };
        }
        if (p.FlightCabin) {
          p.FlightCabin = {
            ...p.FlightCabin,
            // RefundChange: null,
            Variables: null,
          };
        }
        if (p.FlightSegment && p.FlightSegment.Cabins) {
          p.FlightSegment = {
            ...p.FlightSegment,
            Cabins: p.FlightSegment.Cabins.map((c) => {
              // c.RefundChange = null;
              c.Variables = null;
              return c;
            }),
          };
        }
        return p;
      }),
    };
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService
      .getPromiseData<InitialBookDtoModel>(req)
      .then((res) => {
        const bookInfos = this.getBookInfos();
        res.IllegalReasons = res.IllegalReasons || [];
        res.Insurances = res.Insurances || {};
        res.ServiceFees = res.ServiceFees || ({} as any);
        console.log("平均前", { ...res.ServiceFees });
        // 后台计算服务费根据 item.passenger.AccountId 累加,所以现在需要给每一个 item.passenger.AccountId 平均服务费
        const fees = {};
        Object.keys(res.ServiceFees).forEach((k) => {
          let count = 1;
          const one = bookInfos.find((it) => it.id == k);
          if (one && one.passenger) {
            count = bookInfos.filter(
              (it) =>
                it.passenger &&
                it.passenger.AccountId == one.passenger.AccountId
            ).length;
          }
          fees[k] = +res.ServiceFees[k] / count;
        });
        console.log("平均后", fees);
        res.ServiceFees = fees;
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
  async bookFlight(bookDto: OrderBookDto): Promise<IBookOrderResult> {
    const req = new RequestEntity();
    req.Method = "TmcApiBookUrl-InternationalFlight-Book";

    bookDto.Channel = await this.tmcService.getChannel();
    req.Data = bookDto;
    req.IsShowLoading = true;
    req.Timeout = 60;
    return this.apiService.getPromiseData<IBookOrderResult>(req);
  }
  isPassportHmTwPass(type: CredentialsType) {
    return (
      type == CredentialsType.Passport ||
      type == CredentialsType.HmPass ||
      type == CredentialsType.TwPass
    );
  }
  private async initSelfBookTypeBookInfos(isShowLoading = false) {
    if (this.isInitializingSelfBookInfos) {
      return this.isInitializingSelfBookInfos.promise;
    } else {
      this.isInitializingSelfBookInfos = {
        promise: new Promise(async (resolve) => {
          const isSelf = await this.staffService.isSelfBookType(isShowLoading);
          const infos = this.getBookInfos();
          if (
            (infos.length === 0 ||
              infos.some(
                (it) =>
                  !it.credential || !this.isPassportHmTwPass(it.credential.Type)
              )) &&
            isSelf
          ) {
            let passportOrHmTwPass: any;
            const staff = await this.staffService.getStaff(
              false,
              isShowLoading
            );
            const res = await this.getPassengerCredentials(
              [staff.AccountId],
              isShowLoading
            ).catch((_) => ({ [staff.AccountId]: [] }));
            this.selfCredentials = res[staff.AccountId];
            passportOrHmTwPass =
              this.selfCredentials &&
              this.selfCredentials.find((c) => this.isPassportHmTwPass(c.Type));
            const i: PassengerBookInfo<IInternationalFlightSegmentInfo> = {
              id: AppHelper.uuid(),
              passenger: staff,
              credential: passportOrHmTwPass,
            };
            this.addPassengerBookInfo(i);
            resolve();
          } else {
            resolve();
          }
        }).finally(() => {
          this.isInitializingSelfBookInfos = null;
        }),
      };
    }
    return this.isInitializingSelfBookInfos.promise;
  }
  getPassengerCredentials(accountIds: string[], isShowLoading?: boolean) {
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
  private initFilterCondition() {
    this.filterCondition = {
      price: "none",
      time: "none",
      timeSpan: { lower: 0, upper: 24 },
      isDirectFly: false,
    };
    this.filterConditionSource = new BehaviorSubject(this.filterCondition);
  }
  setFilterConditionSource(condition: IFilterCondition) {
    this.filterCondition = condition;
    if (this.filterCondition) {
      this.filterCondition.isFilter =
        this.filterCondition.isDirectFly ||
        (this.filterCondition.airComponies &&
          this.filterCondition.airComponies.some((c) => c.isChecked)) ||
        (this.filterCondition.fromAirports &&
          this.filterCondition.fromAirports.some((it) => it.isChecked)) ||
        (this.filterCondition.toAirports &&
          this.filterCondition.toAirports.some((it) => it.isChecked)) ||
        (this.filterCondition.timeSpan &&
          (this.filterCondition.timeSpan.lower > 0 ||
            this.filterCondition.timeSpan.upper < 24));
    }
    console.log("IFilterCondition ", condition);
    return this.filterConditionSource.next(condition);
  }
  getFilterConditionSource() {
    return this.filterConditionSource.asObservable();
  }
  getFilterCondition() {
    return this.filterCondition || ({} as IFilterCondition);
  }
  async onSelecFlyDate(isFrom: boolean, t: ITripInfo) {
    const dates = await this.openCalendar(false, isFrom, t);
    if (dates && dates.length) {
      if (this.searchModel) {
        if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
          const trip = this.searchModel.trips.find((it) => it.id == t.id);
          if (trip) {
            trip.date = dates[0].date;
            this.searchModel.trips = this.searchModel.trips.map((it) => {
              it.isSelectInfo = false;
              return it;
            });
          }
        }
        if (this.searchModel.voyageType == FlightVoyageType.OneWay) {
          this.searchModel.trips[0].date = dates[0].date;
        }
        if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
          if (isFrom) {
            this.searchModel.trips[0].date = dates[0].date;
          } else {
            this.searchModel.trips[1].date = dates[0].date;
          }
        }
        this.checkTripsDate();
      }
    }
    this.setSearchModelSource(this.searchModel);
  }
  private checkTripsDate() {
    const trips = (this.searchModel && this.searchModel.trips) || [];
    trips.forEach((trip, idx) => {
      const next = trips[idx + 1];
      if (next) {
        const m = this.calendarService.getMoment(0, trip.date);
        const nextM = this.calendarService.getMoment(0, next.date);
        if (+nextM < +m) {
          next.date = m.add(3, "days").format("YYYY-MM-DD");
        }
      }
    });
  }
  async openCalendar(isMulti: boolean, isFrom: boolean, trip: ITripInfo) {
    const s = this.getSearchModel();
    const trips = s.trips || [];
    const idx = s.trips && s.trips.findIndex((it) => it == trip);
    const lastTrip = idx - 1 >= 0 ? trips[idx - 1] : null;
    let goArrivalTime = "";
    if (FlightVoyageType.MultiCity == s.voyageType) {
      goArrivalTime = lastTrip ? lastTrip.date : "";
    }
    if (s.voyageType == FlightVoyageType.OneWay) {
      goArrivalTime = "";
    }
    if (s.voyageType == FlightVoyageType.GoBack) {
      if (!isFrom) {
        goArrivalTime = s.trips[0].date;
      }
    }
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime,
        tripType: isFrom ? TripType.departureTrip : TripType.returnTrip,
        forType: FlightHotelTrainType.InternationalFlight,
        isMulti,
      },
    });
    await m.present();
    const d = await m.onDidDismiss();
    return d && (d.data as DayModel[]);
  }
  initOneWaySearModel() {
    if (this.lastOneWaySearchModel) {
      this.setSearchModelSource(this.lastOneWaySearchModel);
      return;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.OneWay,
      trips: [
        {
          fromCity,
          toCity,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
        },
      ],
      cabin: {
        label: "经济舱",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: [
        {
          label: "经济舱",
          value: FlightCabinInternationalType.ECONOMY,
        },
        {
          label: "超级经济舱",
          value: FlightCabinInternationalType.PREMIUM_ECONOMY,
        },
        {
          label: "头等舱",
          value: FlightCabinInternationalType.FIRST,
        },
        {
          label: "商务舱",
          value: FlightCabinInternationalType.BUSINESS,
        },
        {
          label: "超级商务舱",
          value: FlightCabinInternationalType.PREMIUM_BUSINESS,
        },
        {
          label: "超级头等舱",
          value: FlightCabinInternationalType.PREMIUM_FIRST,
        },
      ],
    };
    this.setSearchModelSource(this.searchModel);
  }
  initGoBackSearchModel() {
    if (this.lastGobackSearchModel) {
      this.setSearchModelSource(this.lastGobackSearchModel);
      return;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.GoBack,
      trips: [
        {
          fromCity,
          toCity,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
        },
        {
          id: AppHelper.uuid(),
          fromCity: toCity,
          toCity: fromCity,
          date: this.calendarService.getMoment(3).format("YYYY-MM-DD"),
        },
      ],
      cabin: {
        label: "经济舱",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: [
        {
          label: "经济舱",
          value: FlightCabinInternationalType.ECONOMY,
        },
        {
          label: "超级经济舱",
          value: FlightCabinInternationalType.PREMIUM_ECONOMY,
        },
        {
          label: "头等舱",
          value: FlightCabinInternationalType.FIRST,
        },
        {
          label: "商务舱",
          value: FlightCabinInternationalType.BUSINESS,
        },
        {
          label: "超级商务舱",
          value: FlightCabinInternationalType.PREMIUM_BUSINESS,
        },
        {
          label: "超级头等舱",
          value: FlightCabinInternationalType.PREMIUM_FIRST,
        },
      ],
    };
    this.setSearchModelSource(this.searchModel);
  }
  initMultiTripSearchModel() {
    if (this.lastMultiTripSearchModel) {
      this.setSearchModelSource(this.lastMultiTripSearchModel);
      return;
    }
    this.searchModel = {
      voyageType: FlightVoyageType.MultiCity,
      trips: [
        {
          fromCity,
          toCity,
          date: this.calendarService.getMoment(1).format("YYYY-MM-DD"),
          id: AppHelper.uuid(),
        },
        {
          id: AppHelper.uuid(),
          fromCity: toCity,
          date: this.calendarService.getMoment(3).format("YYYY-MM-DD"),
        },
      ],
      cabin: {
        label: "经济舱",
        value: FlightCabinInternationalType.ECONOMY,
      },
      cabins: [
        {
          label: "经济舱",
          value: FlightCabinInternationalType.ECONOMY,
        },
        {
          label: "超级经济舱",
          value: FlightCabinInternationalType.PREMIUM_ECONOMY,
        },
        {
          label: "头等舱",
          value: FlightCabinInternationalType.FIRST,
        },
        {
          label: "商务舱",
          value: FlightCabinInternationalType.BUSINESS,
        },
        {
          label: "超级商务舱",
          value: FlightCabinInternationalType.PREMIUM_BUSINESS,
        },
        {
          label: "超级头等舱",
          value: FlightCabinInternationalType.PREMIUM_FIRST,
        },
      ],
    };
    if (!environment.production) {
      this.searchModel = MOCK_MultiCity_SEARCHMODEL;
    }
    this.setSearchModelSource(this.searchModel);
  }
  disposal() {
    this.initOneWaySearModel();
    this.initFilterCondition();
    this.setBookInfoSource([]);
  }
  addMoreTrip() {
    if (this.searchModel && this.searchModel.trips) {
      const trips = this.searchModel.trips;
      const idx = trips.findIndex((it) => !it.fromCity || !it.toCity);
      if (idx > -1) {
        const one = trips[idx];
        AppHelper.alert(
          `请完善第${idx + 1}程的${!one.fromCity ? "出发城市" : ""}${
            !one.toCity ? "到达城市" : ""
          }`
        );
        return;
      }
      const last = trips[trips.length - 1];
      this.searchModel.trips.push({
        id: AppHelper.uuid(),
        fromCity: last.toCity,
        date: this.calendarService.getMoment(3, last.date).format("YYYY-MM-DD"),
      });
      this.setSearchModelSource(this.searchModel);
    }
  }
  async getFlightList(query: {
    forceFetch: boolean;
    keepFilterCondition: boolean;
  }) {
    const m = this.searchModel;
    const { forceFetch, keepFilterCondition } = query;
    await this.initSelfBookTypeBookInfos(forceFetch);
    const isSelf = await this.staffService.isSelfBookType();
    if (this.searchModel && isSelf) {
      if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
        if (this.getBookInfos().length == 1) {
          this.addPassengerBookInfo({
            ...this.bookInfos[0],
            id: AppHelper.uuid(),
          });
        }
      } else if (this.searchModel.voyageType == FlightVoyageType.OneWay) {
        if (this.getBookInfos().length > 1) {
          this.setBookInfoSource([this.getBookInfos()[0]]);
        }
      }
    }
    if (!environment.production && !forceFetch) {
      let result = this.flightListResult;
      if (!result || !result.FlightRoutes || !result.FlightRoutes.length) {
        result = MockInternationalFlightListData as any;
        this.flightPolicyResult = await this.checkRoutePolicy(result);
        if (this.flightPolicyResult && this.flightPolicyResult.FlightFares) {
          result.FlightFares = result.FlightFares.map((it) => {
            const one = this.flightPolicyResult.FlightFares.find(
              (i) => i.Id == it.Id
            );
            if (one) {
              it.Rules = one.Rules;
              it.IsAllowOrder = one.IsAllowOrder;
            }
            return it;
          });
        }
        result = this.initFlightRouteSegments(result);
        this.flightListResult = result;
        await this.initParagraphCondition(result);
      }
      if (!keepFilterCondition) {
        await this.initParagraphCondition(result);
      }
      result = this.filterByCondition(result);
      return result;
    }
    if (!m || !forceFetch) {
      if (
        this.flightListResult &&
        this.flightListResult.FlightSegments &&
        this.flightListResult.FlightSegments.length
      ) {
        let result = this.flightListResult;
        const data = this.initFlightRouteSegments(result);
        if (!keepFilterCondition) {
          await this.initParagraphCondition(data);
        }
        result = this.filterByCondition(data);
        return result;
      }
    }
    this.setSearchModelSource({
      ...m,
      trips: m.trips.map((it) => {
        it.bookInfo = null;
        return it;
      }),
    });
    let date = this.calendarService.getMoment(0).format("YYYY-MM-DD");
    let fromAirports: string[];
    let toAirports: string[];
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-Index`;
    let days: string[] = [];
    if (m.voyageType == FlightVoyageType.OneWay) {
      const trip = m.trips[0];
      date = trip.date;
      fromAirports = [trip.fromCity.Code];
      toAirports = [trip.toCity.Code];
    }
    if (m.voyageType == FlightVoyageType.GoBack) {
      const goTrip = m.trips[0];
      const backTrip = m.trips[1];
      days = [goTrip.date, backTrip.date];
      date = days.join(",");
      fromAirports = [goTrip.fromCity.Code];
      toAirports = [goTrip.toCity.Code];
    }
    if (m.voyageType == FlightVoyageType.MultiCity) {
      date = m.trips.map((it) => it.date).join(",");
      fromAirports = m.trips
        .map((it) => it.fromCity && it.fromCity.AirportCityCode)
        .filter((it) => !!it);
      toAirports = m.trips
        .map((it) => it.toCity && it.toCity.AirportCityCode)
        .filter((it) => !!it);
    }
    req.Data = {
      Date: date,
      FromAirport: fromAirports.join(","),
      ToAirport: toAirports.join(","),
      VoyageType: m.voyageType,
      Cabin: FlightCabinInternationalType[m.cabin && m.cabin.value],
    };
    req.IsShowLoading = true;
    req.LoadingMsg = "正在获取航班列表...";
    return this.apiService
      .getPromiseData<FlightResultEntity>(req)
      .then((r) => {
        this.flightListResult = r;
        return this.checkRoutePolicy(this.flightListResult);
      })
      .then((policyResult) => {
        this.flightPolicyResult = policyResult;
        if (policyResult && policyResult.FlightFares) {
          this.flightListResult.FlightFares = this.flightListResult.FlightFares.map(
            (it) => {
              const one = policyResult.FlightFares.find((i) => i.Id == it.Id);
              if (one) {
                it.Rules = one.Rules;
                it.IsAllowOrder = one.IsAllowOrder;
              }
              return it;
            }
          );
        }
        this.flightListResult = this.initFlightRouteSegments(
          this.flightListResult
        );
        return this.initParagraphCondition(this.flightListResult).then(
          () => this.flightListResult
        );
      });
  }
  private async checkPolicy() {
    try {
      const m = this.getSearchModel();
      const bookInfos = this.getBookInfos();
      const notWhitelist = bookInfos.filter((it) => it.isNotWhitelist);
      let isCheckPolicy =
        m.trips.findIndex((it) => !it.bookInfo) == m.trips.length - 1;
      if (notWhitelist.length == bookInfos.length) {
        isCheckPolicy = false;
      }
      if (!isCheckPolicy) {
        isCheckPolicy = this.flightListResult.FlightRoutes.some(
          (it) => !it.policy
        );
      }
      if (!isCheckPolicy) {
        return true;
      }
      const req = new RequestEntity();
      req.Method = `TmcApiInternationalFlightUrl-Home-Check`;
      if (!this.flightListResult || !this.flightListResult.FlightFares) {
        return true;
      }
      const selectedRids = m.trips
        .filter(
          (it) =>
            it.bookInfo && it.bookInfo.flightRoute && it.bookInfo.flightRoute.Id
        )
        .map((it) => it.bookInfo.flightRoute.Id);
      const flightFares = this.flightListResult.FlightFares.filter((it) =>
        selectedRids.length
          ? it.FlightRouteIds.slice(0, selectedRids.length).join(",") ==
            selectedRids.join(",")
          : true
      );
      const flightRouteInfos = (
        this.flightListResult.FlightRoutes || []
      ).filter((r) =>
        flightFares.some((f) => f.FlightRouteIds.some((ffrid) => ffrid == r.Id))
      );
      req.Data = {
        FlightRouteInfos: JSON.stringify(flightRouteInfos),
        FlightSegmentInfos: JSON.stringify(
          (this.flightListResult.FlightSegments || []).filter((s) => {
            return flightRouteInfos.some((info) =>
              info.FlightSegmentIds.some((segId) => segId == s.Id)
            );
          })
        ),
        FlightFares: JSON.stringify(flightFares),
        PolicyIds: bookInfos
          .map(
            (it) =>
              it.passenger && it.passenger.Policy && it.passenger.Policy.Id
          )
          .filter((it) => !!it)
          .slice(0, 1)
          .join(","),
      };
      req.IsShowLoading = true;
      req.LoadingMsg = "正在计算差标信息";
      const result = await this.apiService.getPromiseData<{
        RuleExplains: {
          [fareId: string]: string;
        };
        PolicyDis: {
          [fareId: string]: {
            IsAllowOrder: boolean;
            IsIllegal: boolean;
            Message: string;
          };
        };
        flightCabinCodeDis: { [flightSegmentId: string]: string };
      }>(req);
      if (result.PolicyDis) {
        this.flightListResult.FlightRoutes = this.flightListResult.FlightRoutes.map(
          (r) => {
            return { ...r, policy: result.PolicyDis[r.flightFare.Id] };
          }
        );
      }
      if (result.flightCabinCodeDis) {
        this.flightListResult.FlightSegments = this.flightListResult.FlightSegments.map(
          (seg) => {
            const cabinCode = result.flightCabinCodeDis[seg.Id];
            if (cabinCode) {
              seg.CabinCode = cabinCode;
            }
            return seg;
          }
        );
      }
    } catch (e) {
      AppHelper.alert(e);
    }

    return true;
  }
  getRuleExplain(flightfare: FlightFareEntity) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-GetRuleExplain`;
    req.IsShowLoading = true;
    req.LoadingMsg = "正在计算差标";
    req.Data = {
      Flightfare: JSON.stringify(flightfare),
      FlightRoutes: JSON.stringify(this.flightListResult.FlightRoutes || []),
    };
    return this.apiService.getResponse<string>(req);
  }
  private async checkRoutePolicy(result: FlightResultEntity) {
    const req = new RequestEntity();
    req.Method = `TmcApiInternationalFlightUrl-Home-CheckRoutePolicy`;
    req.IsShowLoading = true;
    req.LoadingMsg = "正在计算差标";
    const bookInfos = this.getBookInfos();
    const notWhitelist = bookInfos.filter((it) => it.isNotWhitelist);
    const whitelist = bookInfos.filter((it) => !it.isNotWhitelist);
    const m = this.getSearchModel();
    if (!result || !result.FlightRoutes) {
      if (!environment.production) {
        result = this.flightListResult;
      }
    }
    if (
      !result ||
      !result.FlightFares ||
      !result.FlightRoutes ||
      !result.FlightSegments
    ) {
      return result;
    }
    if (whitelist.length) {
      req.Data = {
        FlightRoutes: JSON.stringify(
          result.FlightRoutes.map((it) => {
            const r = new FlightRouteEntity();
            r.Rules = it.Rules;
            r.FlightRouteIds = it.FlightRouteIds;
            r.Id = it.Id;
            r.Type = it.Type;
            r.FirstTime = it.FirstTime;
            r.FlightSegmentIds = it.FlightSegmentIds;
            return r;
          })
        ),
        FlightSegments: JSON.stringify(
          result.FlightSegments.map((it) => {
            const seg = new FlightSegmentEntity();
            seg.FromAirport = it.FromAirport;
            seg.FromAirportName = it.FromAirportName;
            seg.ToAirport = it.ToAirport;
            seg.ToAirportName = it.ToAirportName;
            seg.TakeoffTime = it.TakeoffTime;
            seg.Tax = it.Tax;
            seg.ArrivalTime = it.ArrivalTime;
            seg.CabinCode = it.CabinCode;
            seg.Cabins = it.Cabins;
            seg.Carrier = it.Carrier;
            seg.Distance = it.Distance;
            seg.Id = it.Id;
            seg.Duration = it.Duration;
            return seg;
          })
        ),
        FlightFares: JSON.stringify(
          result.FlightFares.map((it) => {
            const f = new FlightFareEntity();
            f.Id = it.Id;
            f.Tax = it.Tax;
            f.SalesPrice = it.SalesPrice;
            f.Rules = it.Rules;
            f.FlightNumber = it.FlightNumber;
            f.FlightRouteIds = it.FlightRouteIds;
            f.Type = it.Type;
            f.SettlePrice = it.SettlePrice;
            f.SettleTax = it.SettleTax;
            f.SupplierType = it.SupplierType;
            f.TicketPrice = it.TicketPrice;
            f.Code = it.Code;
            f.Discount = it.Discount;
            f.FareType = it.FareType;

            return f;
          })
        ),
        PolicyIds: whitelist[0].passenger.Policy.Id,
      };
      result = await this.apiService.getPromiseData<FlightResultEntity>(req);
    } else {
      if (notWhitelist.length) {
      }
    }
    return result;
  }
  private filterByCondition(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    data = this.filterByAirports(data);
    data = this.filterByAirComponies(data);
    if (condition && data && data.FlightRoutes) {
      if (condition.isDirectFly) {
        data.FlightRoutes = data.FlightRoutes.filter((it) => !it.isTransfer);
      }
    }
    data = this.filterByTimeSpan(data);
    return data;
  }
  private filterByTimeSpan(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    if (data && data.FlightRoutes) {
      if (condition && condition.timeSpan) {
        if (condition.timeSpan.lower > 0 || condition.timeSpan.upper < 24) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            const time =
              (r.fromSegment && r.fromSegment.TakeoffTime) || r.FirstTime;
            if (time) {
              const [h, m, s] = time
                .substr(11)
                .split(":")
                .map((it) => +it);
              return (
                condition.timeSpan.lower <= h && h <= condition.timeSpan.upper
              );
            }
            return !!time;
          });
        }
      }
    }
    return data;
  }
  private filterByAirComponies(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    if (data && data.FlightRoutes) {
      if (condition) {
        const airs =
          condition.airComponies &&
          condition.airComponies.filter((it) => it.isChecked);
        if (airs && airs.length) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            return (
              r.fromSegment &&
              airs.some((a) => a.label == r.fromSegment.AirlineName)
            );
          });
        }
      }
    }
    return data;
  }
  private filterByAirports(data: FlightResultEntity) {
    const condition = this.getFilterCondition();
    if (condition) {
      if (data && data.FlightRoutes) {
        const fromAirports =
          condition.fromAirports &&
          condition.fromAirports.filter((it) => it.isChecked);
        if (fromAirports && fromAirports.length) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            return (
              r.fromSegment &&
              fromAirports.some(
                (fa) => fa.FromAirportName == r.fromSegment.FromAirportName
              )
            );
          });
        }
        const toAirports =
          condition.toAirports &&
          condition.toAirports.filter((it) => it.isChecked);
        if (toAirports && toAirports.length) {
          data.FlightRoutes = data.FlightRoutes.filter((r) => {
            return (
              r.toSegment &&
              toAirports.some(
                (fa) => fa.ToAirportName == r.fromSegment.ToAirportName
              )
            );
          });
        }
      }
    }
    return data;
  }
  private async initParagraphCondition(data: FlightResultEntity) {
    const m = this.getSearchModel();
    const condition = this.getFilterCondition();
    condition.airComponies = [];
    condition.fromAirports = [];
    condition.toAirports = [];
    condition.isFilter = false;
    condition.timeSpan = { lower: 0, upper: 24 };
    condition.isDirectFly = false;
    if (data && data.FlightRoutesData) {
      const routeIds = m.trips
        .filter((it) => !!it.bookInfo)
        .map(
          (it) =>
            it.bookInfo && it.bookInfo.flightRoute && it.bookInfo.flightRoute.Id
        )
        .filter((it) => !!it);
      if (!routeIds.length) {
        data.FlightRoutes = data.FlightRoutesData.filter(
          (r) => r.Paragraphs == 1
        );
      } else {
        const rids = routeIds.join(",");
        const fares = data.FlightFares.filter((it) => {
          const temp = it.FlightRouteIds || [];
          return temp.slice(0, routeIds.length).join(",") === rids;
        });
        data.FlightRoutes = data.FlightRoutesData.filter((it) =>
          fares.some((f) => f.FlightRouteIds[routeIds.length] == it.Id)
        );
      }
      data.FlightRoutes.forEach((r) => {
        if (r.fromSegment) {
          const s = r.fromSegment;
          if (!condition.airComponies.find((c) => c.label == s.AirlineName)) {
            condition.airComponies.push({
              label: s.AirlineName,
              isChecked: false,
              logoPic: s.AirlineSrc,
            });
          }
          if (
            !condition.fromAirports.find(
              (it) => it.FromAirportName == s.FromAirportName
            )
          ) {
            condition.fromAirports.push({
              FromAirport: s.FromAirport,
              FromAirportName: s.FromAirportName,
              FromCityName: s.FromCityName,
              FromTerminal: s.FromTerminal,
              label: s.FromAirportName,
            });
          }
        }
        if (r.toSegment) {
          const s = r.toSegment;
          if (
            !condition.toAirports.find(
              (it) => it.ToAirportName == s.ToAirportName
            )
          ) {
            condition.toAirports.push({
              ToAirport: s.ToAirport,
              ToAirportName: s.ToAirportName,
              ToCityName: s.ToCityName,
              ToTerminal: s.ToTerminal,
              label: s.ToAirportName,
            });
          }
        }
        const ids = m.trips
          .filter((it) => !!it.bookInfo)
          .map((it) => it.bookInfo.flightRoute && it.bookInfo.flightRoute.Id)
          .filter((it) => !!it);
        const flightFare = this.getFlightFare(data.FlightFares, ids);
        if (flightFare) {
          r.flightFare = flightFare;
        }
        return r;
      });
      this.setFilterConditionSource(condition);
      await this.checkPolicy();
    }
  }
  private initFlightRouteSegments(data: FlightResultEntity) {
    if (data && data.FlightSegments && data.FlightFares) {
      const trips = this.getSearchModel().trips || [];
      data = { ...data };
      if (!data.FlightRoutesData || !data.FlightRoutesData.length) {
        data.FlightRoutesData = [...data.FlightRoutes];
      }
      if (data.FlightRoutesData && data.FlightRoutesData.length) {
        data.FlightRoutesData.sort((a, b) => {
          return a.FlightSegmentIds &&
            b.FlightSegmentIds &&
            a.FlightSegmentIds.length == b.FlightSegmentIds.length
            ? new Date(a.FirstTime).getTime() - new Date(b.FirstTime).getTime()
            : a.FlightSegmentIds.length - b.FlightSegmentIds.length;
        });
        data.FlightRoutesData = data.FlightRoutesData.map((flightRoute) => {
          flightRoute.FlightSegments = flightRoute.FlightSegmentIds.map((it) =>
            data.FlightSegments.find((s) => s.Id == it)
          );
          flightRoute.transferSegments = data.FlightSegments.filter((s) =>
            flightRoute.FlightSegmentIds.some((id) => id == s.Id)
          ).map(it=>{
            return {
              ...it,
              FlyTime:this.getFlyTime(it.Duration)
            }
          });
          flightRoute.fromSegment = flightRoute.FlightSegments[0];
          if (flightRoute.fromSegment) {
            flightRoute.fromSegment.TakeoffTimeStamp = new Date(
              flightRoute.fromSegment.TakeoffTime
            ).getTime();
          }
          flightRoute.toSegment =
            flightRoute.FlightSegments[flightRoute.FlightSegments.length - 1];
          flightRoute.isTransfer = flightRoute.transferSegments.length > 1;
          flightRoute.flightFare = this.getFlightFare(data.FlightFares, [
            flightRoute.Id,
          ]);

          flightRoute.addDays = this.getDays(
            flightRoute.ArrivalTime,
            flightRoute.FirstTime
          );
          flightRoute.flyTime = this.getFlyTime(+flightRoute.Duration);
          return flightRoute;
        });
      }
    }
    return data;
  }
  private getDays(arrivalTime: string, firstTime: string) {
    const delta =
      new Date(arrivalTime).getTime() - new Date(firstTime).getTime();
    let addDays = Math.floor(delta / (1000 * 24 * 3600));
    if (addDays <= 0) {
      const [y1, m1, d1] = arrivalTime.substr(0, 10).split("-");
      const [y2, m2, d2] = firstTime.substr(0, 10).split("-");
      addDays = +d1 - +d2;
    }
    return addDays;
  }
  getFlyTime(duration: number) {
    let flyTime = "";
    // tslint:disable-next-line: no-bitwise
    const h = ~~(duration / 60);
    const m = duration - h * 60;
    flyTime = `${h}H${m}M`;
    return flyTime;
  }
  private getFlightFare(flightFares: FlightFareEntity[], routeIds: string[]) {
    const ffs = flightFares.filter((f) => {
      const ids = f.FlightRouteIds && f.FlightRouteIds;
      return routeIds.length > 1
        ? ids.slice(0, routeIds.length).join(",") == routeIds.join(",")
        : ids.some((id) => id == routeIds[0]);
    });
    let minPrice = Infinity;
    ffs.forEach((it) => {
      minPrice = Math.min(minPrice, +it.SalesPrice);
    });
    const flightFare = ffs.find((ff) => +ff.SalesPrice == +minPrice);
    if (
      this.flightPolicyResult &&
      this.flightPolicyResult.FlightFares &&
      flightFare
    ) {
      // 差标信息
      const one = this.flightPolicyResult.FlightFares.find(
        (it) => it.Id == flightFare.Id
      );
      if (one) {
        flightFare.IsAllowOrder = one.IsAllowOrder;
        flightFare.Rules = one.Rules;
        if (flightFare.Rules) {
          flightFare.ruleMessage = Object.keys(flightFare.Rules)
            .map((k) => flightFare.Rules[k])
            .join(";");
        }
      }
    }
    return flightFare;
  }
  async getInternationalAirports(forceFetch = false) {
    let airports = await this.tmcService.getInternationalAirports(forceFetch);
    const countries = await this.getCountries(forceFetch);
    if (countries && countries.length) {
      airports = airports.map((a) => {
        a.Country = countries.find((c) => c.Code == a.CountryCode);
        return a;
      });
    }
    return airports;
  }
  getCountries(forceFetch = false) {
    return this.tmcService.getCountries(forceFetch);
  }
  beforeSelectCity(isFrom: boolean, trip: ITripInfo) {
    if (this.searchModel) {
      if (this.searchModel.trips) {
        this.searchModel.trips = this.searchModel.trips.map((t) => {
          t.isSelectInfo = t.id == trip.id;
          return t;
        });
      }
    }
    this.setSearchModelSource(this.searchModel);
    this.router.navigate(
      [AppHelper.getRoutePath("select-international-flight-city")],
      {
        queryParams: { requestCode: isFrom ? "select_from_city" : "to_city" },
      }
    );
  }
  afterCitySelected(city: TrafficlineEntity, isFrom: boolean) {
    if (this.searchModel && this.searchModel.trips) {
      const trip = this.searchModel.trips.find((t) => t.isSelectInfo);
      if (trip) {
        if (isFrom) {
          trip.fromCity = city;
        } else {
          trip.toCity = city;
        }
        this.searchModel.trips = this.searchModel.trips.map((it) => {
          it.isSelectInfo = false;
          return it;
        });
      }
      this.setSearchModelSource(this.searchModel);
    }
  }
  getSearchModel() {
    return this.searchModel;
  }
  setSearchModelSource(m: IInternationalFlightSearchModel) {
    this.searchModel = m;
    if (m) {
      if (m.voyageType == FlightVoyageType.GoBack) {
        this.lastGobackSearchModel = m;
        if (m.trips) {
          const trip = m.trips[0];
          const backTrip = m.trips[1];
          if (trip && backTrip) {
            backTrip.fromCity = trip.toCity;
            backTrip.toCity = trip.fromCity;
          }
        }
      }
      if (m.voyageType == FlightVoyageType.OneWay) {
        this.lastOneWaySearchModel = m;
      }
      if (m.voyageType == FlightVoyageType.MultiCity) {
        this.lastMultiTripSearchModel = m;
      }
    }
    if (this.searchModelSource) {
      this.searchModelSource.next(m);
    } else {
      this.searchModelSource = new BehaviorSubject(this.searchModel);
    }
  }
  getSearchModelSource() {
    return this.searchModelSource.asObservable();
  }
  setBookInfoSource(
    infos: PassengerBookInfo<IInternationalFlightSegmentInfo>[]
  ) {
    this.bookInfos = infos;
    this.bookInfoSource.next(infos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  addPassengerBookInfo(
    arg: PassengerBookInfo<IInternationalFlightSegmentInfo>
  ): Promise<string> {
    console.log("addPassengerFlightSegments", arg);
    const infos = this.getBookInfos();
    if (!arg || !arg.passenger || !arg.credential) {
      AppHelper.alert(LanguageHelper.Flight.getSelectedFlightInvalideTip());
      return;
    }
    arg.id = AppHelper.uuid();
    if (!arg.credential.Account || arg.isNotWhitelist) {
      arg.credential.Account = arg.passenger.Account;
    }
    arg.isNotWhitelist = arg.passenger.isNotWhiteList;
    infos.push(arg);
    console.log("addPassengerFlightSegments added", arg);
    this.setBookInfoSource(infos);
  }
  removeBookInfo(
    bookInfo: PassengerBookInfo<IInternationalFlightSegmentInfo>,
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
    this.setBookInfoSource(this.bookInfos);
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  removeAllBookInfos() {
    this.bookInfos = [];
    this.setBookInfoSource(this.getBookInfos());
  }
}
export interface IInternationalFlightQuery {
  FromAirport: string;
  ToAirport: string;
  Date: string;
  VoyageType: FlightVoyageType;
}
export interface ITripInfo {
  id: string;
  idx?: number;
  fromCity: TrafficlineEntity;
  date: string;
  toCity?: TrafficlineEntity;
  bookInfo?: IInternationalFlightSegmentInfo;
  isSelectInfo?: boolean;
}
export interface IInternationalFlightSearchModel {
  trips: ITripInfo[];
  voyageType: FlightVoyageType;
  cabin: IFlightCabinType;
  cabins: IFlightCabinType[];
}

export interface IInternationalFlightSegmentInfo {
  fromSegment: FlightSegmentEntity;
  toSegment: FlightSegmentEntity;
  flightRoute: FlightRouteEntity;
  flightPolicy: FlightPolicy;
  isDontAllowBook?: boolean;
  id?: string;
}
