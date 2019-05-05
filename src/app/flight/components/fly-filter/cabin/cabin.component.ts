import { CabinTypeEnum } from "./../../../models/flight/CabinTypeEnum";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit
} from "@angular/core";
import { IonRadio } from "@ionic/angular";
import { FlightJouneyModel } from "../../../models/flight/FlightJouneyModel";
import { Subscription, Subject } from "rxjs";
import { CabintypePipe } from "../../../pipes/cabintype.pipe";
import { SearchTypeModel } from "../../../models/flight/advanced-search-cond/SearchTypeModel";

@Component({
  selector: "app-cabin",
  templateUrl: "./cabin.component.html",
  styleUrls: ["./cabin.component.scss"]
})
export class CabinComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  resetSj: Subject<boolean>;
  resetSub = Subscription.EMPTY;
  @Input()
  flights: FlightJouneyModel[];
  @ViewChild("unlimitRadio")
  unlimitRadio: IonRadio;
  unlimitRadioSub = Subscription.EMPTY;
  cabins: SearchTypeModel[];
  @Output()
  userOp: EventEmitter<boolean>; // 用户是否点击过
  @Output()
  sCond: EventEmitter<any>; //  搜索条件
  constructor(private cabinPipe: CabintypePipe) {
    // console.log("cabinPip",this.cabinPipe);
    this.userOp = new EventEmitter();
    this.sCond = new EventEmitter();
  }
  onUnlimit() {
    this.userOp.emit(this.cabins.some(a => a.isChecked));
    this.sCond.emit(this.cabins.filter(c=>c.isChecked));// 返回选中的
    return this.cabins.every(a => !a.isChecked);
  }
  init() {
    this.cabins = [];
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          if (
            !this.cabins.find(a => CabinTypeEnum[a.id] === s.LowestCabinType)
          ) {
            this.cabins.push({
              id: CabinTypeEnum[s.LowestCabinType],
              label: this.cabinPipe.transform(s.LowestCabinType),
              isChecked: false
            });
          }
        });
      });
    });
  }
  ngAfterViewInit() {
    this.unlimitRadioSub = this.unlimitRadio.ionSelect.subscribe(
      (c: CustomEvent) => {
        // console.log(c);
        if (c.detail.checked) {
          this.cabins.forEach(a => {
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
  ngOnInit() {
    this.resetSub = this.resetSj.subscribe(reset => {
      if (reset) {
        this.init();
      }
    });
    this.init();
  }
}
