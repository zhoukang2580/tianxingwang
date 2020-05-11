import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import {
  InternationalFlightService,
  IFilterCondition,
  ITripInfo,
  IInternationalFlightSearchModel,
  FlightVoyageType,
} from "../international-flight.service";
import { RefresherComponent } from "src/app/components/refresher";
import { finalize } from "rxjs/operators";
import { Subscription } from "rxjs";
import {
  ModalController,
  PopoverController,
  IonInfiniteScroll,
  IonContent,
} from "@ionic/angular";
import { FlightDialogComponent } from "../components/flight-dialog/flight-dialog.component";
import { FlightResultEntity } from "src/app/flight/models/FlightResultEntity";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { FlightTransferComponent } from "../components/flight-transfer/flight-transfer.component";
import { environment } from "src/environments/environment";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";
import { RefundChangeDetailComponent } from "../components/refund-change-detail/refund-change-detail.component";
interface Iisblue {
  isshow: false;
}
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"],
})
export class FlightListPage implements OnInit, OnDestroy {
  private flightQuery: FlightResultEntity;
  private subscriptions: Subscription[] = [];
  private explainSubscription = Subscription.EMPTY;
  private pageSize = 12;
  isLastTrip = false;
  isLoading = false;
  multipassShow = false;
  searchModel: IInternationalFlightSearchModel;
  condition: IFilterCondition;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  dialogShow: Iisblue[];
  flightRoutes: FlightRouteEntity[];
  curTrip: ITripInfo;
  constructor(
    private router: Router,
    private flightService: InternationalFlightService,
    public modalController: ModalController,
    public popoverController: PopoverController
  ) {}
  private scrollToTop() {
    this.content.scrollToTop();
  }
  async onSelectTrip(flightRoute: FlightRouteEntity) {
    console.log(this.searchModel, "this.searchModel");
    if (this.searchModel && this.searchModel.trips) {
      let trip = this.searchModel.trips.find((it) => !it.bookInfo);
      const isCheckPolicy =
        this.searchModel.trips.findIndex((it) => it == trip) ==
        this.searchModel.trips.length - 1;
      this.isLastTrip = isCheckPolicy;
      if (isCheckPolicy) {
        if (flightRoute.policy && !flightRoute.policy.IsAllowOrder) {
          AppHelper.alert(flightRoute.policy.Message || "不可预订");
          return;
        }
      }
      if (!trip) {
        trip = this.searchModel.trips[this.searchModel.trips.length - 1];
      }
      trip.bookInfo = {
        flightPolicy: null,
        fromSegment: flightRoute.fromSegment,
        toSegment: flightRoute.toSegment,
        flightRoute: flightRoute,
        id: AppHelper.uuid(),
      };
      this.flightService.setSearchModelSource(this.searchModel);
      trip = this.searchModel.trips.find((it) => !it.bookInfo);
      if (!trip) {
        this.router.navigate(["selected-trip-info"]);
        return;
      }
      this.doRefresh();
    }
  }
  onShowRuleExplain(flightRoute: FlightRouteEntity) {
    if (flightRoute && flightRoute.flightFare) {
      if (!flightRoute.refundChangeDetail) {
        this.explainSubscription.unsubscribe();
        this.explainSubscription = this.flightService
          .getRuleInfo(flightRoute.flightFare)
          .subscribe((r) => {
            const data = r && r.Data;
            if (data.FlightFares) {
              flightRoute.refundChangeDetail = data.FlightFares;
              this.presentRuleExplain(flightRoute.refundChangeDetail);
            }
          });
      } else {
        this.presentRuleExplain(flightRoute.refundChangeDetail);
      }
    }
  }
  private async presentRuleExplain(flightfares: FlightFareEntity[]) {
    const m = await this.modalController.create({
      component: RefundChangeDetailComponent,
      // cssClass: "flight-refund-comp",
      componentProps: {
        flightfares,
      },
    });
    m.present();
  }
  onReselectTrip(trip: ITripInfo) {
    if (this.searchModel && this.searchModel.trips && trip) {
      const index = this.searchModel.trips.findIndex((it) => it.id == trip.id);
      this.searchModel.trips = this.searchModel.trips.map((it, idx) => {
        if (idx >= index) {
          it.bookInfo = null;
        }
        return it;
      });
      this.flightService.setSearchModelSource(this.searchModel);
      this.doRefresh();
    }
  }
  ngOnInit() {
    this.subscriptions.push(this.explainSubscription);
    this.doRefresh(environment.production);
    this.subscriptions.push(
      this.flightService.getSearchModelSource().subscribe((s) => {
        this.searchModel = s;
        if (s && s.trips) {
          this.curTrip = s.trips.find((it) => !it.bookInfo);
          const isCheckPolicy =
            this.searchModel.trips.findIndex((it) => it == this.curTrip) ==
            this.searchModel.trips.length - 1;
          this.isLastTrip = isCheckPolicy;
          if (!this.curTrip) {
            this.curTrip = s.trips[s.trips.length - 1];
          }
          this.curTrip.idx = s.trips.findIndex(
            (it) => it.id == this.curTrip.id
          );
        }
        if (s && s.voyageType != FlightVoyageType.OneWay) {
          this.multipassShow = true;
        }
      })
    );
    this.subscriptions.push(
      this.flightService.getFilterConditionSource().subscribe((c) => {
        this.condition = c;
      })
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  async doRefresh(loadFromServer = false, keepFilterCondition = false) {
    try {
      this.flightRoutes = [];
      this.scroller.disabled = true;
      this.flightService.setFilterConditionSource({
        ...this.flightService.getFilterCondition(),
        time: "none",
        price: "none",
      });
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      this.flightQuery = await this.flightService
        .getFlightList({ forceFetch: loadFromServer, keepFilterCondition })
        .finally(() => {
          this.refresher.complete();
          this.isLoading = false;
        });
      console.log("list data", this.flightQuery);
      if (this.flightQuery && this.flightQuery.FlightRoutes) {
        this.flightRoutes = this.flightQuery.FlightRoutes.slice(
          0,
          this.pageSize
        );
        this.scroller.disabled = this.flightRoutes.length < this.pageSize;
      }
      this.scrollToTop();
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  loadMore() {
    if (this.flightQuery && this.flightQuery.FlightRoutes) {
      const arr = this.flightQuery.FlightRoutes.slice(
        this.flightRoutes.length,
        this.pageSize + this.flightRoutes.length
      );
      this.scroller.complete();
      this.scroller.disabled = arr.length < this.pageSize;
      if (arr.length) {
        this.flightRoutes = this.flightRoutes.concat(arr);
      }
    }
  }
  onSortByPrice() {
    const c = this.flightService.getFilterCondition();
    if (c.price == "none") {
      c.price = "asc";
    } else if (c.price == "asc") {
      c.price = "desc";
    } else {
      c.price = "asc";
    }
    c.time = "none";
    this.flightRoutes = [];
    if (this.flightQuery && this.flightQuery.FlightRoutes) {
      this.flightQuery.FlightRoutes.sort((a, b) => {
        const delta =
          (a.flightFare &&
            b.flightFare &&
            +a.flightFare.TicketPrice - +b.flightFare.TicketPrice) ||
          0;
        return c.price == "asc" ? delta : -delta;
      });
    }
    this.flightService.setFilterConditionSource({
      ...c,
    });
    this.scrollToTop();
    this.loadMore();
  }
  onSortByTime() {
    const c = this.flightService.getFilterCondition();
    c.price = "none";
    if (c.time == "none") {
      c.time = "asc";
    } else if (c.time == "asc") {
      c.time = "desc";
    } else {
      c.time = "asc";
    }
    this.flightRoutes = [];
    if (this.flightQuery && this.flightQuery.FlightRoutes) {
      this.flightQuery.FlightRoutes.sort((a, b) => {
        const delta =
          (a.fromSegment &&
            b.fromSegment &&
            +a.fromSegment.TakeoffTimeStamp -
              +b.fromSegment.TakeoffTimeStamp) ||
          0;
        return c.time == "asc" ? delta : -delta;
      });
    }
    this.flightService.setFilterConditionSource({
      ...c,
    });
    this.scrollToTop();
    this.loadMore();
  }
  async presentModal() {
    const c = this.flightService.getFilterCondition();
    c.price = "none";
    c.time = "none";
    this.flightService.setFilterConditionSource({
      ...c,
    });
    const modal = await this.modalController.create({
      component: FlightDialogComponent,
    });
    await modal.present();
    const r = await modal.onDidDismiss();
    if (r && r.data) {
      this.doRefresh(false, true);
    }
  }
  async onTransfer(flight: FlightRouteEntity) {
    const popover = await this.popoverController.create({
      component: FlightTransferComponent,
      translucent: true,
      cssClass: "warranty",
      componentProps: {
        flight,
      },
    });
    return await popover.present();
  }
}
