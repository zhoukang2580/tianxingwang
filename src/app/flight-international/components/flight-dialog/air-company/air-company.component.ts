import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  IFilterCondition,
  InternationalFlightService,
} from "src/app/flight-international/international-flight.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-air-company",
  templateUrl: "./air-company.component.html",
  styleUrls: ["./air-company.component.scss"],
})
export class AirCompanyComponent implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  condition: IFilterCondition;
  unlimited: boolean;
  constructor(private flightService: InternationalFlightService) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.subscription = this.flightService
      .getFilterConditionSource()
      .subscribe((c) => {
        this.condition = c;
        console.log("航空公司：", this.condition);
      });
  }
  onReset() {
    if (this.condition && this.condition.airComponies) {
      this.condition.airComponies = this.condition.airComponies.map((it) => {
        it.isChecked = false;
        return it;
      });
      this.unlimited = true;
      this.flightService.setFilterConditionSource(this.condition);
    }
  }
  onChangeChecked() {
    if (this.condition && this.condition.airComponies) {
      this.unlimited = this.condition.airComponies.every((e) => !e.isChecked);
    }
  }
}
