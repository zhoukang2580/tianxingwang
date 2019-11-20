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
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input()
  flights: FlightJourneyEntity[];
  isUnlimitRadioChecked = true;
  airtypes: SearchTypeModel[];
  @Output() sCond: EventEmitter<any>; // 搜索条件
  filterCondition: FilterConditionModel;
  constructor() {
    this.sCond = new EventEmitter();
  }
  reset() {
    if (this.airtypes) {
      this.airtypes=this.airtypes.map(c => {
        c.isChecked = false;
        return c;
      });
      this.sCond.emit(this.airtypes.filter(c => c.isChecked));
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.flights && changes.flights.currentValue) {
      this.init();
    }
  }
  onionChange() {
    this.isUnlimitRadioChecked = !this.airtypes.some(item => item.isChecked);
    this.sCond.emit(this.airtypes.filter(c => c.isChecked));
  }
  ngAfterViewInit() {}
  ngOnDestroy() {}
  private init() {
    this.airtypes = [];
    const st = Date.now();
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (!this.airtypes.find(a => a.id === s.PlaneType)) {
            this.airtypes.push({
              id: s.PlaneType,
              label: s.PlaneTypeDescribe,
              isChecked: false
            });
          }
        });
      });
    });
    console.log(`初始化 airtype ${Date.now() - st} ms`);
  }
  onSearch() {
    this.sCond.emit(this.airtypes.filter(t => t.isChecked));
  }
  ngOnInit() {}
}
