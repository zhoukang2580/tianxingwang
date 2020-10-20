import { flyInOut } from "./../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { SelectPassengerPage } from '../select-passenger/select-passenger.page';
export const NOT_WHITE_LIST = "notwhitelist";
@Component({
  selector: "app-select-passenger_en",
  templateUrl: "./select-passenger_en.page.html",
  styleUrls: ["./select-passenger_en.page.scss"],
  animations: [flyInOut],
})
export class SelectPassengerEnPage extends SelectPassengerPage{
  
}
