import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { FlightPolicy } from "../../models/PassengerFlightInfo";

@Component({
  selector: "app-ticketchanging-comp",
  templateUrl: "./ticketchanging.component.html",
  styleUrls: ["./ticketchanging.component.scss"],
})
export class TicketchangingComponent implements OnInit {
  cabin: FlightPolicy;
  explain: string;
  constructor(private popoverCtrl: PopoverController) {}
  async cancel() {
    const m = await this.popoverCtrl.getTop();
    m.dismiss();
  }
  ngOnInit() {
    if (this.cabin && this.cabin.Cabin && this.cabin.Cabin.Explain) {
      this.explain = this.cabin.Cabin.Explain.replace(/\\n/g, "<br/>");
    }
  }
}
