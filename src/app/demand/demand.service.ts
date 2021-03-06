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
  private cities: any[];
  private airports: any[];
  private stations: any[];
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
    return this.apiService.getPromiseData<boolean>(req);
  }

  // getDemandTeam(DemandType: Number) {
  //   const req = new RequestEntity();
  //   req.Method = "TmcApiHomeUrl-Home-SaveDemand"
  //   req.Data = {
  //     DemandType: DemandType
  //   };
  //   return this.apiService.getPromiseData<any[]>(req);
  // }
  async getStations() {
    if (this.stations && this.stations.length) {
      return this.stations;
    }
    this.stations = await this.trainService.getStationsAsync(true);
    return this.stations;
  }
  async getCities() {
    if (this.cities && this.cities.length) {
      return this.cities;
    }
    this.cities = await this.hotelService.getHotelCityAsync(true);
    return this.cities;
  }
  async getAirports() {
    if (this.airports && this.airports.length) {
      return this.airports;
    }
    this.airports = await this.tmcService.getDomesticAirports(true);
    return this.airports;
  }
  // getCountries() {
  //   return this.tmcService.getCountries();
  // }
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
  /// ?????????
  /// </summary>
  //  [Description("?????????")]
  FlightDemand = 1,
  /// <summary>
  /// ??????????????????
  /// </summary>
  //  [Description("??????????????????")]
  InternationFlightExchange = 2,
  /// <summary>
  /// ??????????????????
  /// </summary>
  //  [Description("??????????????????")]
  InternationalFlightRefund = 3,
  /// <summary>
  /// ??????????????????
  /// </summary>
  //  [Description("??????????????????")]
  InternationFlightIssue = 4,
  /// <summary>
  /// ??????????????????
  /// </summary>
  //  [Description("????????????????????????")]
  InternationFlightExchangeIssue = 5,
  /// <summary>
  /// ??????????????????
  /// </summary>
  //  [Description("??????????????????")]
  FlightExchange = 6,
  /// <summary>
  /// ??????????????????
  /// </summary>
  //  [Description("??????????????????")]
  FlightRefund = 7,
  /// <summary>
  /// ???????????????
  /// </summary>
  //  [Description("???????????????")]
  TeamDemand = 8,
  /// <summary>
  /// ???????????????
  /// </summary>
  //  [Description("???????????????")]
  TourDemand = 9,
  /// <summary>
  /// ???????????????
  /// </summary>
  //  [Description("???????????????")]
  VisaDemand = 10,
  /// <summary>
  /// ???????????????
  /// </summary>
  //  [Description("???????????????")]
  CarDemand = 11,
  /// <summary>
  /// ?????????????????????
  /// </summary>
  //  [Description("?????????????????????")]
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
  Airport: any;
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
