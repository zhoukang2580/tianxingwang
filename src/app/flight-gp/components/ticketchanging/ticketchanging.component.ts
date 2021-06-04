import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { Routes } from "../../models/flightgp/Routes";
import { FlightPolicy } from "../../models/PassengerFlightInfo";

@Component({
  selector: "app-ticketchanging-comp",
  templateUrl: "./ticketchanging.component.html",
  styleUrls: ["./ticketchanging.component.scss"],
})
export class TicketchangingComponent implements OnInit {
  cabin: FlightPolicy;
  Routes:any;
  explain: string;
  explains: string;
  VariablesJsonObj: any;
  constructor(private popoverCtrl: PopoverController) {}
  async cancel() {
    const m = await this.popoverCtrl.getTop();
    m.dismiss();
  }
  ngOnInit() {
    
    if (this.cabin && this.cabin.Cabin && this.cabin.Cabin.Variables.Change && this.cabin.Cabin.Variables.Refund) {
      this.explain = this.cabin.Cabin.Variables.Change.replace(/\\n/g, "<br/>");
      this.explains = this.cabin.Cabin.Variables.Refund.replace(/\\n/g, "<br/>");
      console.log(this.cabin.Cabin.Variables);
    }

    if(this.Routes && this.Routes.Change && this.Routes.Refund){
      console.log(this.Routes);
      this.explain = this.Routes.Change.replace(/\\n/g, "<br/>");
      this.explains = this.Routes.Refund.replace(/\\n/g, "<br/>");
    }
  }
}
