import {
  Component, Input,
} from "@angular/core";
import { TrainBookPage } from '../train-book/book.page';

@Component({
  selector: "app-train-book_en",
  templateUrl: "./book_en.page.html",
  styleUrls: ["./book_en.page.scss"],
})
export class TrainBookEnPage extends TrainBookPage {
  @Input() langOpt = {
    about : "",
    time: "H",
    minute: "m",
    isStopInfo: "Stop",
    has: "",
    no: "0",
    Left: "Left",
    agreement: "agreement",
    agreementDesc: "agreementDesc",
    reserve: "Book"
  }
}
