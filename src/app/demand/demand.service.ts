import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AppHelper } from "../appHelper";
import { HotelService } from "../hotel/hotel.service";
import { ApiService } from "../services/api/api.service";
import { RequestEntity } from "../services/api/Request.entity";
import { TmcService } from "../tmc/tmc.service";
import { TrainService } from "../train/train.service";

@Injectable({
  providedIn: "root",
})
export class DemandService {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private tmcService: TmcService,
    private hotelService: HotelService,
    private trainService: TrainService
  ) {}

  saveDemand(d: { Tag: String; DemandType: Number; Demand: any }) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-SaveDemand";
    req.Data = {
      DemandType: d.DemandType,
      Tag: d.Tag,
      Demand: d.Demand,
    };
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<any[]>(req);
  }

  // getDemandTeam(DemandType: Number) {
  //   const req = new RequestEntity();
  //   req.Method = "TmcApiHomeUrl-Home-SaveDemand"
  //   req.Data = {
  //     DemandType: DemandType
  //   };
  //   return this.apiService.getPromiseData<any[]>(req);
  // }
  getStations() {
    return this.trainService.getStationsAsync();
  }
  getCities() {
    return this.hotelService.getHotelCityAsync();
  }
  getAirports() {
    return this.tmcService.getDomesticAirports();
  }
  getCountries() {
    return this.tmcService.getCountries();
  }
  onSelectTrainStation(isFrom: boolean) {
    this.router.navigate([AppHelper.getRoutePath("select-station")], {
      queryParams: { requestCode: isFrom ? "from_station" : "to_station" },
    });
  }
}

export class OtherDemandModel {
  DemandType: FlightType;
  Tag: string;
  demandTeam: DemandTeamModel;
  demandTour: DemandTourModel;
  demandVisa: DemandVisaModel;
  demandPickUpFlight: DemandPickUpFlightModel;
  demandDeliverFlight: DemandDeliverFlightModel;
  demandPickUpTrain: DemandPickUpTrainModel;
  demandDeliverTrain: DemandDeliverTrainModel;
  demandCharterCar: DemandCharterCarModel;
  demandAirportService: DemandAirportServiceModel;
}

export enum FlightType {
  /// <summary>
  /// 需求单
  /// </summary>
  //  [Description("需求单")]
  FlightDemand = 1,
  /// <summary>
  /// 国际机票改签
  /// </summary>
  //  [Description("国际机票改签")]
  InternationFlightExchange = 2,
  /// <summary>
  /// 国际机票退票
  /// </summary>
  //  [Description("国际机票退票")]
  InternationalFlightRefund = 3,
  /// <summary>
  /// 国际机票出票
  /// </summary>
  //  [Description("国际机票出票")]
  InternationFlightIssue = 4,
  /// <summary>
  /// 国际机票出票
  /// </summary>
  //  [Description("国际机票改签出票")]
  InternationFlightExchangeIssue = 5,
  /// <summary>
  /// 国内机票改签
  /// </summary>
  //  [Description("国内机票改签")]
  FlightExchange = 6,
  /// <summary>
  /// 国内机票退票
  /// </summary>
  //  [Description("国内机票退票")]
  FlightRefund = 7,
  /// <summary>
  /// 团队需求单
  /// </summary>
  //  [Description("团队需求单")]
  TeamDemand = 8,
  /// <summary>
  /// 旅游需求单
  /// </summary>
  //  [Description("旅游需求单")]
  TourDemand = 9,
  /// <summary>
  /// 签证需求单
  /// </summary>
  //  [Description("签证需求单")]
  VisaDemand = 10,
  /// <summary>
  /// 用车需求单
  /// </summary>
  //  [Description("用车需求单")]
  CarDemand = 11,
  /// <summary>
  /// 机场服务需求单
  /// </summary>
  //  [Description("机场服务需求单")]
  AirportDemand = 12,
}

// export type CarType ='PickUpFlight' | '' | '' | '' | '';
export enum CarType {
  PickUpFlight = "PickUpFlight",
  DeliverFlight = "DeliverFlight",
  PickUpTrain = "PickUpTrain",
  DeliverTrain = "DeliverTrain",
  CharterCar = "CharterCar",
}
export class DemandTeamModel {
  TravelType: string;
  FromAddress: string;
  ToAddress: string;
  DepartureDate: string;
  ReturnDate: string;
  PersonCount: string;
  PersonBudget: string;
  ProductType: string;
  LiaisonName: string;
  LiaisonPhone: string;
  LiaisonEmail: string;
  ToCityCode: string;
  FromCityCode: string;
}

export class DemandTourModel {
  MeetingType: string;
  LiaisonName: string;
  LiaisonPhone: string;
  CompanyName: string;
  CompanyEmail: string;
  Remarks: string;
}

export class DemandVisaModel {
  VisaType: string;
  LiaisonName: string;
  LiaisonPhone: string;
  Destination: string;
  WorkPlace: string;
  DestinationCode: string;
  WorkPlaceCode: string;
  Email: string;
  Remarks: string;
}

export class DemandPickUpFlightModel {
  FilghtDepartureDate: string;
  FlightNumber: string;
  CityName: string;
  AirportName: string;
  Remarks: string;
  CityCode: string;
  AirportCode: string;
  LiaisonName: string;
  LiaisonPhone: string;
}

export class DemandDeliverFlightModel {
  DeliverFilghtDepartureDate: string;
  DeliverFilghtDepartureTime: string;
  FlightNumber: string;
  CityName: string;
  Address: string;
  CityCode: string;
  Remarks: string;
  LiaisonName: string;
  LiaisonPhone: string;
}

export class DemandPickUpTrainModel {
  TrainStationName: string;
  CityName: string;
  Address: string;
  PickUpUseCarDate: string;
  PickUpUseCarTime: string;
  Remarks: string;
  CityCode: string;
  TrainStationCode: string;
  LiaisonName: string;
  LiaisonPhone: string;
}

export class DemandDeliverTrainModel {
  TrainStationName: string;
  CityName: string;
  Address: string;
  DeliverUseCarTime: string;
  DeliverUseCarDate: string;
  Remarks: string;
  CityCode: string;
  TrainStationCode: string;
  LiaisonName: string;
  LiaisonPhone: string;
}

export class DemandCharterCarModel {
  CharterCarType: string;
  ServiceStartCity: string;
  ServiceEndCity: string;
  CharterCarDate: string;
  CharterCarTime: string;
  CharterCarDays: string;
  ServiceStartCityId: string;
  ServiceEndCityId: string;
  Remarks: string;
  LiaisonName: string;
  LiaisonPhone: string;
}

export class DemandAirportServiceModel {
  ServiceType: string;
  City: string;
  AirportName: string;
  DepartureDateDay: string;
  DepartureDateHour: string;
  Terminal: string;
  NumberOfPeople: string;
  Remarks: string;
  LiaisonName: string;
  LiaisonPhone: string;
}
