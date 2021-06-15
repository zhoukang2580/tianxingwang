
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
import { FilterConditionModel } from "src/app/flight-gp/models/flight/advanced-search-cond/FilterConditionModel";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";

@Component({
  selector: "app-airtype",
  templateUrl: "./airtype.component.html",
  styleUrls: ["./airtype.component.scss"]
})
export class AirtypeComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input() filterCondition: FilterConditionModel;
  @Input() langOpt = {
    any: "不限"
  };
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
