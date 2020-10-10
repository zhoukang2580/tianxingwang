import { flyInOut } from "src/app/animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { OrderFlightDetailPage } from '../order-flight-detail/order-flight-detail.page';

export interface TabItem {
  label: string;
  value: number;
}

@Component({
  selector: "app-order-flight-detail",
  templateUrl: "./order-flight-detail_en.page.html",
  styleUrls: ["./order-flight-detail_en.page.scss"],
  animations: [flyInOut],
})
export class OrderFlightDetailEnPage extends OrderFlightDetailPage {
  
}
