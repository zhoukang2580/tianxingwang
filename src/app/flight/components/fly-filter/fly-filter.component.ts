import { AircompanyComponent } from "./aircompany/aircompany.component";
import { AirportsComponent } from "./airports/airports.component";
import { AirtypeComponent } from "./airtype/airtype.component";
import { CabinComponent } from "./cabin/cabin.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from "@angular/core";
import { SearchTypeModel } from "../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightService } from "../../flight.service";
import { FlightJourneyEntity } from "../../models/flight/FlightJourneyEntity";
import { TakeOffTimespanComponent } from "./take-off-timespan/take-off-timespan.component";
@Component({
  selector: "app-fly-filter",
  templateUrl: "./fly-filter.component.html",
  styleUrls: ["./fly-filter.component.scss"]
})
export class FlyFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(TakeOffTimespanComponent) timeComp: TakeOffTimespanComponent;
  @ViewChild(CabinComponent) cabinComp: CabinComponent;
  @ViewChild(AirtypeComponent) airTypeComp: AirtypeComponent;
  @ViewChild("fromAirports") fromAirportsComp: AirportsComponent;
  @ViewChild("toAirports") toAirportsComp: AirportsComponent;
  @ViewChild(AircompanyComponent) airCompanyComp: AircompanyComponent;
  @Input() flights: FlightJourneyEntity[];
  @Input() toCityName: string; // 比如上海
  @Input() fromCityName: string; // 比如上海
  sForm: FormGroup;
  tab: number;
  userOps = {
    // 用户是否对某类型的选项做出改变
    timespanOp: false,
    fromAirportOp: false,
    toAirportOp: false,
    airCompanyOp: false,
    airTypeOp: false,
    cabinOp: false
  };
  constructor(private fb: FormBuilder, private flightService: FlightService) {
    console.log("FlyFilterComponent constructor execute");
    this.sForm = this.fb.group({
      cabins: [], // 舱位
      onlyDirect: [false], // 仅直达
      takeOffTimeSpan: [{ lower: 0, upper: 24 }], // 起飞时段
      airCompanies: [], // 航空公司
      fromAirports: [], // 起飞机场
      toAirports: [], // 到达机场
      airTypes: [] // 机型
    });
  }
  ngOnDestroy() {}
  ngAfterViewInit() {}
  ngOnInit() {
    // console.dir(this.flights);
    console.log("初始化");
    this.tab = 1;
  }
  onTabClick(tab: number) {
    this.tab = tab;
  }
  onCancel() {
    // this.onReset();
    this.flightService.setFilterPanelShow(false);
  }
  onSearch() {
    // console.log(this.sForm.value);
    this.flightService.setFilterCondition(this.sForm.value);
    this.onCancel();
  }
  onReset() {
    this.sForm.reset();
    this.airCompanyComp.reset();
    this.airTypeComp.reset();
    this.timeComp.reset();
    this.cabinComp.reset();
  }
  onTimeSpanSCond(sCond: { lower: number; upper: number }) {
    this.sForm.patchValue({
      takeOffTimeSpan: sCond
    });
    this.userOps.timespanOp = !(sCond && sCond.lower == 0 && sCond.upper == 24);
  }
  onAirCompanySCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      airCompanies: sCond
    });
    this.userOps.airCompanyOp = sCond && sCond.length > 0;
  }
  onFromAirportSCond(evt: {
    isFromAirports: boolean;
    airports: SearchTypeModel[];
  }) {
    this.sForm.patchValue({
      fromAirports: evt.airports
    });
    this.userOps.fromAirportOp = evt && evt.airports.length > 0;
  }
  onToAirportSCond(evt: {
    isFromAirports: boolean;
    airports: SearchTypeModel[];
  }) {
    this.sForm.patchValue({
      toAirports: evt.airports
    });
    this.userOps.toAirportOp = evt && evt.airports.length > 0;
  }
  onAirTypeSCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      airTypes: sCond
    });
    this.userOps.airTypeOp = sCond && sCond.length > 0;
  }
  onCabinSCond(sCond: SearchTypeModel[]) {
    this.sForm.patchValue({
      cabins: sCond
    });
    this.userOps.cabinOp = sCond && sCond.length > 0;
  }
}
