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
import { Router, ActivatedRoute } from "@angular/router";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";
import { RefundChangeDetailComponent } from "../components/refund-change-detail/refund-change-detail.component";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { FlightFareRuleEntity } from "src/app/flight/models/FlightFareRuleEntity";
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
  private pageSize = 8;
  private farePageSize = 15;
  private reqAnimate: any;
  isLastTrip = false;
  isLoading = false;
  multipassShow = false;
  searchModel: IInternationalFlightSearchModel;
  condition: IFilterCondition;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(BackButtonComponent, { static: true })
  backbtn: BackButtonComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  dialogShow: Iisblue[];
  flightRoutes: FlightRouteEntity[];
  curTrip: ITripInfo;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private flightService: InternationalFlightService,
    public modalController: ModalController,
    public popoverController: PopoverController
  ) { }
  private scrollToTop() {
    this.content.scrollToTop();
  }
  back() {
    if (
      this.searchModel &&
      this.searchModel.trips &&
      this.searchModel.trips.some((it) => !!it.bookInfo)
    ) {
      this.clearLastTrip();
      if (
        this.searchModel.trips[this.searchModel.trips.length - 1].bookInfo ==
        null
      ) {
        this.onReselectTrip(this.searchModel.trips[0]);
      }
      this.doRefresh();
      return;
    }

    this.backbtn.popToPrePage();
  }
  private clearLastTrip() {
    const last = this.searchModel.trips[this.searchModel.trips.length - 1];
    if (last && last.bookInfo) {
      last.bookInfo = null;
    }
  }
  private checkIsLastTrip(trip?: ITripInfo) {
    if (!trip) {
      trip =
        this.searchModel &&
        this.searchModel.trips &&
        this.searchModel.trips.find((it) => !it.bookInfo);
    }
    const isLastTrip =
      this.searchModel &&
      this.searchModel.trips &&
      this.searchModel.trips.findIndex((it) => it == trip) ==
      this.searchModel.trips.length - 1;
    return isLastTrip;
  }
  async onBook(flightRoute: FlightRouteEntity, fare?: FlightFareEntity) {
    if (!fare.hasCheckPolicy) {
      if (fare) {
        await this.flightService.checkPolicy(flightRoute, fare);
        let tip = (fare.policy && fare.policy.Message) || "";
        if (fare.policy && !fare.policy.IsAllowOrder) {
          if (tip) {
            tip = `${tip}，不可预订`;
          } else {
            tip = `违规不可预订`;
          }
          AppHelper.alert(tip);
          return;
        }
      } else {
        return;
      }
    }
    if (fare) {
      flightRoute.selectFlightFare = fare;
    }
    const trip = this.searchModel.trips.find((it) => !it.bookInfo);
    trip.bookInfo = {
      fromSegment: flightRoute.fromSegment,
      toSegment: flightRoute.toSegment,
      flightRoute: flightRoute,
      id: AppHelper.uuid(),
    };
    this.flightService.setSearchModelSource(this.searchModel);
    this.router.navigate(["selected-trip-info"], {
      queryParams: { doRefresh: "false", queryParamsHandling: "merge" },
    });
  }
  async onSelectTrip(flightRoute: FlightRouteEntity, fare?: FlightFareEntity) {
    console.log(this.searchModel, "this.searchModel");
    if (this.searchModel && this.searchModel.trips) {
      let trip = this.searchModel.trips.find((it) => !it.bookInfo);
      this.isLastTrip =
        this.searchModel.trips.findIndex((it) => it == trip) ==
        this.searchModel.trips.length - 1;
      if (!trip) {
        trip = this.searchModel.trips[this.searchModel.trips.length - 1];
      }
      if (fare) {
        flightRoute.selectFlightFare = fare;
      }
      trip.bookInfo = {
        fromSegment: flightRoute.fromSegment,
        toSegment: flightRoute.toSegment,
        flightRoute: flightRoute,
        id: AppHelper.uuid(),
      };
      this.flightService.setSearchModelSource(this.searchModel);
      this.doRefresh();
    }
  }
  onShowMoreRuleMessage(flightfare: FlightFareEntity) {
    if (flightfare) {
      flightfare.isShowMoreRuleMessage = !flightfare.isShowMoreRuleMessage;
    }
  }
  onShowRuleExplain(flightfare: FlightFareEntity) {
    if (flightfare) {
      if (!flightfare.refundChangeDetail) {
        this.explainSubscription.unsubscribe();
        this.explainSubscription = this.flightService
          .getRuleInfo(flightfare)
          .subscribe((r) => {
            const data = r && r.Data;
            if (data.FlightFares) {
              flightfare.refundChangeDetail = {
                FlightFares: data.FlightFares,
                FlightFareRules: r.Data.FlightFareRules,
              };
              this.presentRuleExplain(flightfare.refundChangeDetail);
            }
          });
      } else {
        this.presentRuleExplain(flightfare.refundChangeDetail);
      }
    }
  }
  private async presentRuleExplain(data: {
    FlightFareRules: FlightFareRuleEntity[];
    FlightFares: FlightFareEntity[];
  }) {
    const trips = this.searchModel.trips || [];
    const routes = trips
      .map((it) => it.bookInfo && it.bookInfo.flightRoute)
      .filter((r) => !!r);
    if (this.flightRoutes) {
      this.flightRoutes.forEach((r) => {
        if (!routes.find((it) => it.Id == r.Id)) {
          routes.push(r);
        }
      });
    }
    if (data) {
      if (!data.FlightFareRules || !data.FlightFareRules.length) {
        data.FlightFareRules = [];
        data.FlightFares.forEach((ff) => {
          if (ff.FlightFareRules && ff.FlightFareRules.length) {
            data.FlightFareRules = data.FlightFareRules.concat(
              ff.FlightFareRules
            );
          }
        });
      }
    }
    const m = await this.modalController.create({
      component: RefundChangeDetailComponent,
      // cssClass: "flight-refund-comp",
      componentProps: {
        airports: routes
          .map((it) => `${it.Origin}-${it.Destination}`)
          .concat(
            this.flightRoutes.map((it) => `${it.Destination}-${it.Origin}`)
          ),
        data,
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
      this.route.queryParamMap.subscribe((q) => {
        const fromRoute = q.get("fromRoute");
        if (
          this.searchModel &&
          this.searchModel.trips &&
          this.searchModel.trips.some((t) => !!t.bookInfo)
        ) {
          this.clearLastTrip();
          this.doRefresh();
        } else {
          if (!this.flightRoutes || !this.flightRoutes.length) {
            this.doRefresh(true);
          }
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
      }
      this.scrollToTop();
      this.isLastTrip = this.checkIsLastTrip();
    } catch (e) {
      console.error(e);
      AppHelper.alert(e);
    }
  }
  onToggleFlightFare(fr: FlightRouteEntity) {
    if (this.reqAnimate) {
      window.cancelAnimationFrame(this.reqAnimate);
    }
    if (fr) {
      if (fr.isShowFares) {
        fr.isShowFares = false;
        fr.vmFares = [];
        return;
      }
      this.flightRoutes.forEach(r => {
        r.isShowFares = r == fr;
      })
      const r = this.flightRoutes.find(it => it.isShowFares);
      if (r && r.isShowFares) {
        r.vmFares = [];
        const loop = () => {
          const arr = fr.flightFares.slice(fr.vmFares.length, this.farePageSize + fr.vmFares.length);
          if (arr.length) {
            r.vmFares = r.vmFares.concat(arr);
            this.reqAnimate = requestAnimationFrame(() => {
              loop();
            })
          }
        }
        loop();
      }
    }
  }
  
  loadMore() {
    // this.loadOpenedFlightRouteFares();
    if (this.flightQuery && this.flightQuery.FlightRoutes) {
      const arr = this.flightQuery.FlightRoutes.slice(
        this.flightRoutes.length,
        this.pageSize + this.flightRoutes.length
      );
      if (arr.length) {
        arr.forEach(it=>{
          if(it.flightFares&&it.flightFares.length<this.farePageSize){
            it.isShowFares=true;
            it.vmFares=it.flightFares;
          }
        })
        this.flightRoutes = this.flightRoutes.concat(arr);
        
      }
      this.scroller.disabled = arr.length < this.pageSize;
      this.scroller.complete();
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
          (a.minPriceFlightFare &&
            b.minPriceFlightFare &&
            +a.minPriceFlightFare.TicketPrice -
            +b.minPriceFlightFare.TicketPrice) ||
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
