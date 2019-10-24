import { LanguageHelper } from 'src/app/languageHelper';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from './../../../services/identity/identity.entity';
import { OrderEntity, OrderItemEntity, OrderStatusType } from './../../models/OrderEntity';
import { Component, OnInit, Input } from '@angular/core';
import { OrderInsuranceEntity, OrderPayEntity, OrderPayStatusType } from '../../models/OrderInsuranceEntity';
import { AppHelper } from 'src/app/appHelper';
import { OrderInsuranceStatusType } from '../../models/OrderInsuranceStatusType';
import { OrderItemHelper } from 'src/app/flight/models/flight/OrderItemHelper';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-insurance-order-detail',
  templateUrl: './insurance-order-detail.component.html',
  styleUrls: ['./insurance-order-detail.component.scss'],
})
export class InsuranceOrderDetailComponent implements OnInit {
  private identity: IdentityEntity;
  OrderInsuranceStatusType = OrderInsuranceStatusType;
  OrderItemHelper = OrderItemHelper;
  @Input() order: OrderEntity;
  isAgent = of(false);
  constructor(private identityService: IdentityService) { 
    this.isAgent=identityService.getIdentitySource().pipe(map(id=>id&&id.Numbers&&id.Numbers['AgentId']));
  }

  async ngOnInit() {
    this.identity = await this.identityService.getIdentityAsync().catch(_ => null);
  }
  getOrderPayCostsAmount(key: string) {
    return this.order
      && this.order.OrderPayCosts
      && this.order.OrderPayCosts
        .filter(it => it.Key == key && it.Status == OrderPayStatusType.Effective)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
  }
  getOrderPaysAmount(key: string) {
    return this.order
      && this.order.OrderPays
      && this.order.OrderPays
        .filter(it => it.Key == key && it.Status == OrderPayStatusType.Effective)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
  }
  getOrderItemsSum(Tag: string, name: string = "Amount") {
    return this.order
      && this.order.OrderItems
      && this.order.OrderItems
        .filter(it => Tag ? it.Tag == Tag : true)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it[name])), 0);
  }
  getInsuranceInfos(orderInsurance: OrderInsuranceEntity) {
    const orderItems = this.getOrderItems(orderInsurance.Key);
    const orderPays = this.GetOrderPays(orderInsurance.Key);
    const orderPassenger = this.order
      && this.order.OrderPassengers
      && this.order.OrderPassengers.find(it => (orderInsurance.Passenger && orderInsurance.Passenger.Id) == it.Id)
    return {
      orderItems,
      orderPassenger,
      orderPays
    }
  }
  async canelInsurance() {
    const ok = await AppHelper.alert("确定取消投保吗", true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
    if (ok) {

    }
  }
  getOrderTravelsValues(key: string, name: string) {
    return this.order
      && this.order.OrderTravels
      && this.order.OrderTravels
        .filter(it => it.Key == key)
        .map(it => it[name])
        .join(",");
  }
  get isorderlocker() {
    // 大订单是否被锁
    let isOrderlocker = this.order
      && this.order.OrderLockers
      && this.order.OrderLockers
        .filter(it => it.Order.Id == this.order.Id
          && it.Key == ""
          && (it.Account && it.Account.Id) != (this.identity && this.identity.Id)).length > 0;
    isOrderlocker = isOrderlocker || this.order.Status == OrderStatusType.Cancel;
    return isOrderlocker;
  }
  GetVariable(orderInsurance: OrderInsuranceEntity, key: string) {
    orderInsurance.VariablesJsonObj = orderInsurance.VariablesJsonObj || JSON.parse(orderInsurance.Variables) || {};
    return orderInsurance && orderInsurance.VariablesJsonObj[key];
  }
  private GetOrderPays(key: string): OrderPayEntity[] {
    return this.order
      && this.order.OrderPays
      && this.order.OrderPays.filter(it => it.Key == key);
  }
  private getOrderItems(key: string): OrderItemEntity[] {
    return this.order
      && this.order.OrderItems
      && this.order.OrderItems.filter(it => it.Key == key);
  }
  private getOrderItemAmount(key: string, tag = "") {
    const amount = this.order
      && this.order.OrderItems
      && this.order.OrderItems
        .filter(it => it.Key == key && (!tag || it.Tag == tag)).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    return amount;
  }
  private getOrderPayedAmountByKey(key: string) {
    const amount = this.order
      && this.order.OrderPays
      && this.order.OrderPays
        .filter(it => it.Key == key).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    return amount;
  }
}
