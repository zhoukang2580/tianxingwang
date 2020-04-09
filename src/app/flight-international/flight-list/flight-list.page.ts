import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import {
  InternationalFlightService,
  IFilterCondition,
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
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  private pageSize = 12;
  condition: IFilterCondition;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  dialogShow: Iisblue[];
  flightRoutes: FlightRouteEntity[];
  constructor(
    private flightService: InternationalFlightService,
    public modalController: ModalController,
    public popoverController: PopoverController
  ) {}
  private scrollToTop() {
    this.content.scrollToTop();
  }
  ngOnInit() {
    this.doRefresh(environment.production);
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.flightService.getFilterConditionSource().subscribe((c) => {
        this.condition = c;
      })
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  doRefresh(loadFromServer = false) {
    this.flightRoutes = [];
    this.scroller.disabled = true;
    this.subscription.unsubscribe();
    this.subscription = this.flightService
      .getFlightList(loadFromServer)
      .pipe(
        finalize(() => {
          this.refresher.complete();
        })
      )
      .subscribe((res) => {
        console.log("list data", res.Data);
        this.flightQuery = res.Data;
        if (this.flightQuery && this.flightQuery.FlightRoutes) {
          this.flightRoutes = this.flightQuery.FlightRoutes.slice(
            0,
            this.pageSize
          );
          this.scroller.disabled = this.flightRoutes.length < this.pageSize;
        }
        this.scrollToTop();
      });
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
      this.doRefresh();
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
