import { StaffService } from 'src/app/hr/staff.service';
import { IonRadio } from "@ionic/angular";
import { Subscription } from "rxjs";
import { FilterConditionModel } from "./../../../models/flight/advanced-search-cond/FilterConditionModel";
import { FlightService } from "src/app/flight/flight.service";
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
  SimpleChanges
} from "@angular/core";
import { CabintypePipe } from "../../../pipes/cabintype.pipe";
import { FlightJourneyEntity } from "src/app/flight/models/flight/FlightJourneyEntity";
import { FlightCabinType } from "src/app/flight/models/flight/FlightCabinType";
import { SearchTypeModel } from "src/app/flight/models/flight/advanced-search-cond/SearchTypeModel";

@Component({
  selector: "app-cabin",
  templateUrl: "./cabin.component.html",
  styleUrls: ["./cabin.component.scss"]
})
export class CabinComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() flights: FlightJourneyEntity[];
  @Output() sCond: EventEmitter<any>; // 搜索条件
  cabins: SearchTypeModel[] = [];
  isUnlimitRadioChecked = true;
  isSelf = true;
  constructor(private cabinPipe: CabintypePipe, private staffService: StaffService) {
    this.sCond = new EventEmitter();
  }
  onUnlimit() {
    this.reset();
    return this.cabins.every(a => !a.isChecked);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.flights && changes.flights.currentValue) {
      this.init();
    }
  }
  reset() {
    if (this.cabins) {
      this.cabins=this.cabins.map(c => {
        c.isChecked = false;
        return c;
      });
      this.onSearch();
    }
  }
  onionChange(evt:CustomEvent) {
    this.cabins=this.cabins.map(it=>{
      if(evt.detail){
        it.isChecked=it.id==evt.detail.value;
      }
      return it;
    })
    this.isUnlimitRadioChecked = !this.cabins.some(item => item.isChecked);
    this.onSearch();
  }
  onSearch() {
    this.sCond.emit(this.cabins.filter(t => t.isChecked));
  }
  private init() {
    this.cabins = [];
    this.flights.forEach(f => {
      f.FlightRoutes.forEach(r => {
        r.FlightSegments.forEach(s => {
          s.Cabins.forEach(c => {
            if (
              !this.cabins.find(
                a => a.label == c.TypeName
              )
            ) {
              this.cabins.push({
                id: c.Type,
                label: c.TypeName,
                isChecked: false
              });
            }
          });
        });
      });
    });
    this.cabins = this.cabins.filter(c => [
      FlightCabinType.Y,
      FlightCabinType.SeniorY,
      FlightCabinType.C,
      FlightCabinType.F
    ].some(it => +it == +c.id));
  }
  ngAfterViewInit() { }
  ngOnDestroy() { }
  async ngOnInit() {
    this.isSelf = await this.staffService.isSelfBookType();
  }
}
