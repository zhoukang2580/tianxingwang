import { CalendarService } from 'src/app/tmc/calendar.service';
import { TmcService } from 'src/app/tmc/tmc.service';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';
import { Component, OnInit, Input } from '@angular/core';
import { OrderInsuranceType } from 'src/app/insurance/models/OrderInsuranceType';
import { OrderInsuranceStatusType } from '../../models/OrderInsuranceStatusType';
import { InsuranceProductEntity } from 'src/app/insurance/models/InsuranceProductEntity';
import { OrderTravelPayType } from '../../models/OrderTravelEntity';

@Component({
  selector: 'app-my-trip',
  templateUrl: './my-trip.component.html',
  styleUrls: ['./my-trip.component.scss'],
})
export class MyTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  selectedInsuranceTrip: OrderTripModel;
  selectedInsurance: InsuranceProductEntity;
  constructor(private tmcService: TmcService, private calendarService: CalendarService) { }

  ngOnInit() { }
  check(orderTrip: OrderTripModel, type: OrderInsuranceType) {
    const OrderInsurances = orderTrip && orderTrip.OrderInsurances;
    if (!OrderInsurances) { return true; }
    const count = OrderInsurances
      .filter(s => s.InsuranceType == type
        && s.Status != OrderInsuranceStatusType.Abolish
        && s.Status != OrderInsuranceStatusType.Refunded)
      .length;
    if (count > 0) { return false; }
    return true;
  }
  getProducts(orderTrip: OrderTripModel) {
    let products: InsuranceProductEntity[] = [];
    if (!orderTrip) {
      return products;
    }
    const types = [OrderInsuranceType.FlightAccident, OrderInsuranceType.FlightDelay];
    products = orderTrip.InsuranceResult
      && orderTrip.InsuranceResult.Products
      && orderTrip.InsuranceResult.Products
        .filter(it => types.some(t => t == it.InsuranceType)) || [];
    // console.log("get InsuranceProductEntity", products);
    return products;
  }
  onShowSelectedInsurance(p?: InsuranceProductEntity, trip?: OrderTripModel, evt?: CustomEvent) {
    this.selectedInsurance = p;
    this.selectedInsuranceTrip = trip;
    if (evt) {
      evt.stopPropagation();
    }
  }
  getDays(t1: string, t2: string) {
    const diff = this.calendarService.getDiffDays(t1, t2);
    // console.log("getdays", diff)
    return diff;
  }
  getOrderInsurad(orderTrip: OrderTripModel) {
    if (!orderTrip || !orderTrip.OrderInsurances) {
      return;
    }
    return orderTrip.OrderInsurances
      .find(it => it.Status == OrderInsuranceStatusType.Booking && it.TravelPayType == OrderTravelPayType.Person);
  }
  async payInsurance(key: string, tradeNo: string, evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (key && tradeNo) {
      await this.tmcService.payOrder(tradeNo, key);
    }
  }
  getTrainProducts(orderTrip: OrderTripModel ) {
    const types = [OrderInsuranceType.TrainAccident];
    if (!orderTrip || !orderTrip.InsuranceResult) {
      return [];
    }
    return orderTrip.InsuranceResult.Products.filter(it => types.some(t => t == it.InsuranceType));
  }
  // async bookInsurance(trip?: OrderTripModel, evt?: CustomEvent) {
  //   if (evt) {
  //     evt.stopPropagation();
  //   }
  //   trip = trip || this.selectedInsuranceTrip;
  //   if (!this.selectedInsurance || !trip) {
  //     return;
  //   }
  //   let channel = this.tmcService.getChannel();
  //   const req = new RequestEntity();
  //   req.Method = `TmcApiOrderUrl-Insurance-Book`;
  //   req.Data = {
  //     key: trip.AdditionKey,
  //     travelkey: trip.Key,
  //     OrderId: trip.OrderId,
  //     Product: JSON.stringify(this.selectedInsurance),
  //     PassagerId: trip.PassengerId,
  //     Channel: channel
  //   };
  //   req.IsShowLoading = true;
  //   const order: { TradeNo: string; Key: string; } = await this.apiservice.getPromiseData<any>(req).catch(_ => {
  //     AppHelper.alert(_.Message || _);
  //     return null;
  //   });
  //   if (order) {
  //     await this.payInsurance(order.Key, order.TradeNo);
  //   }
  // }
}


