import { Component, OnInit } from "@angular/core";
import { SelectPassengerPage } from "src/app/tmc/select-passenger/select-passenger.page";
import { flyInOut } from 'src/app/animations/flyInOut';

@Component({
  selector: "app-select-flight-passenger",
  templateUrl: "./select-flight-passenger.component.html",
  styleUrls: ["./select-flight-passenger.component.scss"],
  animations:[flyInOut]
})
export class SelectFlightPassengerComponent extends SelectPassengerPage {
}
