import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
} from "@angular/core";
import { TravelFormTripEntity, TravelService } from "../../travel.service";
import { ModalController, IonSelect } from "@ionic/angular";
import { SelectCity } from "../select-city/select-city";
import { AppHelper } from "src/app/appHelper";
import { FlightService } from 'src/app/flight/flight.service';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';
import { InternationalFlightService } from 'src/app/flight-international/international-flight.service';
import { InternationalHotelService } from 'src/app/hotel-international/international-hotel.service';
import { TmcService } from 'src/app/tmc/tmc.service';
import { HotelService } from 'src/app/hotel/hotel.service';
import { TrainService } from 'src/app/train/train.service';
interface IRegionType {
  label: string;
  value: string;
}
@Component({
  selector: "app-add-stroke",
  templateUrl: "./add-stroke.component.html",
  styleUrls: ["./add-stroke.component.scss"],
})
export class AddStrokeComponent implements OnInit {
  @Output() remove: EventEmitter<any>;
  @Input() trip: TravelFormTripEntity;
  @Input() enable: boolean;
  @Input() pass: boolean;
  @Input() index: number;
  @Input() regionTypes: IRegionType[];
  @Input() travelFromId: string;
  constructor(
    private router: Router,
    private flightService: FlightService,
    private internationalFlightService: InternationalFlightService,
    private internationalHotelService: InternationalHotelService,
    private hotelService: HotelService,
    private service: TravelService,
    private tmcService: TmcService,
    private trainService: TrainService,
    private modalCtrl: ModalController
  ) {
    this.remove = new EventEmitter();
  }
  compareTravelToolWithFn = (o1: string, o2: string[] | string) => {
    if (Array.isArray(o2)) {
      return o2 && o1 && o2.some((it) => it == o1);
    }
    if (this.trip && this.trip.travelTools) {
      this.trip.TravelTool = this.trip.travelTools.join(",");
    }
    return o1 == o2;
  };
  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  ngOnInit() {
    // this.trip.StartDate = new Date().toISOString();
    // this.trip.EndDate = new Date().toISOString();
  }
  duageTime(start,EndDate){
    let day = this.getNumberOfDays(start,EndDate);
    if(day<0){
      AppHelper.alert("出差结束时间不能早于出差开始时间")
    }
  }
  onDelete() {
    this.remove.emit(this.trip);
  }
  onGetCities() {
    // return this.service.getCities();
  }
  getNumberOfDays(date1, date2) {
    if (!date1 || !date2) {
      return 0;
    }
    const a1 = AppHelper.getDate(date1.substr(0, 10)).getTime();
    const a2 = AppHelper.getDate(date2.substr(0, 10)).getTime();
    let day = (a2 - a1) / (1000 * 60 * 60 * 24); // 核心：时间戳相减，然后除以天数
    day += 1;
    if (this.trip) {
      this.trip.Day = day;
    }
    return day;
  }
  async onSelectCity(isFrom = true) {
    if (!this.enable) {
      return;
    }
    const m = await this.modalCtrl.create({ component: SelectCity });
    m.present();
    const res = await m.onDidDismiss();
    if (res && res.data && this.trip) {
      if (isFrom) {
        this.trip.FromCityCode = res.data.Code;
        this.trip.FromCityName = res.data.Name;
      } else {
        this.trip.ToCityCode = res.data.Code;
        this.trip.ToCityName = res.data.Name;
      }
    }
  }
  getTravelTools(t) {

    let text = "";
    for (const it of this.regionTypes) {
      if (it.value == t) {
        text = it.label;
        break;
      }
    }
    return text;
  }
  async goReserve(t) {
    try {
      console.log(t, "ddddd");
      if (t == "Car") {
        this.router.navigate(["rental-car"])
      }
      this.flightService.removeAllBookInfos();
      const a = await this.service.getReserve({
        TravelFormId: this.travelFromId,
        TravelTool: t,
        TripId: this.trip.Id,
      })
      console.log(a, "aaaaaaaa");
      if (a.Variables) {
        a.VariablesJsonObj = a.VariablesJsonObj || JSON.parse(a.Variables);
      }
      if (t == "InternationalFlight") {
        this.getInternationalFlight(a);
      }else if (t == "Flight") {
        this.getFlight(a)
      } else if (t == "InternationalHotel") {
       this.getInternationalHotel(a);
      } else if (t == "Hotel") {
        this.getHotel(a);
      }else if(t=="Train"){
        this.getTrain(a);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  getInternationalFlight(a){
    if (a.VariablesJsonObj) {
      // const toCity: TrafficlineEntity = a.VariablesJsonObj.ToAirportCity || {};
      // const fromCity: TrafficlineEntity = a.VariablesJsonObj.FromAirportCity || {};
      // this.internationalFlightService.setSearchModelSource({
      //    ...this.flightService.getSearchFlightModel(),
      //    FromCode:fromCity.Code,
      //    ToCode: this.trip.ToCityCode,
      //    FromAsAirport: false,
      //    ToAsAirport: false,
      //    fromCity,
      //    toCity,
      //    isLocked: true,
      //    isRoundTrip: false,
      //    Date: this.trip.StartDate.substr(0, 10),
      //  });
      //  this.router.navigate(["international-flight-list"], {
      //    queryParams: { doRefresh: true },
      //  });
    }
  }
  getFlight(a){
    if (a.VariablesJsonObj) {
      const toCity: TrafficlineEntity = a.VariablesJsonObj.ToAirportCity || {};
      const fromCity: TrafficlineEntity = a.VariablesJsonObj.FromAirportCity || {};
      this.flightService.setSearchFlightModelSource({
        ...this.flightService.getSearchFlightModel(),
        FromCode: fromCity.Code,
        ToCode: toCity.Code,
        fromCity,
        toCity,
        FromAsAirport: false,
        ToAsAirport: false,
        isLocked: true,
        isRoundTrip: this.trip.IsBackway,
        Date: (this.trip.StartDate || "").substr(0, 10),
        BackDate: (this.trip.EndDate || "").substr(0, 10)
      });
      this.router.navigate(["flight-list"], {
        queryParams: { doRefresh: true },
      });
    } else {
      AppHelper.alert("接口请求异常")
    }
  }
  async getInternationalHotel(a){
    if (a.VariablesJsonObj) {
      const countries = await this.tmcService.getCountries();
      const fromCity: TrafficlineEntity = a.VariablesJsonObj.City || {};
      this.internationalHotelService.setSearchConditionSource({
        ...this.internationalHotelService.getSearchCondition(),
        checkinDate: (this.trip.StartDate || "").substr(0, 10),
        checkoutDate: (this.trip.EndDate || "").substr(0, 10),
        destinationCity: fromCity,
        country: countries.find(it => it.Code == fromCity.CountryCode),
        adultCount: 1,
      });
      // this.router.navigate(["flight-list"], {
      //   queryParams: { doRefresh: true },
      // });
    }else {
      AppHelper.alert("接口请求异常")
    }
  }
  getHotel(a){
    if (a.VariablesJsonObj) {
      const fromCity: TrafficlineEntity = a.VariablesJsonObj.City || {};
      this.hotelService.setSearchHotelModel({
        ...this.hotelService.getSearchHotelModel(),
        checkInDate: (this.trip.StartDate || "").substr(0, 10),
        checkOutDate: (this.trip.EndDate || "").substr(0, 10),
        destinationCity: fromCity,
        hotelType:'normal'
      });
      this.router.navigate(["hotel-list"], {
        queryParams: { doRefresh: true },
      });
    }
  }
  getTrain(a){
    if (a.VariablesJsonObj) {
      console.log((this.trip.StartDate || "").substr(0, 10),"this.trip.StartDate") 
      const toCity: TrafficlineEntity = a.VariablesJsonObj.ToStationCity || {};
      const fromCity: TrafficlineEntity = a.VariablesJsonObj.FromStationCity || {};
      this.trainService.setSearchTrainModelSource({
        ...this.trainService.getSearchTrainModel(),
        Date: (this.trip.StartDate || "").substr(0, 10),
        FromStation:a.VariablesJsonObj.FromStationCity.Code,
        fromCity,
        toCity,
        ToStation:a.VariablesJsonObj.ToStationCity.Code,
        isLocked:true
      });
      this.router.navigate(["train-list"], {
        queryParams: { doRefresh: true },
      });
    }else {
      AppHelper.alert("接口请求异常")
    }
  }
}
