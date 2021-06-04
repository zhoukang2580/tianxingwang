import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { FlightFareType } from "../../models/flight/FlightFareType";
import { FlightCabinFareType } from "../../models/flight/FlightCabinFareType";
import { FlightSegmentItemComponent } from "../flight-segment-item/flight-segment-item.component";

@Component({
  selector: "app-flight-segment-item-df",
  templateUrl: "./flight-segment-item-df.component.html",
  styleUrls: ["./flight-segment-item-df.component.scss"],
})
export class FlightSegmentItemDfComponent extends FlightSegmentItemComponent {}
