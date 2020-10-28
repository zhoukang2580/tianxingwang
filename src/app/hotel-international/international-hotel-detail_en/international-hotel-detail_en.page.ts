import { fadeInOut } from "./../../animations/fadeInOut";
import { flyInOut } from "./../../animations/flyInOut";
import {
  Component, EventEmitter,
} from "@angular/core";
// tslint:disable-next-line: max-line-length
import { InternationalHotelDetailPage } from '../international-hotel-detail/international-hotel-detail.page';
import { of } from 'rxjs/internal/observable/of';
import { RoomPlanEntity } from 'src/app/hotel/models/RoomPlanEntity';
import { RoomEntity } from 'src/app/hotel/models/RoomEntity';
import { FlightHotelTrainType, PassengerBookInfo } from 'src/app/tmc/tmc.service';
import { IHotelInfo } from 'src/app/hotel/hotel.service';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { SelectPassengerPage } from 'src/app/tmc/select-passenger/select-passenger.page';
import { SelectPassengerEnPage } from 'src/app/tmc/select-passenger_en/select-passenger_en.page';

@Component({
  selector: "app-international-hotel-detail_em",
  templateUrl: "./international-hotel-detail_en.page.html",
  styleUrls: ["./international-hotel-detail_en.page.scss"],
  animations: [flyInOut, fadeInOut],
})
export class InternationalHotelDetailEnPage extends InternationalHotelDetailPage{
  
}
