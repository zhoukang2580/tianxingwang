import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import {
  InternationalFlightService,
  IFilterCondition,
} from "src/app/international-flight/international-flight.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-direct-fly",
  templateUrl: "./direct-fly.component.html",
  styleUrls: ["./direct-fly.component.scss"],
})
export class DirectFlyComponent implements OnInit, OnDestroy {
  @Input() langOpt = {
    all: "不限",
    NonStopOnly: "仅直达",
  };
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
      this.flightService.setFilterConditionSource(this.condition);
    }
    this.unlimited=true;
  }
  onChangeChecked() {
    if (this.condition) {
      this.unlimited = !this.condition.isDirectFly;
      this.flightService.setFilterConditionSource(this.condition);
    }
  }
}
