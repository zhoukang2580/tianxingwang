import { Subject } from "rxjs";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Component, OnInit, Input } from "@angular/core";
import { SearchTypeModel } from "../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightService } from "../../flight.service";
import { FlightJourneyEntity } from "../../models/flight/FlightJourneyEntity";

@Component({
  selector: "app-fly-filter",
  templateUrl: "./fly-filter.component.html",
  styleUrls: ["./fly-filter.component.scss"]
})
export class FlyFilterComponent implements OnInit {
  @Input()
  flights: FlightJourneyEntity[];
  sForm: FormGroup;
  tab: number;
  resetSj: Subject<boolean>;
  @Input()
  toCityName: string; // 比如上海
  userOps = {
    // 用户是否对某类型的选项做出改变
    timespanOp: false,
    airportOp: false,
    airCompanyOp: false,
    airTypeOp: false,
    cabinOp: false
  };
  constructor(private fb: FormBuilder, private flyService: FlightService) {
    this.resetSj = this.flyService.getResetAdvSCondSources();
  }

  ngOnInit() {
    this.sForm = this.fb.group({
      cabins: [], // 舱位
      onlyDirect: [false], // 仅直达
      takeOffTimeSpan: [{ lower: 0, upper: 24 }], // 起飞时段
      airCompanies: [], // 航空公司
      airports: [], // 机场
      airTypes: [] // 机型
    });
    // console.dir(this.flights);
    console.log("初始化");
    this.tab = 1;
  }
  onTabClick(tab: number) {
    this.tab = tab;
  }
  changetimespanOp(evt: boolean) {
    setTimeout(() => {
      this.userOps.timespanOp = evt;
    }, 0);
  }
  changeairportOp(evt: boolean) {
    setTimeout(() => {
      this.userOps.airportOp = evt;
    }, 0);
  }
  changeairCompanyOp(evt: boolean) {
    setTimeout(() => {
      this.userOps.airCompanyOp = evt;
    }, 0);
  }
  changeairTypeOp(evt: boolean) {
    setTimeout(() => {
      this.userOps.airTypeOp = evt;
    }, 0);
  }
  changecabinOp(evt: boolean) {
    setTimeout(() => {
      this.userOps.cabinOp = evt;
    }, 0);
  }
  onCancel() {
    // this.onReset();
    this.flyService.setShowAdvSearchConditions(false);
  }
  onSearch() {
    // console.log(this.sForm.value);
    this.flyService.setAdvSConditions(this.sForm.value);
    this.onCancel();
  }
  onReset() {
    this.sForm.reset();
    this.resetSj.next(true);
  }
  onTimeSpanSCond(sCond: { lower: number; upper: number }) {
    this.sForm.patchValue({
      takeOffTimeSpan: sCond
    });
  }
  onAirCompanySCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      airCompanies: sCond
    });
  }
  onAirportSCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      airports: sCond
    });
  }
  onAirTypeSCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      airTypes: sCond
    });
  }
  onCabinSCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      cabins: sCond
    });
  }
}
