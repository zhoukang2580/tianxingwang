import {
  Component,
} from "@angular/core";
// tslint:disable-next-line: max-line-length
import { TrainListPage } from '../train-list/train-list.page';
@Component({
  selector: "app-train-list_en",
  templateUrl: "./train-list_en.page.html",
  styleUrls: ["./train-list_en.page.scss"],
})
export class TrainListEnPage extends TrainListPage {
  langOpt = {
    about : "",
    time: "H",
    minute: "m",
    isStopInfo: "Stop",
    has: "",
    no: "no",
    Left: "Left",
    agreement: "agreement",
    agreementDesc: "agreementDesc",
    reserve: "Book"
  }
}
