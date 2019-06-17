import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ViewChildren,
  QueryList,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter
} from "@angular/core";
import { IonRadio } from "@ionic/angular";
import { Subscription, Subject } from "rxjs";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightJourneyEntity } from 'src/app/flight/models/flight/FlightJourneyEntity';

@Component({
  selector: "app-airtype",
  templateUrl: "./airtype.component.html",
  styleUrls: ["./airtype.component.scss"]
})
export class AirtypeComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  flights: FlightJourneyEntity[];
  @Input()
  resetSj: Subject<boolean>;
  resetSub = Subscription.EMPTY;
  @ViewChild("unlimitRadio")
  unlimitRadio: IonRadio;
  unlimitRadioSub = Subscription.EMPTY;
  airtypes: SearchTypeModel[];
  @Output()
  userOp: EventEmitter<boolean>; // 用户是否点击过
  @Output()
  sCond: EventEmitter<any>; // 搜索条件
  constructor() {
    this.userOp = new EventEmitter();
    this.sCond = new EventEmitter();
  }
  onUnlimit() {
    this.userOp.emit(this.airtypes.some(a => a.isChecked));
    this.onSearch();
    return this.airtypes.every(a => !a.isChecked);
  }
  ngAfterViewInit() {
    this.unlimitRadioSub = this.unlimitRadio.ionSelect.subscribe(
      (c: CustomEvent) => {
        // console.log(c);
        if (c.detail.checked) {
          this.airtypes.forEach(a => {
            a.isChecked = false;
          });
        }
      }
    );
  }
  ngOnDestroy() {
    this.unlimitRadioSub.unsubscribe();
    this.resetSub.unsubscribe();
  }
  init() {
    this.airtypes = [];
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (!this.airtypes.find(a => a.id === s.PlaneType)) {
            this.airtypes.push({
              id: s.PlaneType,
              label: s.PlaneTypeDescribe,
              isChecked: false
            });
          }
        });
      });
    });
  }
  onSearch() {
    this.sCond.emit(this.airtypes.filter(t=>t.isChecked));
  }
  ngOnInit() {
    this.resetSub = this.resetSj.subscribe(reset => {
      if (reset) {
        this.init();
      }
    });
    this.init();
  }
}
