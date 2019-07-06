import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  ViewChildren,
  AfterViewInit,
  QueryList,
  ViewChild,
  Output,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { IonCheckbox, IonRadio, DomController } from "@ionic/angular";
import { Subscription, Subject } from "rxjs";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightJourneyEntity } from "src/app/flight/models/flight/FlightJourneyEntity";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";

@Component({
  selector: "app-aircompany",
  templateUrl: "./aircompany.component.html",
  styleUrls: ["./aircompany.component.scss"]
})
export class AircompanyComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input()
  flights: FlightJourneyEntity[];
  isUnlimitRadioChecked = true;
  @Output() sCond: EventEmitter<any>;
  aircompanies: SearchTypeModel[];
  filterCondition: FilterConditionModel;
  constructor() {
    this.sCond = new EventEmitter();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.flights && changes.flights.currentValue) {
      this.init();
    }
  }
  onionChange() {
    this.isUnlimitRadioChecked = !this.aircompanies.some(
      item => item.isChecked
    );
    this.sCond.emit(this.aircompanies.filter(c => c.isChecked));
  }
  reset() {
    if (this.aircompanies) {
      this.aircompanies.forEach(c => {
        c.isChecked = false;
      });
      this.sCond.emit(this.aircompanies.filter(c => c.isChecked));
    }
  }
  ngOnDestroy(): void {}
  ngAfterViewInit() {}
  private init() {
    this.aircompanies = [];
    const st = Date.now();
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (!this.aircompanies.find(c => c.id === s.Airline)) {
            this.aircompanies.push({
              id: s.Airline,
              label: s.AirlineName,
              isChecked: false,
              icon: s.AirlineSrc
            });
          }
        });
      });
    });
    console.log(`重置aircompany 条件 ${Date.now() - st} ms`, this.aircompanies);
  }
  ngOnInit() {}
}
