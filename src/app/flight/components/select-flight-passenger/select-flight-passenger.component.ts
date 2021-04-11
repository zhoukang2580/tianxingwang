import { Component, OnInit } from "@angular/core";
import { flyInOut } from "src/app/animations/flyInOut";
import { SelectPassengerDfPage } from "src/app/tmc/select-passenger-df/select-passenger-df.page";

@Component({
  selector: "app-select-flight-passenger",
  templateUrl: "../../../tmc/select-passenger/select-passenger.page.html",
  styleUrls: ["../../../tmc/select-passenger/select-passenger.page.scss"],
  animations: [flyInOut],
})
export class SelectFlightPassengerComponent extends SelectPassengerDfPage {}
