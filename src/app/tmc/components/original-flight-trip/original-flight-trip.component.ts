import { OrderFlightTicketEntity } from "./../../../order/models/OrderFlightTicketEntity";
import { PopoverController } from "@ionic/angular";
import { OrderFlightTripEntity } from "./../../../order/models/OrderFlightTripEntity";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";

@Component({
  selector: "app-original-flight-trip",
  templateUrl: "./original-flight-trip.component.html",
  styleUrls: ["./original-flight-trip.component.scss"]
})
export class OriginalFlightTripComponent implements OnInit, OnChanges {
  @Input() trip: OrderFlightTripEntity;
  @Input() tripDesc: string;
  @Input() ticket: OrderFlightTicketEntity;
  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}
  ngOnChanges(change: SimpleChanges) {
    if (change && change.ticket && change.ticket.currentValue) {
    }
  }
  openRulesPopover() {}
}
