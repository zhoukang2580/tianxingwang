import { FlightJouneyModel } from "./../../../models/flight/FlightJouneyModel";
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
  OnDestroy
} from "@angular/core";
import { IonCheckbox, IonRadio } from "@ionic/angular";
import { Subscription, Subject } from "rxjs";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";

@Component({
  selector: "app-aircompany",
  templateUrl: "./aircompany.component.html",
  styleUrls: ["./aircompany.component.scss"]
})
export class AircompanyComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  flights: FlightJouneyModel[];
  @Input()
  resetSj: Subject<boolean>;
  resetSub = Subscription.EMPTY;
  @ViewChild("unlimitRadio")
  unlimitRadio: IonRadio;
  unlimitRadioSub = Subscription.EMPTY;
  @Output()
  userOp: EventEmitter<boolean>;
  @Output()
  sCond: EventEmitter<any>;
  aircompanies: SearchTypeModel[];
  constructor() {
    this.userOp = new EventEmitter();
    this.sCond = new EventEmitter();
  }
  onUnlimit() {
    this.userOp.emit(this.aircompanies.some(a => a.isChecked));
    this.sCond.emit(this.aircompanies.filter(c => c.isChecked));
    return this.aircompanies.every(a => !a.isChecked);
  }
  ngOnDestroy(): void {
    this.unlimitRadioSub.unsubscribe();
    this.resetSub.unsubscribe();
  }
  ngAfterViewInit() {
    this.unlimitRadioSub = this.unlimitRadio.ionSelect.subscribe(
      (c: CustomEvent) => {
        // console.log(c);
        if (c.detail.checked) {
          this.aircompanies.forEach(a => {
            a.isChecked = false;
          });
        }
      }
    );
  }
  init() {
    this.aircompanies = [];
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (!this.aircompanies.find(c => c.id === s.Airline)) {
            this.aircompanies.push({
              id: s.Airline,
              label: s.AirlineName,
              isChecked: false,
              icon: "assets/icon/favicon.png"
            });
          }
        });
      });
    });
  }
  ngOnInit() {
    this.init();
    this.resetSub = this.resetSj.subscribe(reset => {
      if (reset) {
        this.init();
      }
    });
  }
}
