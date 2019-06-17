import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { FlightCabinType } from '../models/flight/FlightCabinType';

@Injectable({providedIn:'root'})
@Pipe({
  name: 'cabintype'
})
export class CabintypePipe implements PipeTransform {

  transform(value: number, args?: any): any {
    switch (value) {
      case FlightCabinType.Y:
        return "经济舱";
      case FlightCabinType.C:
        return "公务舱";
      case FlightCabinType.F:
        return "头等舱";
      case FlightCabinType.SeniorY:
        return "高端经济舱";
      case FlightCabinType.DiscountC:
        return "折扣公务舱";
      case FlightCabinType.DiscountF:
        return "折扣头等舱";
      case FlightCabinType.SuperF:
        return "超级头等舱";
      default: return value;
    }
  }

}
