import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  AfterViewInit,
  Output} from "@angular/core";
import { FilterConditionModel } from "src/app/flight-gp/models/flight/advanced-search-cond/FilterConditionModel";

@Component({
  selector: "app-aircompany",
  templateUrl: "./aircompany.component.html",
  styleUrls: ["./aircompany.component.scss"]
})
export class AircompanyComponent
  implements OnInit, AfterViewInit {
  @Input() filterCondition: FilterConditionModel;
  @Input() langOpt ={
    all: "不限"
  }
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
