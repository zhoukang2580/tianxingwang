import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FlightSegmentModel } from "../../models/flight/FlightSegmentModel";
import * as moment from "moment";
import { environment } from 'src/environments/environment';
import { SelectDateService } from '../../select-datetime/select-date.service';

@Component({
  selector: "app-fly-list-item",
  templateUrl: "./fly-list-item.component.html",
  styleUrls: ["./fly-list-item.component.scss"]
})
export class FlyListItemComponent implements OnInit {
  @Input()
  flightSegment: FlightSegmentModel;
  @Input()
  itmIndex: number;
  @Output()
  itemClick: EventEmitter<FlightSegmentModel>;
  showIndex=!environment.production;
  constructor(private dayService: SelectDateService) {
    this.itemClick = new EventEmitter();
  }
  onItemClick() {
    this.itemClick.emit(this.flightSegment);
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
