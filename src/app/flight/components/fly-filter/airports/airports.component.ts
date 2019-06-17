import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Subscription, from, Subject } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChildren
} from "@angular/core";
import { IonRadio, IonCheckbox } from "@ionic/angular";
import { QueryList } from "@angular/core";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightJourneyEntity } from 'src/app/flight/models/flight/FlightJourneyEntity';

@Component({
  selector: "app-airports",
  templateUrl: "./airports.component.html",
  styleUrls: ["./airports.component.scss"]
})
export class AirportsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  flights: FlightJourneyEntity[];
  @Input()
  toCityName: string;
  @Input()
  resetSj: Subject<boolean>;
  resetSub = Subscription.EMPTY;
  @ViewChild("unlimitRadio")
  unlimitRadio: IonRadio;
  unlimitRadioSub = Subscription.EMPTY;
  airports: SearchTypeModel[];
  @Output()
  userOp: EventEmitter<boolean>; // 用户是否点击过
  @Output()
  sCond: EventEmitter<any>;
  constructor() {
    this.userOp = new EventEmitter();
    this.sCond = new EventEmitter();
  }
  onUnlimit() {
    this.userOp.emit(this.airports.some(a => a.isChecked));
    this.sCond.emit(this.airports.filter(a => a.isChecked));
    return this.airports.every(a => !a.isChecked);
  }
  init() {
    this.airports = [];
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (!this.airports.find(a => a.id === s.ToAirport)) {
            this.airports.push({
              label: s.ToAirportName,
              id: s.ToAirport,
              isChecked: false
            });
          }
        });
      });
    });
    // console.log(this.flights,this.airports);
    //  this.airports = [
    //   {
    //     label: "浦东机场",
    //     isChecked: false
    //   },
    //   {
    //     label: "虹桥机场",
    //     isChecked: false
    //   }
    // ];
  }
  ngOnInit() {
    this.resetSub = this.resetSj.subscribe(reset => {
      if (reset) {
        this.init();
      }
    });
    this.init();
  }
  ngAfterViewInit() {
    this.unlimitRadioSub = this.unlimitRadio.ionSelect.subscribe(
      (c: CustomEvent) => {
        // console.log(c);
        if (c.detail.checked) {
          this.airports.forEach(a => {
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
}
