import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { CabinTypeEnum } from '../models/flight/CabinTypeEnum';

@Injectable({providedIn:'root'})
@Pipe({
  name: 'cabintype'
})
export class CabintypePipe implements PipeTransform {

  transform(value: number, args?: any): any {
    switch (value) {
      case CabinTypeEnum.Y:
        return "经济舱";
      case CabinTypeEnum.C:
        return "公务舱";
      case CabinTypeEnum.F:
        return "头等舱";
      case CabinTypeEnum.SeniorY:
        return "高端经济舱";
      case CabinTypeEnum.DiscountC:
        return "折扣公务舱";
      case CabinTypeEnum.DiscountF:
        return "折扣头等舱";
      case CabinTypeEnum.SuperF:
        return "超级头等舱";
      default: return value;
    }
    return null;
  }

}
