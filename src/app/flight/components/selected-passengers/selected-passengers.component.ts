import { Component, OnInit } from "@angular/core";
import { StaffEntity } from 'src/app/hr/staff.service';

@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  passengers: StaffEntity[];
  constructor() {}

  ngOnInit() {}
}
