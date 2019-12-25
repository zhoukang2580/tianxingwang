import { ActivatedRoute } from '@angular/router';
import { TripBuyInsuranceComponent } from './trip-buy-insurance/trip-buy-insurance.component';
import { Platform, ModalController } from '@ionic/angular';
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
  constructor(
    private tmcService: TmcService,
    private apiservice: ApiService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
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
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
      this.isLoading = false;
    }));
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(_ => {
      this.doRefresh();
    })
  }
  doRefresh() {
    this.searchCondition.PageIndex = 0;
    this.trips = [];
    if (this.ionRefresher) {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
      }
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
      })).subscribe(res => {
        const trips = res && res.Data && res.Data.Trips || [];
        if (trips.length) {
          this.trips = this.trips.concat(trips)
          this.searchCondition.PageIndex++;
        }
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = trips.length == 0 || this.searchCondition.PageSize > trips.length;
        }
      })
  }
  async onShowSelectedInsurance(d: { p: InsuranceProductEntity, trip: OrderTripModel, evt: CustomEvent }) {
    if (d.evt) {
      d.evt.stopPropagation();
    }
    if (!d.p || !d.trip) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: TripBuyInsuranceComponent,
      componentProps: {
        trip: d.trip,
        insurance: d.p
      }
    });
    m.present();
    await m.onDidDismiss();
    this.doRefresh();
  }
  async payInsurance(d: { key: string, tradeNo: string }) {
    if (d && d.key && d.tradeNo) {
      await this.tmcService.payOrder(d.tradeNo, d.key);
    }
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

}
