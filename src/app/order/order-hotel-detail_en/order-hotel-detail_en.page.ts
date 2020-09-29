import {
  Component,
} from "@angular/core";
import { OrderHotelDetailPage } from '../order-hotel-detail/order-hotel-detail.page';

export interface TabItem {
  label: string;
  value: number;
}
@Component({
  selector: "app-order-hotel-detail",
  templateUrl: "./order-hotel-detail_en.page.html",
  styleUrls: ["./order-hotel-detail_en.page.scss"],
})
export class OrderHotelDetailEnPage extends OrderHotelDetailPage {
 
}
