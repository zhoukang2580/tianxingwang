import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { OrderFlightTicketEntity } from "../../models/OrderFlightTicketEntity";

@Component({
  selector: "app-select-ticket-popover",
  templateUrl: "./select-ticket-popover.component.html",
  styleUrls: ["./select-ticket-popover.component.scss"]
})
export class SelectTicketPopoverComponent implements OnInit {
  tickets: OrderFlightTicketEntity[];
  selectedTicket: OrderFlightTicketEntity;
  constructor(private popoverCtrl: PopoverController) {}
  onSelect(ticket: OrderFlightTicketEntity) {
    this.selectedTicket = ticket;
    this.cancel();
  }
  private cancel() {
    this.popoverCtrl
      .getTop()
      .then(p => p.dismiss(this.selectedTicket))
      .catch(_ => 0);
  }
  ngOnInit() {}
}
