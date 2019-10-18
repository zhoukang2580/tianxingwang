import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { OrderModel } from './../../order/models/OrderModel';
import { ApiService } from './../../services/api/api.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';

@Component({
  selector: 'app-trip',
  templateUrl: 'trip.page.html',
  styleUrls: ['trip.page.scss']
})
export class TripPage implements OnInit {
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  trips: OrderTripModel[];
  private searchCondition: OrderModel = {
    PageIndex: 0,
  } as OrderModel;
  isLoading = false;
  loadMoreSubscription = Subscription.EMPTY;
  constructor(private apiservice: ApiService) { }
  private getTrips() {
    this.loadMoreSubscription.unsubscribe();
    this.isLoading = true;
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Travel-List`;
    req.Data = this.searchCondition;
    return this.apiservice.getResponse<OrderModel>(req).pipe(finalize(() => {
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
    this.loadMoreSubscription = this.getTrips().subscribe(res => {
      if (res && res.Data && res.Data.OrderTrips) {
        const trips = res.Data.OrderTrips;
        this.trips = this.trips.concat(trips)
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = trips.length == 0;
          this.infiniteScroll.complete();
        }
        if (this.ionRefresher) {
          this.ionRefresher.complete();
        }
      }
    })
  }
}
