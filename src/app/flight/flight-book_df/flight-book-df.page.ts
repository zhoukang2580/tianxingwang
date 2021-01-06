import { flyInOut } from "../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { FlightCabinFareType } from "../models/flight/FlightCabinFareType";
import { FlightBookPage } from "../flight-book/flight-book.page";

@Component({
  selector: "app-flight-book-df",
  templateUrl: "./flight-book-df.page.html",
  styleUrls: ["./flight-book-df.page.scss"],
  animations: [flyInOut],
})
export class FlightBookDfPage extends FlightBookPage {
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
