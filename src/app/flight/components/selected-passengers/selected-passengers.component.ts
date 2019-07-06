import { Component, OnInit } from "@angular/core";
import { Passenger } from "../../flight.service";

@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  passengers: Passenger[];
  constructor() {}

  ngOnInit() {}
}
