import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ModalController, PopoverController } from "@ionic/angular";
import { TicketchangingComponent } from "../ticketchanging/ticketchanging.component";
import { FlightPolicy } from "../../models/PassengerFlightInfo";
import { FlightFareType } from "../../models/flight/FlightFareType";

@Component({
  selector: "app-select-flightsegment-cabin",
  templateUrl: "./select-flightsegment-cabin.component.html",
  styleUrls: ["./select-flightsegment-cabin.component.scss"]
})
export class SelectFlightsegmentCabinComponent implements OnInit {
  @Input() policiedCabins: FlightPolicy[];
  @Input() flightSegment: FlightSegmentEntity;
  @Output() selectcabin: EventEmitter<any>;
  @Input() isAgent = false;
  FlightFareType = FlightFareType;
  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {
    this.selectcabin = new EventEmitter();
  }
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.modalCtrl.getTop().then(m => {
      if (m) {
        m.dismiss();
      }
    });
  }
  bookColor(cabin: any) {
    if (cabin && cabin.Rules) {
      if (cabin.Rules.length) {
        if (!cabin.IsAllowBook) {
          return "danger";
        }
        return "warning";
      }
    }
    return "success";
  }
  ngOnInit() {}
  async openrules(cabin: any) {
    const m = await this.popoverCtrl.create({
      component: TicketchangingComponent,
      componentProps: { cabin: cabin },
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
