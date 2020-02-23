import { delay } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FilterConditionModel } from './../../models/flight/advanced-search-cond/FilterConditionModel';
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
import { TakeOffTimeSpanComponent } from './take-off-timespan/take-off-timespan.component';
@Component({
  selector: "app-fly-filter",
  templateUrl: "./fly-filter.component.html",
  styleUrls: ["./fly-filter.component.scss"]
})
export class FlyFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(AircompanyComponent) airCompanyComp: AircompanyComponent;
  @ViewChild("fromAirports") fromAirports: AirportsComponent;
  @ViewChild("toAirports") toAirports: AircompanyComponent;
  @ViewChild(AirtypeComponent) airTypeComp: AirtypeComponent;
  @ViewChild(CabinComponent) cabinComp: CabinComponent;
  @ViewChild(TakeOffTimeSpanComponent) timeSpanComp: TakeOffTimeSpanComponent;
  filterCondition: FilterConditionModel;
  tab: number;
  userOps: any;
  constructor(private modalCtrl: ModalController) {
  }
  ngOnDestroy() {
  }

  ngAfterViewInit() { }
  ngOnInit() {
    this.tab = 1;
  }
  onTabClick(tab: number) {
    this.tab = tab;
  }
  onCancel(evt?: CustomEvent, confirm = false) {
    this.modalCtrl.getTop().then(t => {
      t.dismiss({ confirm, filterCondition: this.filterCondition });
    })
  }
  onSearch() {
    this.onCancel(null, true);
  }
  onReset() {
    this.fromAirports.onReset()
    this.toAirports.onReset();
    this.airCompanyComp.onReset();
    this.airTypeComp.onReset();
    this.cabinComp.onReset();
    this.timeSpanComp.onReset();
    if (this.filterCondition) {
      this.filterCondition.onlyDirect = false;
    }
  }

}
