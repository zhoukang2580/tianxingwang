import { fadeInOut } from "./../../animations/fadeInOut";
import { flyInOut } from "./../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
// tslint:disable-next-line: max-line-length
import { InternationalHotelDetailPage } from '../international-hotel-detail/international-hotel-detail.page';

@Component({
  selector: "app-international-hotel-detail_em",
  templateUrl: "./international-hotel-detail_en.page.html",
  styleUrls: ["./international-hotel-detail_en.page.scss"],
  animations: [flyInOut, fadeInOut],
})
export class InternationalHotelDetailEnPage extends InternationalHotelDetailPage{
}
