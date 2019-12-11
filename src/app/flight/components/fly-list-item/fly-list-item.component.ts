import { CalendarService } from 'src/app/tmc/calendar.service';
import { FlightCabinEntity } from "./../../models/flight/FlightCabinEntity";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef
} from "@angular/core";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { FlightSegmentEntity } from "../../models/flight/FlightSegmentEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { FlightPolicy } from '../../models/PassengerFlightInfo';

@Component({
  selector: "app-fly-list-item",
  templateUrl: "./fly-list-item.component.html",
  styleUrls: ["./fly-list-item.component.scss"],
})
export class FlyListItemComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() flightSegment: FlightSegmentEntity;
  @Input() showDetails: boolean;
  @Input() itmIndex: number;
  @Input() flightPolicy: FlightPolicy;
  showIndex = !environment.production;
  constructor(
    private calendarService: CalendarService
  ) {
  }
  ngOnChanges(changes: SimpleChanges) {
  }
  ngAfterViewInit() { }
  addoneday() {
    if (!this.flightSegment || !this.flightSegment.ArrivalTime || !this.flightSegment.TakeoffTime) {
      return;
    }
    const addDay = moment(this.flightSegment.ArrivalTime).date() - moment(this.flightSegment.TakeoffTime).date();
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  getDateWeek() {
    const d = this.calendarService.generateDayModel(
      moment(this.flightSegment.TakeoffTime)
    );
    return `${d.date.substring(
      "2018-".length,
      d.date.length
    )} ${this.calendarService.getWeekName(d)}`;
  }
  ngOnInit() { }

}
