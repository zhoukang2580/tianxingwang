import {
  Component,
} from "@angular/core";

import { FlightListPage } from '../flight-list/flight-list.page';
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list_en.page.html",
  styleUrls: ["./flight-list_en.page.scss"],

})
export class FlightListEnPage extends FlightListPage {
}
