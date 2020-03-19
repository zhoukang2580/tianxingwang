import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Component({
  selector: "app-refund-flight-ticket-tip",
  templateUrl: "./refund-flight-ticket-tip.component.html",
  styleUrls: ["./refund-flight-ticket-tip.component.scss"]
})
export class RefundFlightTicketTipComponent implements OnInit {
  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}
  onVolunteer(isVolunteer: boolean) {
    this.popoverCtrl.dismiss(isVolunteer ? "volunteer" : "nonvolunteer");
  }
  onCancel() {
    this.popoverCtrl.dismiss();
  }
}
