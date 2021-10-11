import { Component, Input } from "@angular/core";
import { TrainListBasePage } from "../train-list/train-list-base.page";
@Component({
  selector: "app-train-list_en",
  templateUrl: "./train-list_en.page.html",
  styleUrls: ["./train-list_en.page.scss"],
})
export class TrainListEnPage extends TrainListBasePage {
  @Input() langOpt = {
    about: "",
    time: "H",
    minute: "m",
    isStopInfo: "Stop",
    has: "",
    no: "0",
    Left: "Left",
    agreement: "agreement",
    agreementDesc: "agreementDesc",
    reserve: "Book",
  };
}
