import { FlightService } from 'src/app/flight/flight.service';
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
  implements OnInit, AfterViewInit {
  @Input() filterCondition: FilterConditionModel;
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  constructor() {
    this.filterConditionChange = new EventEmitter();
  }
  onionChange() {

    this.search();
  }
  onReset() {
    if (this.filterCondition && this.filterCondition.airCompanies) {
      this.filterCondition.airCompanies = this.filterCondition.airCompanies.map(c => {
        c.isChecked = false;
        return c;
      });
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        airCompanyOp: false
      }
      this.search();
    }
  }
  private search() {
    requestAnimationFrame(() => {
      if (this.filterCondition) {
        this.filterCondition.userOps = {
          ...this.filterCondition.userOps,
          airCompanyOp: this.filterCondition.airCompanies && this.filterCondition.airCompanies.some(it => it.isChecked)
        }
      }
      this.filterConditionChange.emit(this.filterCondition);
    })
  }
  ngOnDestroy(): void {

  }
  ngAfterViewInit() { }

  ngOnInit() {
    console.log(this.filterCondition && this.filterCondition.airCompanies);
  }
}
