import { Component, OnInit } from "@angular/core";
import { StaffEntity } from "src/app/hr/staff.service";
import { FlightService } from "../../flight.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  passengers$: Observable<StaffEntity[]>;
  constructor(private flightService: FlightService) {
    this.passengers$ = flightService.getSelectedPasengerSource();
  }

  ngOnInit() {}
}
