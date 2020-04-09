import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { InternationalFlightService } from "../international-flight.service";
import { RefresherComponent } from "src/app/components/refresher";
import { finalize } from "rxjs/operators";
import { Subscription } from "rxjs";
import { ModalController, PopoverController } from "@ionic/angular";
import { FlightDialogComponent } from "../components/flight-dialog/flight-dialog.component";
import { FlightListItemComponent } from "../components/flight-list-item/flight-list-item.component";
import { FlightResultEntity } from "src/app/flight/models/FlightResultEntity";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { FlightTransferComponent } from "../components/flight-transfer/flight-transfer.component";
import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';
interface Iisblue {
  isshow: false;
}
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"],
})
export class FlightListPage implements OnInit, OnDestroy {
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  flightQuery: FlightResultEntity;
  dialogShow: Iisblue[];
  private subscription = Subscription.EMPTY;
  constructor(
    private flightService: InternationalFlightService,
    public modalController: ModalController,
    public popoverController: PopoverController,
  ) {}

  ngOnInit() {
    this.doRefresh();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  doRefresh(loadFromServer = false) {
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
      });
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: FlightDialogComponent,
    });
    return await modal.present();
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
