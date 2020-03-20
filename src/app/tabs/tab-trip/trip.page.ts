import { TabsPage } from "./../tabs.page";
import { ActivatedRoute, NavigationStart } from "@angular/router";
import { TripBuyInsuranceComponent } from "./trip-buy-insurance/trip-buy-insurance.component";
import { Platform, ModalController } from "@ionic/angular";
import { TmcService } from "src/app/tmc/tmc.service";
import { Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { OrderEntity } from "src/app/order/models/OrderEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { CalendarService } from "./../../tmc/calendar.service";
import { finalize, map, filter } from "rxjs/operators";
import { Subscription, interval, of } from "rxjs";
import { IonRefresher, IonInfiniteScroll } from "@ionic/angular";
import { OrderModel } from "./../../order/models/OrderModel";
import { ApiService } from "./../../services/api/api.service";
import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  Optional
} from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { OrderInsuranceType } from "src/app/insurance/models/OrderInsuranceType";
import { OrderInsuranceStatusType } from "src/app/order/models/OrderInsuranceStatusType";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { TravelModel } from "src/app/order/models/TravelModel";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { ORDER_TABS } from "src/app/order/product-list/product-list.page";
import { OrderFlightTicketType } from "src/app/order/models/OrderFlightTicketType";
@Component({
  selector: "app-trip",
  templateUrl: "trip.page.html",
  styleUrls: ["trip.page.scss"]
})
export class TripPage implements OnInit, OnDestroy {
  private loadMoreSubscription = Subscription.EMPTY;
  private searchCondition: TravelModel = {
    PageIndex: 0,
    PageSize: 15
  } as TravelModel;
  private subscriptions: Subscription[] = [];
  OrderFlightTicketType = OrderFlightTicketType;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  trips: OrderTripModel[];
  isLoading = false;
  constructor(
    private tmcService: TmcService,
    private apiservice: ApiService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router,
    @Optional() private tabs: TabsPage
  ) {
    console.log(tabs);
  }
  private getTrips() {
    this.loadMoreSubscription.unsubscribe();
    this.isLoading = this.searchCondition.PageIndex == 0;
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Travel-List`;
    req.Data = this.searchCondition;
    // return of({ Status: true, Data: MockTripData } as any);
    return this.apiservice.getResponse<TravelModel>(req).pipe(
      map(r => {
        if (r.Data && r.Data.Trips) {
          r.Data.Trips = r.Data.Trips.map(trip => {
            if (!trip.InsuranceResult) {
              trip.InsuranceResult = r.Data.InsuranceResult;
            }
            return trip;
          });
        }
        return r;
      }),
      finalize(() => {
        if (this.scroller) {
          this.scroller.complete();
        }
        this.isLoading = false;
      })
    );
  }
  ngOnDestroy() {
    console.log("ondestroy trip page");
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    if (this.tabs) {
      this.tabs.tabChangeHooks = () => {
        this.isLoading = false;
        this.scroller.disabled = true;
        this.loadMoreSubscription.unsubscribe();
      };
    }
    const sub0 = this.router.events
      .pipe(filter(it => it instanceof NavigationStart))
      .subscribe(_ => {
        this.loadMoreSubscription.unsubscribe();
        if (this.scroller) {
          this.scroller.disabled = true;
        }
      });
    const sub = this.route.queryParamMap.subscribe(_ => {
      setTimeout(() => {
        this.doRefresh();
      }, 200);
    });
    this.subscriptions.push(sub0);
    this.subscriptions.push(sub);
  }
  doRefresh() {
    this.loadMoreSubscription.unsubscribe();
    this.searchCondition.PageIndex = 0;
    this.searchCondition.PageSize = 10;
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
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.loadMoreTrips();
  }
  loadMoreTrips() {
    this.loadMoreSubscription = this.getTrips()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.scroller) {
            this.scroller.complete();
          }
        })
      )
      .subscribe(res => {
        const trips = (res && res.Data && res.Data.Trips) || [];
        if (trips.length) {
          const arr = this.trips.concat(trips);
          arr.sort(
            (t1, t2) =>
              AppHelper.getDate(t1.StartTime).getTime() -
              AppHelper.getDate(t2.StartTime).getTime()
          );
          this.trips = arr;
          this.searchCondition.PageIndex++;
        }
        if (this.scroller) {
          this.scroller.disabled = trips.length < this.searchCondition.PageSize;
        }
      });
  }
  async onShowSelectedInsurance(d: {
    p: InsuranceProductEntity;
    trip: OrderTripModel;
    evt: CustomEvent;
  }) {
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
  async payInsurance(d: { key: string; tradeNo: string }) {
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
    const car = ORDER_TABS.find(it => it.value == ProductItemType.car);
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(
          trip.Type == "Flight"
            ? plane
            : trip.Type == "Train"
            ? train
            : trip.Type == "Car"
            ? car
            : hotel
        ),
        orderId: trip.OrderId
      }
    });
  }
}
