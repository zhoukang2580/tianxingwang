import { OrderStatusType } from "./../models/OrderEntity";
import { Pipe, PipeTransform } from "@angular/core";
import { LanguageHelper } from 'src/app/languageHelper';

@Pipe({
  name: "orderstatus"
})
export class OrderstatusPipe implements PipeTransform {
  transform(value: OrderStatusType, args?: any): any {
    switch (value) {
      default:
        return value;
        case OrderStatusType.Cancel:return LanguageHelper.Order.getStatusCancelTypeTip();
        case OrderStatusType.Finish:return LanguageHelper.Order.getStatusFinishTypeTip();
        case OrderStatusType.WaitDelivery:return LanguageHelper.Order.getStatusWaitDeliveryTypeTip();
        case OrderStatusType.WaitHandle:return LanguageHelper.Order.getStatusWaitHandleTypeTip();
        case OrderStatusType.WaitPay:return LanguageHelper.Order.getStatusWaitPayTypeTip();
        case OrderStatusType.WaitSign:return LanguageHelper.Order.getStatusWaitSignTypeTip();
    }
  }
}
