import { fadeInOut } from "../../animations/fadeInOut";
import { flyInOut } from "../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { InternationalHotelDetailPage } from "../international-hotel-detail/international-hotel-detail.page";

@Component({
  selector: "app-international-hotel-detail-df",
  templateUrl: "./international-hotel-detail-df.page.html",
  styleUrls: ["./international-hotel-detail-df.page.scss"],
  animations: [flyInOut, fadeInOut],
})
export class InternationalHotelDetailDfPage extends InternationalHotelDetailPage {}
