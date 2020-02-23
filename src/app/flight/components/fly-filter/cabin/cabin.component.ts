import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';
import { StaffService } from 'src/app/hr/staff.service';
import { IonRadio } from "@ionic/angular";
import { Subscription } from "rxjs";
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
  implements OnInit, OnDestroy, AfterViewInit {
  @Input() filterCondition: FilterConditionModel;
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  isSelf = true;
  selectItem: any;
  constructor(private staffService: StaffService) {
    this.filterConditionChange = new EventEmitter();
  }
  onUnlimit() {
    this.onReset();
  }

  onReset() {
    this.selectItem = null;
    if (this.filterCondition && this.filterCondition.cabins) {
      this.filterCondition.cabins = this.filterCondition.cabins.map(c => {
        c.isChecked = false;
        return c;
      });
      this.search();
    }
  }
  onionChange(c: { id: string }) {
    this.selectItem = c;
    if (this.filterCondition.cabins) {
      this.filterCondition.cabins = this.filterCondition.cabins.map(it => {
        if (this.isSelf) {
          it.isChecked = it.id == (c && c.id);
        }
        return it;
      })
    }
    this.search();
  }
  private search() {
    if (this.filterCondition && this.filterCondition.cabins) {
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        cabinOp: this.filterCondition.cabins.some(it => it.isChecked)
      }
    }
    this.filterConditionChange.emit(this.filterCondition);
  }

  ngAfterViewInit() { }
  ngOnDestroy() {
  }
  async ngOnInit() {
    this.isSelf = await this.staffService.isSelfBookType();
  }
}
