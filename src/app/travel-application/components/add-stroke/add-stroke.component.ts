import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { TravelFormTripEntity, TravelService } from "../../travel.service";
import { ModalController, IonSelect } from "@ionic/angular";
import { SelectCity } from "../select-city/select-city";
import { AppHelper } from "src/app/appHelper";
import { FlightService } from "src/app/flight/flight.service";
import { Router } from "@angular/router";
import { from } from "rxjs";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { InternationalFlightService } from "src/app/flight-international/international-flight.service";
import { InternationalHotelService } from "src/app/hotel-international/international-hotel.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { HotelService } from "src/app/hotel/hotel.service";
import { TrainService } from "src/app/train/train.service";
import { CalendarService } from "src/app/tmc/calendar.service";
interface IRegionType {
  label: string;
  value: string;
}
@Component({
  selector: "app-add-stroke",
  templateUrl: "./add-stroke.component.html",
  styleUrls: ["./add-stroke.component.scss"],
})
export class AddStrokeComponent implements OnInit, OnChanges {
  @Output() remove: EventEmitter<any>;
  @Input() trip: TravelFormTripEntity;
  @Input() enable: boolean;
  @Input() pass: boolean;
  @Input() index: number;
  @Input() regionTypes: IRegionType[];
  @Input() domestic: boolean;
  @Input() international: boolean;
  @Input() travelFromId: string;
  @Input() TravelApprovalContent: string;
  @Input() vmRegionTypes: { value: string; label: string }[];
  constructor(
    private router: Router,
    private flightService: FlightService,
    private internationalFlightService: InternationalFlightService,
    private internationalHotelService: InternationalHotelService,
    private hotelService: HotelService,
    private service: TravelService,
    private tmcService: TmcService,
    private trainService: TrainService,
    private calendarService: CalendarService,
    private modalCtrl: ModalController
  ) {
    this.remove = new EventEmitter();
  }
  compareTravelToolWithFn = (o1: string, o2: string[] | string) => {
    if (Array.isArray(o2)) {
      return o2 && o1 && o2.some((it) => it == o1);
    }

    return o1 == o2;
  };
  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  ngOnChanges(change: SimpleChanges) {
    console.log("ngOnChanges ", change);

    if (change && change.regionTypes && change.regionTypes.currentValue) {
      if (this.trip && this.regionTypes && this.trip.TravelTool) {
        console.log(this.regionTypes, "regionTypes");
        const arr = this.trip.TravelTool.split(",");
        this.vmRegionTypes = this.vmRegionTypes || [];
        this.regionTypes.forEach((t) => {
          // console.log(arr.some(f=>f==t.value),"arr.some(f=>f==t.value)");
          if (
            arr.some((f) => f == t.value) &&
            !this.vmRegionTypes.some((s) => s.value == t.value)
          ) {
            this.vmRegionTypes.push(t);
          }
        });
        //  console.log(this.vmRegionTypes, "vmRegionTypes");
        //  console.log(this.trip.travelTools, "this.trip.travelTools333333");
        // this.getRegionTypes()
      }
    }
  }
  ngOnInit() {
    // this.trip.StartDate = new Date().toISOString();
    // this.trip.EndDate = new Date().toISOString();
  }
  duageTime(start, EndDate) {
    let day = this.getNumberOfDays(start, EndDate);
    if (day < 0) {
      AppHelper.alert("出差结束时间不能早于出差开始时间");
      return;
    }
  }
  onDelete() {
    this.remove.emit(this.trip);
  }
  onGetCities() {
    // return this.service.getCities();
  }
  private getNumberOfDays(date1, date2) {
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
    const m = await this.modalCtrl.create({
      component: SelectCity,
      componentProps: {
        tripType: this.trip.TripType,
      },
    });

    m.present();
    const res = await m.onDidDismiss();
    const city: TrafficlineEntity = res && res.data;
    if (city && this.trip) {
      if (isFrom) {
        this.trip.FromCityCode = res.data.Code;
        this.trip.FromCityName =
          res.data.Name + `(${(city.Country && city.Country.Name) || ""})`;
      } else {
        this.trip.ToCityCode = res.data.Code;
        this.trip.ToCityName =
          res.data.Name + `(${(city.Country && city.Country.Name) || ""})`;
      }
    }
  }
  getTravelTools(t) {
    let text = "";
    if (!this.regionTypes) {
      return;
    }
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
        this.router.navigate(["rental-car"]);
      }
      this.flightService.removeAllBookInfos();
      const a = await this.service.getReserve({
        TravelFormId: this.travelFromId,
        TravelTool: t,
        TripId: this.trip.Id,
      });
      console.log(a, "aaaaaaaa");
      if (a.Variables) {
        a.VariablesJsonObj = a.VariablesJsonObj || JSON.parse(a.Variables);
      }
      if (t == "InternationalFlight") {
        this.getInternationalFlight(a);
      } else if (t == "Flight") {
        this.getFlight(a);
      } else if (t == "InternationalHotel") {
        this.getInternationalHotel(a);
      } else if (t == "Hotel") {
        this.getHotel(a);
      } else if (t == "Train") {
        this.getTrain(a);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  getInternationalFlight(a) {
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
  private getDate(date: string) {
    const m = this.calendarService.getMoment(0, (date || "").substr(0, 10));
    const m2 = this.calendarService.getMoment(
      0,
      this.calendarService.getMoment(0).format("YYYY-MM-DD")
    );
    return +m > +m2 ? m.format("YYYY-MM-DD") : m2.format("YYYY-MM-DD");
  }
  private addOneDate(date: string) {
    const m = this.calendarService.getMoment(0, (date || "").substr(0, 10));
    const m2 = this.calendarService.getMoment(
      1,
      this.calendarService.getMoment(0).format("YYYY-MM-DD")
    );
    return +m >= +m2 ? m.format("YYYY-MM-DD") : m2.format("YYYY-MM-DD");
  }
  getFlight(a) {
    if (a.VariablesJsonObj) {
      const toCity: TrafficlineEntity = a.VariablesJsonObj.ToAirportCity || {};
      const fromCity: TrafficlineEntity =
        a.VariablesJsonObj.FromAirportCity || {};
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
        Date: this.getDate(this.trip.StartDate),
        BackDate: this.addOneDate(this.trip.EndDate),
      });
      this.router.navigate(["flight-list"], {
        queryParams: { doRefresh: true },
      });
    } else {
      AppHelper.alert("接口请求异常");
    }
  }
  async getInternationalHotel(a) {
    if (a.VariablesJsonObj) {
      const countries = await this.tmcService.getCountries();
      const fromCity: TrafficlineEntity = a.VariablesJsonObj.City || {};
      this.internationalHotelService.setSearchConditionSource({
        ...this.internationalHotelService.getSearchCondition(),
        checkinDate: this.getDate(this.trip.StartDate),
        checkoutDate: this.addOneDate(this.trip.EndDate),
        destinationCity: fromCity,
        country: countries.find((it) => it.Code == fromCity.CountryCode),
        adultCount: 1,
      });
      // this.router.navigate(["flight-list"], {
      //   queryParams: { doRefresh: true },
      // });
    } else {
      AppHelper.alert("接口请求异常");
    }
  }
  getHotel(a) {
    if (a.VariablesJsonObj) {
      console.log(a.VariablesJsonObj.toCity, "a.VariablesJsonObj");

      const toCity: TrafficlineEntity = a.VariablesJsonObj.toCity || {};
      // const fromCity: TrafficlineEntity = a.VariablesJsonObj.City || {};
      this.hotelService.setSearchHotelModel({
        ...this.hotelService.getSearchHotelModel(),
        checkInDate: this.getDate(this.trip.StartDate),
        checkOutDate: this.addOneDate(this.trip.EndDate),
        destinationCity: toCity,
        hotelType: "normal",
      });
      this.router.navigate(["hotel-list"], {
        queryParams: { doRefresh: true },
      });
    }
  }
  getTrain(a) {
    if (a.VariablesJsonObj) {
      console.log(
        (this.trip.StartDate || "").substr(0, 10),
        "this.trip.StartDate"
      );
      const toCity: TrafficlineEntity = a.VariablesJsonObj.ToStationCity || {};
      const fromCity: TrafficlineEntity =
        a.VariablesJsonObj.FromStationCity || {};
      this.trainService.setSearchTrainModelSource({
        ...this.trainService.getSearchTrainModel(),
        Date: this.getDate(this.trip.StartDate),
        FromStation: a.VariablesJsonObj.FromStationCity.Code,
        fromCity,
        toCity,
        ToStation: a.VariablesJsonObj.ToStationCity.Code,
        isLocked: true,
        isExchange: false,
      });
      this.router.navigate(["train-list"], {
        queryParams: { doRefresh: true },
      });
    } else {
      AppHelper.alert("接口请求异常");
    }
  }
  getRegionTypes(t) {
    console.log(
      this.TravelApprovalContent.split(","),
      "vmTravelApprovalContent"
    );
    const approvals =
      (this.TravelApprovalContent && this.TravelApprovalContent.split(",")) ||
      [];
    console.log(t, "Tttt");
    console.log(this.regionTypes, "this.regionTypes ");
    if (t == "Domestic") {
      this.vmRegionTypes = this.regionTypes.filter((t) => {
        if (t.value) {
          return (
            t.value.toLowerCase() == "flight" ||
            t.value.toLowerCase() == "hotel" ||
            t.value.toLowerCase() == "train" ||
            t.value.toLowerCase() == "car"
          );
        }
        return false;
      });
      // this.vmRegionTypes.includes()
    } else if (t == "International") {
      this.vmRegionTypes = this.regionTypes.filter((t) => {
        if (t.value) {
          return t.value.toLowerCase().includes("international");
        }
        return false;
      });
    }
    this.vmRegionTypes = this.vmRegionTypes.filter((it) =>
      approvals.some((a) => a == it.value)
    );
    this.trip.travelTools = [];
  }
}
