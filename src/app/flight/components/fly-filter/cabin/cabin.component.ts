import { IonRadio } from "@ionic/angular";
import { Subscription } from "rxjs";
import { FilterConditionModel } from "./../../../models/flight/advanced-search-cond/FilterConditionModel";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { CabintypePipe } from "../../../pipes/cabintype.pipe";
import { FlightJourneyEntity } from "src/app/flight/models/flight/FlightJourneyEntity";
import { FlightCabinType } from "src/app/flight/models/flight/FlightCabinType";
import { SearchTypeModel } from "src/app/flight/models/flight/advanced-search-cond/SearchTypeModel";

@Component({
  selector: "app-cabin",
  templateUrl: "./cabin.component.html",
  styleUrls: ["./cabin.component.scss"]
})
export class CabinComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() flights: FlightJourneyEntity[];
  @Output() sCond: EventEmitter<any>; // 搜索条件
  cabins: SearchTypeModel[] = [];
  isUnlimitRadioChecked = true;
  constructor(private cabinPipe: CabintypePipe) {
    this.sCond = new EventEmitter();
  }
  onUnlimit() {
    this.reset();
    return this.cabins.every(a => !a.isChecked);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.flights && changes.flights.currentValue) {
      this.init();
    }
  }
  reset() {
    if (this.cabins) {
      this.cabins.forEach(c => {
        c.isChecked = false;
      });
      this.onSearch();
    }
  }
  onionChange() {
    this.isUnlimitRadioChecked = !this.cabins.some(item => item.isChecked);
    this.onSearch();
  }
  onSearch() {
    this.sCond.emit(this.cabins.filter(t => t.isChecked));
  }
  private init() {
    this.cabins = [];
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          s.Cabins.forEach(c => {
            if (
              !this.cabins.find(
                a => a.label == this.cabinPipe.transform(c.Type)
              )
            ) {
              this.cabins.push({
                id: FlightCabinType[c.Type],
                label: this.cabinPipe.transform(c.Type),
                isChecked: false
              });
            }
          });
        });
      });
    });
  }
  ngAfterViewInit() {}
  ngOnDestroy() {}
  ngOnInit() {}
}
