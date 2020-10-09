import { flyInOut } from "./../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
// tslint:disable-next-line: max-line-length
import { HotelDetailPage } from '../hotel-detail/hotel-detail.page';

@Component({
  selector: "app-hotel-detail_en",
  templateUrl: "./hotel-detail_en.page.html",
  styleUrls: ["./hotel-detail_en.page.scss"],
  animations: [flyInOut],
})
export class HotelDetailEnPage extends HotelDetailPage {
  
}
