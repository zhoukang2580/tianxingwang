import { FlightService } from 'src/app/flight/flight.service';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ViewChildren,
  QueryList,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from "@angular/core";
import { IonRadio } from "@ionic/angular";
import { Subscription, Subject } from "rxjs";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightJourneyEntity } from "src/app/flight/models/flight/FlightJourneyEntity";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";

@Component({
  selector: "app-airtype",
  templateUrl: "./airtype.component.html",
  styleUrls: ["./airtype.component.scss"]
})
export class AirtypeComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input() filterCondition: FilterConditionModel;
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  constructor() {
    this.filterConditionChange = new EventEmitter();
  }
  onReset() {
    if (this.filterCondition && this.filterCondition.airTypes) {
      this.filterCondition.airTypes = this.filterCondition.airTypes.map(c => {
        c.isChecked = false;
        return c;
      });
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        airTypeOp: false
      }
      this.search();
    }
  }

  onionChange() {
    console.log("onionChange");
    this.search();
  }
  ngAfterViewInit() { }
  ngOnDestroy() {

  }
  private search() {
    if (this.filterCondition) {
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        airTypeOp: this.filterCondition.airTypes && this.filterCondition.airTypes.some(it => it.isChecked)
      }
    }
    // console.log(this.filterCondition);
    this.filterConditionChange.emit(this.filterCondition)
  }
  ngOnInit() {

  }
}
