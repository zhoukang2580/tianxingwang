import { Pipe, PipeTransform, Injectable } from "@angular/core";
import { FlightCabinType } from "../models/flight/FlightCabinType";

@Injectable({ providedIn: "root" })
@Pipe({
  name: "cabintype"
})
export class CabintypePipe implements PipeTransform {
  transform(value: number | string, args?: any): any {
    switch (value) {
      case FlightCabinType.Y:
      case FlightCabinType[FlightCabinType.Y]:
        return "经济舱";
      case FlightCabinType.C:
      case FlightCabinType[FlightCabinType.C]:
        return "公务舱";
      case FlightCabinType.F:
      case FlightCabinType[FlightCabinType.F]:
        return "头等舱";
      case FlightCabinType.SeniorY:
      case FlightCabinType[FlightCabinType.SeniorY]:
        return "高端经济舱";
      case FlightCabinType.DiscountC:
      case FlightCabinType[FlightCabinType.DiscountC]:
        return "折扣公务舱";
      case FlightCabinType.DiscountF:
      case FlightCabinType[FlightCabinType.DiscountF]:
        return "折扣头等舱";
      case FlightCabinType.SuperF:
      case FlightCabinType[FlightCabinType.SuperF]:
        return "超级头等舱";
      default:
        return value;
    }
  }
}
