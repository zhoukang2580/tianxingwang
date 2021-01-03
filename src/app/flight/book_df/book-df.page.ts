import { flyInOut } from "../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { BookPage } from '../book/book.page';
import { FlightCabinFareType } from "../models/flight/FlightCabinFareType";

@Component({
  selector: "app-book-df",
  templateUrl: "./book-df.page.html",
  styleUrls: ["./book-df.page.scss"],
  animations: [flyInOut],
})
export class BookDfPage extends BookPage {
  langOpt: any = {
    has: "有",
    meal: "餐食",
    isStop: "经停",
    directFly: "直飞",
    no: "无",
    common: "共享",
    agreement: "协",
    agreementDesc: "协议价",
    planeType: "机型",
    lowestPrice: "最低价",
    lowestPriceRecommend: "最低价推荐",
  };
  expanseCompareFn(t1: string, t2: string) {
    return t1 && t2 ? t1 === t2 : false;
  }
}
