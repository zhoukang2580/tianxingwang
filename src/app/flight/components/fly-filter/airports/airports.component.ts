import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Subscription, from, Subject } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChildren,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightJourneyEntity } from "src/app/flight/models/flight/FlightJourneyEntity";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";

@Component({
  selector: "app-airports",
  templateUrl: "./airports.component.html",
  styleUrls: ["./airports.component.scss"]
})
export class AirportsComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input() isFromAirports: boolean;
  @Input() filterCondition: FilterConditionModel;
  @Input() langOpt = {
    any: "不限",
    takeoff: "起飞",
    land: "降落"
  };
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  constructor() {
    this.filterConditionChange = new EventEmitter();
  }


  onReset() {
    if (this.filterCondition) {
      if (this.isFromAirports) {
        if (this.filterCondition.fromAirports) {
          this.filterCondition.fromAirports = this.filterCondition.fromAirports.map(it => {
            it.isChecked = false
            return it;
          })
        }
      } else {
        if (this.filterCondition.toAirports) {
          this.filterCondition.toAirports = this.filterCondition.toAirports.map(it => {
            it.isChecked = false
            return it;
          })
        }
      }
      this.search();
    }
  }
  onionChange(){
    this.search();
  }
  private search() {
    if (this.filterCondition) {
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        fromAirportOp: this.filterCondition.fromAirports && this.filterCondition.fromAirports.some(it => it.isChecked),
        toAirportOp: this.filterCondition.toAirports && this.filterCondition.toAirports.some(it => it.isChecked)
      }
    }
    this.filterConditionChange.emit(this.filterCondition);
  }
  ngOnInit() { }
  ngAfterViewInit() { }
  ngOnDestroy() { }
}
