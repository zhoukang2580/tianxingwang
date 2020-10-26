import {
  Component,
} from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { InternationalHotelBookinfosPage } from '../international-hotel-bookinfos/international-hotel-bookinfos.page';

@Component({
  selector: "app-international-hotel-bookinfos_en",
  templateUrl: "./international-hotel-bookinfos_en.page.html",
  styleUrls: ["./international-hotel-bookinfos_en.page.scss"],
})
export class InternationalHotelBookinfosEnPage extends InternationalHotelBookinfosPage {
  async nextStep() {
    await this.router.navigate([
      AppHelper.getRoutePath("international-hotel-book"),
    ]);
    await this.hotelService.dismissAllTopOverlays();
  }
}
