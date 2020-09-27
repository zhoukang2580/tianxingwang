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
  Optional,
} from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { OrderInsuranceType } from "src/app/insurance/models/OrderInsuranceType";
import { OrderInsuranceStatusType } from "src/app/order/models/OrderInsuranceStatusType";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { environment } from "src/environments/environment";
import { TravelModel } from "src/app/order/models/TravelModel";
import { RefresherComponent } from "src/app/components/refresher";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { OrderFlightTicketType } from 'src/app/order/models/OrderFlightTicketType';
@Component({
  selector: "app-trip",
  templateUrl: "trip.page.html",
  styleUrls: ["trip.page.scss"],
})
export class TripPage implements OnInit, OnDestroy {
  private loadMoreSubscription = Subscription.EMPTY;
  private searchCondition: TravelModel = {
    PageIndex: 0,
    PageSize: 15,
    LastTime: null,
  } as TravelModel;
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
  private subscriptions: Subscription[] = [];
  OrderFlightTicketType = OrderFlightTicketType;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll)
  infiniteScroll: IonInfiniteScroll;
  trips: OrderTripModel[];
  isLoading = false;
  isShowInsurance = true || environment.mockProBuild;
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
    this.isLoading = !this.searchCondition.LastTime;
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Travel-List`;
    this.searchCondition.PageIndex = 1;
    req.Data = this.searchCondition;
    // return of({ Status: true, Data: MockTripData } as any);
    return this.apiservice.getResponse<TravelModel>(req).pipe(
      map((r) => {
        if (r.Data) {
          this.searchCondition.LastFlightId = r.Data.LastFlightId;
          this.searchCondition.LastHotelId = r.Data.LastHotelId;
          this.searchCondition.LastTrainId = r.Data.LastTrainId;
          this.searchCondition.LastTime = r.Data.LastTime;
          if (r.Data.Trips) {
            r.Data.Trips = r.Data.Trips.map((trip) => {
              if (!trip.InsuranceResult) {
                trip.InsuranceResult = r.Data.InsuranceResult;
              }
              return trip;
            });
          }
        }
        return r;
      }),
      finalize(() => {
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
        this.isLoading = false;
      })
    );
  }
  ngOnDestroy() {
    console.log("ondestroy trip page");
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit() {
    if (this.tabs) {
      this.tabs.tabChangeHooks = () => {
        this.isLoading = false;
        this.loadMoreSubscription.unsubscribe();
      };
    }
    const sub0 = this.router.events
      .pipe(filter((it) => it instanceof NavigationStart))
      .subscribe((_) => {
        this.loadMoreSubscription.unsubscribe();
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      });
    const sub = this.route.queryParamMap.subscribe((_) => {
      setTimeout(() => {
        if(!this.trips||!this.trips.length){
          this.doRefresh();
        }
      }, 200);
    });
    this.subscriptions.push(sub0);
    this.subscriptions.push(sub);
  }
  doRefresh() {
    this.loadMoreSubscription
      .add(() => {
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      })
      .unsubscribe();
    this.searchCondition.PageIndex = 1;
    this.searchCondition.PageSize = 10;
    this.searchCondition.LastTime = null;
    this.trips = [];
    if (this.refresher) {
      if (this.refresher) {
        this.refresher.complete();
      }
      this.refresher.disabled = true;
      setTimeout(() => {
        this.refresher.disabled = false;
      }, 100);
    }
    this.loadMoreTrips();
  }
  loadMoreTrips() {
    this.loadMoreSubscription = this.getTrips()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        })
      )
      .subscribe((res) => {
        const trips = (res && res.Data && res.Data.Trips) || [];
        if (trips.length) {
          this.trips = this.trips.concat(trips).map((trip) => {
            trip = this.getVariablesJsonObj(trip);
            return trip;
          });
        }
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled =
            trips.length < this.searchCondition.PageSize;
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
        insurance: d.p,
      },
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
    const tag =
      trip.Type == "Flight"
        ? "flight"
        : trip.Type == "Train"
        ? "train"
        : trip.Type == "Hotel"
        ? "hotel"
        : trip.Type == "Car"
        ? "car"
        : "";
    if (tag) {
      this.router.navigate([AppHelper.getRoutePath(`order-${tag}-detail`)], {
        queryParams: { orderId: trip.OrderId },
      });
    }
  }
  private getVariablesJsonObj(trip: OrderTripModel) {
    if (!trip) {
      return trip;
    }
    trip.VariablesJsonObj = trip.VariablesJsonObj || JSON.parse(trip.Variables);
    return trip;
  }
}
