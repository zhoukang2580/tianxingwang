import {
  Component,
} from "@angular/core";
import { flyInOut } from "src/app/animations/flyInOut";
import { OrderTrainDetailPage } from '../order-train-detail/order-train-detail.page';
@Component({
  selector: "app-order-train-detail_en",
  templateUrl: "./order-train-detail_en.page.html",
  styleUrls: ["./order-train-detail_en.page.scss"],
  animations: [flyInOut],
})
export class OrderTrainDetailEnPage extends OrderTrainDetailPage {
 
}
