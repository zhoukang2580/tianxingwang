import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { TicketchangingComponent } from "../ticketchanging/ticketchanging.component";
import { FlightPolicy } from '../../models/PassengerFlightInfo';

@Component({
  selector: "app-select-flightsegment-cabin",
  templateUrl: "./select-flightsegment-cabin.component.html",
  styleUrls: ["./select-flightsegment-cabin.component.scss"]
})
export class SelectFlightsegmentCabinComponent implements OnInit {
  @Input() policiedCabins: FlightPolicy[];
  @Input() flightSegment: FlightSegmentEntity;
  @Output() selectcabin: EventEmitter<any>;
  constructor(private modalCtrl: ModalController) {
    this.selectcabin=new EventEmitter();
  }
  bookColor(cabin: any) {
    if (cabin && cabin.Rules) {
      if (cabin.Rules.length) {
        if (!cabin.IsAllowBook) {
          return "danger";
        }
        return "warning";
      }
      return "success";
    }
    return "primary";
  }
  ngOnInit() {}
  async openrules(cabin: any) {
    const m = await this.modalCtrl.create({
      component: TicketchangingComponent,
      componentProps: { cabin: cabin.Cabin },
      showBackdrop: true,
      cssClass: "ticket-changing"
    });
    m.backdropDismiss = false;
    await m.present();
  }
  async onBookTicket(cabin: any) {
    const t = await this.modalCtrl.getTop();
    if (t) {
     this.selectcabin.emit(cabin);
     await t.dismiss(cabin);
    }
  }
}
