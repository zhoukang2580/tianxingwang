import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { InternationalFlightService } from "../international-flight.service";
import { RefresherComponent } from "src/app/components/refresher";
import { finalize } from "rxjs/operators";
import { Subscription } from "rxjs";
import { ModalController } from '@ionic/angular';
import { FlightDialogComponent } from '../components/flight-dialog/flight-dialog.component';

@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"]
})
export class FlightListPage implements OnInit, OnDestroy {
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  flightQuery;
  dialogShow;
  private subscription = Subscription.EMPTY;
  constructor(
    private flightService: InternationalFlightService,
    public modalController: ModalController
    ) {}

  ngOnInit() {
    this.doRefresh();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  doRefresh() {
   this.subscription= this.flightService
      .getFlightList()
      .pipe(
        finalize(() => {
          this.refresher.complete();
        })
      )
      .subscribe(res => {
        console.log("list data", res.Data);
          this.flightQuery=res.Data;
      });
  }
  async presentModal() {
    this.dialogShow=!this.dialogShow;
    const modal = await this.modalController.create({
      component: FlightDialogComponent
    });
    return await modal.present();
  }
}
