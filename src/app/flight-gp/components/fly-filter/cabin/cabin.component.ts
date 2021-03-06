import { HrService } from "src/app/hr/hr.service";
import { IonRadio } from "@ionic/angular";
import { Subscription } from "rxjs";
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
  SimpleChanges,
} from "@angular/core";
import { CabintypePipe } from "../../../pipes/cabintype.pipe";
import { FilterConditionModel } from "src/app/flight-gp/models/flight/advanced-search-cond/FilterConditionModel";

@Component({
  selector: "app-cabin",
  templateUrl: "./cabin.component.html",
  styleUrls: ["./cabin.component.scss"],
})
export class CabinComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() filterCondition: FilterConditionModel;
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  @Input() langOpt = {
    any: "不限"
  };
  isSelf = true;
  selectItem: any = "unlimit";
  constructor(private staffService: HrService) {
    this.filterConditionChange = new EventEmitter();
  }

  onReset() {
    this.selectItem = "unlimit";
    if (this.filterCondition && this.filterCondition.cabins) {
      this.filterCondition.cabins = this.filterCondition.cabins.map((c) => {
        c.isChecked = false;
        return c;
      });
      this.search();
    }
  }
  onionChange(evt?: CustomEvent) {
    const c = evt && evt.detail && evt.detail.value;
    if (c) {
      if (c == "unlimit") {
        if (this.filterCondition.cabins) {
          this.filterCondition.cabins.forEach((it) => {
            it.isChecked = false;
          });
        }
      } else {
        this.filterCondition.cabins.forEach((it) => {
          it.isChecked = it.id == c.id;
        });
      }
      this.selectItem = this.filterCondition.cabins.filter((it) => it.isChecked)
        .length
        ? c
        : "unlimit";
    } else {
    }
    this.search();
  }
  private search() {
    if (this.filterCondition && this.filterCondition.cabins) {
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        cabinOp: this.filterCondition.cabins.some((it) => it.isChecked),
      };
    }
    this.filterConditionChange.emit(this.filterCondition);
  }

  ngAfterViewInit() {}
  ngOnDestroy() {}
  async ngOnInit() {
    this.isSelf = await this.staffService.isSelfBookType();
  }
}
