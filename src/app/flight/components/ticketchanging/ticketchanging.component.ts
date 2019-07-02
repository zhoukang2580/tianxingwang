import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { FlightCabinEntity } from '../../models/flight/FlightCabinEntity';

@Component({
  selector: "app-ticketchanging-comp",
  templateUrl: "./ticketchanging.component.html",
  styleUrls: ["./ticketchanging.component.scss"]
})
export class TicketchangingComponent implements OnInit {
  cabin: FlightCabinEntity;
  constructor(private modalCtrl: ModalController) {}
  async cancel() {
    const m = await this.modalCtrl.getTop();
    m.dismiss();
  }
  ngOnInit() {}
}
