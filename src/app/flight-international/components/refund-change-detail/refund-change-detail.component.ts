import { Component, OnInit } from "@angular/core";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";
import { ModalController } from "@ionic/angular";
import { FlightFareRuleEntity } from "src/app/flight/models/FlightFareRuleEntity";

@Component({
  selector: "app-refund-change-detail",
  templateUrl: "./refund-change-detail.component.html",
  styleUrls: ["./refund-change-detail.component.scss"],
})
export class RefundChangeDetailComponent implements OnInit {
  data: {
    FlightFareRules: FlightFareRuleEntity[];
    FlightFares: FlightFareEntity[];
  };
  explain: string;
  private airports: string[];
  private getExplain() {
    this.explain =
      (this.data &&
        this.data.FlightFares &&
        this.data.FlightFares[0].Explain &&
        this.data.FlightFares[0].Explain.split("。")
          .map((it) => {
            if (it.match(/(\d+\.)/g)) {
              it = it.replace(/(\d+\.)/g, "<br/>$1");
            }
            if (it.match(/（\d+）/g)) {
              it = it.replace(/（(\d+)）/g, "<br/>（$1）");
            }
            if (this.airports && this.airports.some((a) => it.includes(a))) {
              if (!it.trim().startsWith("<br/>")) {
                it = `<br/>${it}`;
              }
            }
            return it;
          })
          .map((it) => {
            if (it && it.trim().startsWith("<br/>")) {
              it = it.trim().substring(5);
            }
            return it;
          })
          .join("<br/>")) ||
      "";
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
    this.getExplain();
    // console.log(this.airports);
  }
}
