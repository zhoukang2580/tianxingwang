import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { InternationalFlightService } from "../international-flight.service";
import { RefresherComponent } from "src/app/components/refresher";
import { finalize } from "rxjs/operators";
import { Subscription } from "rxjs";
import { ModalController } from '@ionic/angular';

@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list.page.html",
  styleUrls: ["./flight-list.page.scss"]
})
export class FlightListPage implements OnInit, OnDestroy {
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  FlightQuery;
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
        this.FlightQuery=res.Data;
      });
  }
}
