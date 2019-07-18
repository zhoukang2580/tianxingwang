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
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() cityName: string;
  @Input() flights: FlightJourneyEntity[];
  @Input() isFromAirports = true;
  isUnlimitRadioChecked = true;
  airports: SearchTypeModel[];
  @Output() sCond: EventEmitter<any>;
  filterCondition: FilterConditionModel;
  constructor() {
    this.sCond = new EventEmitter();
  }

  onionChange() {
    this.isUnlimitRadioChecked = !this.airports.some(item => item.isChecked);
    this.sCond.emit({
      isFromAirports: this.isFromAirports,
      airports: this.airports.filter(a => a.isChecked)
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.flights && changes.flights.currentValue) {
      this.init();
    }
  }
  reset() {
    if (this.airports) {
      this.airports.forEach(c => {
        c.isChecked = false;
      });
    }
  }
  private init() {
    this.airports = [];
    const st = Date.now();
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (
            !this.airports.find(
              a => a.id === (this.isFromAirports ? s.FromAirport : s.ToAirport)
            )
          ) {
            this.airports.push({
              label: this.isFromAirports ? s.FromAirportName : s.ToAirportName,
              id: this.isFromAirports ? s.FromAirport : s.ToAirport,
              isChecked: false
            });
          }
        });
      });
    });
    console.log(`重置 airports 条件 ${Date.now() - st} ms`);
    // console.log(this.flights,this.airports);
    //  this.airports = [
    //   {
    //     label: "浦东机场",
    //     isChecked: false
    //   },
    //   {
    //     label: "虹桥机场",
    //     isChecked: false
    //   }
    // ];
  }
  ngOnInit() {}
  ngAfterViewInit() {}
  ngOnDestroy() {}
}
