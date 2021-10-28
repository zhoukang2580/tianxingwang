import { delay } from "rxjs/operators";
import { ModalController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { FilterConditionModel } from "./../../models/flight/advanced-search-cond/FilterConditionModel";
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
  AfterViewInit,
  ElementRef,
} from "@angular/core";
import { TakeOffTimeSpanComponent } from "./take-off-timespan/take-off-timespan.component";
import { CabinEnComponent } from "./cabin_en/cabin_en.component";
import { TakeOffTimeSpanDfComponent } from "./take-off-timespan-df/take-off-timespan-df.component";
import { ThemeService } from "src/app/services/theme/theme.service";
@Component({
  selector: "app-fly-filter",
  templateUrl: "./fly-filter.component.html",
  styleUrls: ["./fly-filter.component.scss"],
})
export class FlyFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(AircompanyComponent) airCompanyComp: AircompanyComponent;
  @ViewChild("fromAirports") fromAirports: AirportsComponent;
  @ViewChild("toAirports") toAirports: AircompanyComponent;
  @ViewChild(AirtypeComponent) airTypeComp: AirtypeComponent;
  @ViewChild(CabinComponent) cabinComp: CabinComponent;
  @ViewChild(CabinEnComponent) cabinEnComp: CabinEnComponent;
  @ViewChild(TakeOffTimeSpanDfComponent) timeSpanCompDf: TakeOffTimeSpanDfComponent;
  @Input() langOpt = {
    NonStopOnly: "仅直达",
    IsAgreement: "协议航司",
    TakeTime: "起飞时段",
    Airlines: "航空公司",
    Departure: "起飞机场",
    Arrival: "到达机场",
    Aircraft: "机型",
    Cabins: "舱位",
    any: "不限",
    all: "不限",
    takeoff: "起飞",
    land: "降落",
    morning: "上午",
    afternoon: "午后",
    Reset: "重置",
    Determine: "确定"
  };
  filterCondition: FilterConditionModel;
  tab: number;
  userOps: any;
  constructor(
    private modalCtrl: ModalController,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }
  ngOnDestroy() { }

  ngAfterViewInit() { }
  ngOnInit() {
    this.tab = 1;
  }
  onTabClick(tab: number) {
    this.tab = tab;
  }
  onCancel(evt?: CustomEvent, confirm = false) {
    this.modalCtrl.getTop().then((t) => {
      t.dismiss({ confirm, filterCondition: this.filterCondition });
    });
  }
  onSearch() {
    this.onCancel(null, true);
  }
  onReset() {
    this.fromAirports.onReset();
    this.toAirports.onReset();
    this.airCompanyComp.onReset();
    this.airTypeComp.onReset();
    if (this.cabinComp) {
      this.cabinComp.onReset();
    }
    if (this.cabinEnComp) {
      this.cabinEnComp.onReset();
    }
    this.timeSpanCompDf.onReset();
    if (this.filterCondition) {
      this.filterCondition.onlyDirect = false;
    }
    if (this.filterCondition) {
      this.filterCondition.isAgreement = false;
    }
  }
}
