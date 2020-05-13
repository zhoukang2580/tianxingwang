import { Component, OnInit } from "@angular/core";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-refund-change-detail",
  templateUrl: "./refund-change-detail.component.html",
  styleUrls: ["./refund-change-detail.component.scss"],
})
export class RefundChangeDetailComponent implements OnInit {
  flightfares: FlightFareEntity[];
  private airports: string[];
  get explain() {
    return (
      (this.flightfares &&
        this.flightfares[0] &&
        this.flightfares[0].Explain &&
        this.flightfares[0].Explain.split("。")
          .map((it) => it.replace(/[\r|\n]/g, "<br/>"))
          .map((it) => {
            if (it.startsWith("<br/>")) {
              it = it.substring("<br/>".length);
            }
            if (this.airports && this.airports.some((a) => it.includes(a))) {
              it = `<br/>${it}`;
            }
            return it;
          })
          .join("<br/>")) ||
      ""
    );
  }
  constructor(private modalCtrl: ModalController) {}

  back() {
    this.modalCtrl.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
  ngOnInit() {
    console.log(this.airports);
  }
}
