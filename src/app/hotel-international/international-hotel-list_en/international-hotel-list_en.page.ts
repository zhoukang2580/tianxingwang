import {
  Component,
} from "@angular/core";
import { HotelEntity } from 'src/app/hotel/models/HotelEntity';
import { InternationalHotelListPage } from '../international-hotel-list/international-hotel-list.page';

@Component({
  selector: "app-international-hotel-list_en",
  templateUrl: "./international-hotel-list_en.page.html",
  styleUrls: ["./international-hotel-list_en.page.scss"],

})
export class InternationalHotelListEnPage extends InternationalHotelListPage{
  onViewHotel(hotel: HotelEntity) {
    this.hotelService.viewHotel = hotel;
    this.router.navigate(["international-hotel-detail_en"]);
  }
}
