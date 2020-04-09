import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import {
  InternationalFlightService,
  IFilterCondition,
} from "src/app/flight-international/international-flight.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-direct-fly",
  templateUrl: "./direct-fly.component.html",
  styleUrls: ["./direct-fly.component.scss"],
})
export class DirectFlyComponent implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  condition: IFilterCondition;
  unlimited = true;
  constructor(private flightService: InternationalFlightService) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.onReset();
    this.subscription = this.flightService
      .getFilterConditionSource()
      .subscribe((c) => {
        this.condition = c;
        console.log(this.condition,"333");
        
      });
  }
  onReset() {
    if (this.condition) {
      this.condition.isDirectFly = false;
    }
    this.unlimited=true;
  }
  onChangeChecked() {
    if (this.condition) {
      this.unlimited = !this.condition.isDirectFly;
    }
  }
}
