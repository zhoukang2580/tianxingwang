import { AppHelper } from "./../../appHelper";
import { Pipe, PipeTransform, Injectable } from "@angular/core";
import { FlightCabinType } from "../models/flight/FlightCabinType";

@Injectable({ providedIn: "root" })
@Pipe({
  name: "cabintype",
})
export class CabintypePipe implements PipeTransform {
  get lang() {
    return AppHelper.getLanguage();
  }
  transform(value: number | string, args?: any): any {
    switch (value) {
      case FlightCabinType.Y:
      case FlightCabinType[FlightCabinType.Y]:
      case "经济舱":
        return this.lang == "en" ? "Economy class" : "经济舱";
      case FlightCabinType.C:
      case FlightCabinType[FlightCabinType.C]:
      case "公务舱":
        return this.lang == "en" ? "Business class" : "公务舱";
      case FlightCabinType.F:
      case FlightCabinType[FlightCabinType.F]:
      case "头等舱":
        return this.lang == "en" ? "First class" : "头等舱";
      case FlightCabinType.SeniorY:
      case FlightCabinType[FlightCabinType.SeniorY]:
      case "高端经济舱":
        return this.lang == "en" ? "High-end economy" : "高端经济舱";
      case FlightCabinType.DiscountC:
      case FlightCabinType[FlightCabinType.DiscountC]:
      case "折扣公务舱":
        return this.lang == "en" ? "Discount business" : "折扣公务舱";
      case FlightCabinType.DiscountF:
      case FlightCabinType[FlightCabinType.DiscountF]:
        case "折扣头等舱":
          return this.lang == "en" ? "Discount first" : "折扣头等舱";
      case FlightCabinType.SuperF:
      case FlightCabinType[FlightCabinType.SuperF]:
        case "超级头等舱":
          return this.lang == "en" ? "Super first" : "超级头等舱";
      case FlightCabinType[FlightCabinType.BusinessPremier]:
         case "豪华公务舱":
        return this.lang == "en" ? "Business Premier" : "豪华公务舱";
      default:
        return value;
    }
  }
}
