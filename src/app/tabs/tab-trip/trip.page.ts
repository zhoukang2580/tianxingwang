import { Platform } from '@ionic/angular';
import { TmcService } from 'src/app/tmc/tmc.service';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { OrderEntity } from 'src/app/order/models/OrderEntity';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { InsuranceProductEntity } from 'src/app/insurance/models/InsuranceProductEntity';
import { CalendarService } from './../../tmc/calendar.service';
import { finalize, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { OrderModel } from './../../order/models/OrderModel';
import { ApiService } from './../../services/api/api.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';
import { OrderInsuranceType } from 'src/app/insurance/models/OrderInsuranceType';
import { OrderInsuranceStatusType } from 'src/app/order/models/OrderInsuranceStatusType';
import { OrderTravelPayType } from 'src/app/order/models/OrderTravelEntity';
import { TravelModel } from 'src/app/order/models/TravelModel';
import { ORDER_TABS } from 'src/app/order/product-tabs/product-tabs.page';
import { ProductItemType } from 'src/app/tmc/models/ProductItems';
@Component({
  selector: 'app-trip',
  templateUrl: 'trip.page.html',
  styleUrls: ['trip.page.scss']
})
export class TripPage implements OnInit {
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  trips: OrderTripModel[];
  private searchCondition: TravelModel = {
    PageIndex: 0,
    PageSize: 15
  } as TravelModel;
  isLoading = false;
  loadMoreSubscription = Subscription.EMPTY;
  selectedInsurance: InsuranceProductEntity;
  selectedInsuranceTrip: OrderTripModel;
  constructor(
    private tmcService: TmcService,
    private apiservice: ApiService,
    private calendarService: CalendarService,
    private plt:Platform,
    private router: Router) { }
  private getTrips() {
    this.loadMoreSubscription.unsubscribe();
    this.isLoading = this.searchCondition.PageIndex == 0;
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Travel-List`;
    req.Data = this.searchCondition;
    return this.apiservice.getResponse<TravelModel>(req).pipe(map(r => {
      if (r.Data && r.Data.Trips) {
        r.Data.Trips = r.Data.Trips.map(trip => {
          if (!trip.InsuranceResult) {
            trip.InsuranceResult = r.Data.InsuranceResult;
          }
          return trip;
        })
      }
      return r;
    }), finalize(() => {
      this.isLoading = false;
    }));
  }
  ngOnInit() {
    this.doRefresh();
  }
  doRefresh() {
    this.searchCondition.PageIndex = 0;
    this.trips = [];
    if (this.ionRefresher) {
      this.ionRefresher.disabled = true;
      setTimeout(() => {
        this.ionRefresher.disabled = false;
      }, 100);
    }
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.loadMoreTrips();
  }
  loadMoreTrips() {
    this.loadMoreSubscription = this.getTrips()
      .pipe(finalize(() => {
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
        if (this.ionRefresher) {
          this.ionRefresher.complete();
        }
      })).subscribe(res => {
        const trips = res && res.Data && res.Data.Trips || [];
        if (trips.length) {
          this.trips = this.trips.concat(trips)
          this.searchCondition.PageIndex++;
        }
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = trips.length == 0;
        }
      })
  }
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
  getTrainProducts(orderTrip: OrderTripModel, ) {
    const types = [OrderInsuranceType.TrainAccident];
    if (!orderTrip || !orderTrip.InsuranceResult) {
      return [];
    }
    return orderTrip.InsuranceResult.Products.filter(it => types.some(t => t == it.InsuranceType));
  }
  goToDetailPage(trip: OrderTripModel) {
    if (!trip) {
      return;
    }
    const plane = ORDER_TABS.find(it => it.value == ProductItemType.plane);
    const train = ORDER_TABS.find(it => it.value == ProductItemType.train);
    const hotel = ORDER_TABS.find(it => it.value == ProductItemType.hotel);
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(trip.Type == "Flight" ? plane : trip.Type == "Train" ? train : hotel),
        orderId: trip.OrderId
      }
    });
  }
  async bookInsurance(trip?: OrderTripModel, evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    trip = trip || this.selectedInsuranceTrip;
    if (!this.selectedInsurance || !trip) {
      return;
    }
    let channel = "客户H5";
    if(AppHelper.isApp()){
      if(this.plt.is("android")){
        channel="android";
      }else if(this.plt.is("ios")){
        channel="ios";
      }
    }
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Insurance-Book`;
    req.Data = {
      key: trip.AdditionKey,
      travelkey: trip.Key,
      OrderId: trip.OrderId,
      Product: JSON.stringify(this.selectedInsurance),
      PassagerId: trip.PassengerId,
      Channel:channel
    };
    req.IsShowLoading = true;
    const order: { TradeNo: string; Key: string; } = await this.apiservice.getPromiseData<any>(req).catch(_ => {
      AppHelper.alert(_.Message || _);
      return null;
    });
    if (order) {
      await this.payInsurance(order.Key, order.TradeNo);
    }
  }
}
