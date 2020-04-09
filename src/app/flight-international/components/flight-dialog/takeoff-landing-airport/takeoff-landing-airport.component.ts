import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  InternationalFlightService,
  IFilterCondition,
} from "src/app/flight-international/international-flight.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-takeoff-landing-airport",
  templateUrl: "./takeoff-landing-airport.component.html",
  styleUrls: ["./takeoff-landing-airport.component.scss"],
})
export class TakeoffLandingAirportComponent implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  condition: IFilterCondition;
  unlimited = true;
  tounlimited=true;
  constructor(private flightService: InternationalFlightService) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.subscription = this.flightService
      .getFilterConditionSource()
      .subscribe((c) => {
        this.condition = c;
      });
  }
  onChangeChecked() {
    if (this.condition) {
      if (this.condition.fromAirports) {
        this.unlimited = this.condition.fromAirports.every(
          (it) => !it.isChecked
        );
      }
    }
  }
  onToChangeChecked(){
    if (this.condition) {
      if (this.condition.toAirports) {
        this.tounlimited = this.condition.toAirports.every((it) => !it.isChecked);
      }
    }
  }
  onReset() {
    if (this.condition) {
      if (this.condition.fromAirports) {
        this.condition.fromAirports = this.condition.fromAirports.map((it) => {
          it.isChecked = false;
          return it;
        });
        this.unlimited=true;
      }
      if (this.condition.toAirports) {
        this.condition.toAirports = this.condition.toAirports.map((it) => {
          it.isChecked = false;
          return it;
        });
        this.tounlimited=true;
      }
    }
  }
}
