import { Component, OnInit, Input } from "@angular/core";
import {  PopoverController } from "@ionic/angular";
import { FlightCabinEntity } from '../../models/flight/FlightCabinEntity';

@Component({
  selector: "app-ticketchanging-comp",
  templateUrl: "./ticketchanging.component.html",
  styleUrls: ["./ticketchanging.component.scss"]
})
export class TicketchangingComponent implements OnInit {
  cabin: FlightCabinEntity;
  constructor(private popoverCtrl: PopoverController) {}
  async cancel() {
    const m = await this.popoverCtrl.getTop();
    m.dismiss();
  }
  ngOnInit() {}
}
