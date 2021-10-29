import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";
import { Subscription } from "rxjs";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Output,
  OnDestroy,
  Input,
} from "@angular/core";
import { IonRange, DomController, IonRadioGroup } from "@ionic/angular";
@Component({
  selector: "app-take-off-timespan-df",
  templateUrl: "./take-off-timespan-df.component.html",
  styleUrls: ["./take-off-timespan-df.component.scss"],
})
export class TakeOffTimeSpanDfComponent implements OnInit, AfterViewInit {
  @ViewChild(IonRadioGroup) groupEle: IonRadioGroup;
  @Input() filterCondition: FilterConditionModel;
  selectItem = "unlimit";
  @Input() langOpt = {
    any: "不限",
  };
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  constructor(private domCtrl: DomController) {
    this.filterConditionChange = new EventEmitter();
  }
  private search() {
    if (this.filterCondition && this.filterCondition.takeOffTimeSpan) {
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        timespanOp:
          this.filterCondition.takeOffTimeSpan.lower > 0 ||
          this.filterCondition.takeOffTimeSpan.upper < 24,
      };
      this.filterConditionChange.emit(this.filterCondition);
    }
  }
  ngOnInit() {
    this.selectItem = "unlimit";
    if (this.filterCondition && this.filterCondition.takeOffTimeSpan) {
      if (
        this.filterCondition.takeOffTimeSpan.lower != 0 &&
        this.filterCondition.takeOffTimeSpan.upper != 24
      ) {
        this.selectItem = [
          this.filterCondition.takeOffTimeSpan.lower,
          this.filterCondition.takeOffTimeSpan.upper,
        ].join(",");
      }
    }
  }
  onReset() {
    // if (this.filterCondition && this.filterCondition.takeOffTimeSpan) {
    //   this.filterCondition.takeOffTimeSpan.lower = 0;
    //   this.filterCondition.takeOffTimeSpan.upper = 24;
    // }
    // this.search();
    // this.selectItem = "unlimit";
    this.groupEle.value = "unlimit";
  }
  ngOnDestroy() {}
  ngAfterViewInit() {}
  onionChange(evt?: CustomEvent) {
    // console.log(evt);
    let arr = [];
    if (evt.detail && evt.detail.value == "unlimit") {
      this.filterCondition.takeOffTimeSpan.lower = 0;
      this.filterCondition.takeOffTimeSpan.upper = 24;
    }
    if (evt.detail && evt.detail.value) {
      arr = evt.detail.value.split(",");
    }
    if (arr.length == 2) {
      this.filterCondition.takeOffTimeSpan.lower = arr[0];
      this.filterCondition.takeOffTimeSpan.upper = arr[1];
    }
    this.search();
  }
}
