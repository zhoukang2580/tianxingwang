import { flyInOut } from "../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { BookPage } from '../book/book.page';

@Component({
  selector: "app-book_en",
  templateUrl: "./book_en.page.html",
  styleUrls: ["./book_en.page.scss"],
  animations: [flyInOut],
})
export class BookEnPage extends BookPage{
  langOpt = {
    meal: "Meal",
    isStop: "Stop over",
    directFly: "NON-Stop",
    agreementDesc: "'A' menans Corporate Fares",
    no: "No ",
    common: "Operated by ",
    agreement: "A",
    planeType: "Aircraft ",
    lowestPrice: "LowestPrice",
    lowestPriceRecommend: "LowestPriceRecommend"
  }
}
