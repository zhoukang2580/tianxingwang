import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import * as moment from "moment";
import { environment } from 'src/environments/environment';
import { SelectDateService } from '../../select-date/select-date.service';
import { FlightSegmentEntity } from '../../models/flight/FlightSegmentEntity';
import { LanguageHelper } from 'src/app/languageHelper';

@Component({
  selector: "app-fly-list-item",
  templateUrl: "./fly-list-item.component.html",
  styleUrls: ["./fly-list-item.component.scss"]
})
export class FlyListItemComponent implements OnInit {
  @Input()
  flightSegment: FlightSegmentEntity;
  @Input()
  itmIndex: number;
  @Output()
  itemClick: EventEmitter<FlightSegmentEntity>;
  showIndex=!environment.production;
  constructor(private dayService: SelectDateService) {
    this.itemClick = new EventEmitter();
  }
  hasStopCities(){
    return this.flightSegment.StopCities.length>0;
  }
  onItemClick() {
    this.itemClick.emit(this.flightSegment);
  }
  addoneday(){
    const addDay=moment(this.flightSegment.ArrivalTime).date()-moment(this.flightSegment.TakeoffTime).date();
    // console.log(addDay);
    return addDay>0?"+"+addDay+LanguageHelper.getDayTip():"";
  }
  getDateWeek() {
    const d = this.dayService.generateDayModel(
      moment(this.flightSegment.TakeoffTime)
    );
    return `${d.date.substring(
      "2018-".length,
      d.date.length
    )} ${this.dayService.getWeekName(d)}`;
  }
  ngOnInit() {}
}
