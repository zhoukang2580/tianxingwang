import { FlightPolicy } from './../../flight.service';
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
import { SelectDateService } from "../../select-date/select-date.service";
import { FlightSegmentEntity } from "../../models/flight/FlightSegmentEntity";
import { LanguageHelper } from "src/app/languageHelper";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { ModalController, DomController } from "@ionic/angular";

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
    private dayService: SelectDateService,
    private render: Renderer2,
    private domCtrl: DomController
  ) {
  }
  ngOnChanges(changes: SimpleChanges) {
  }
  ngAfterViewInit() {}
  addoneday() {
    const addDay =
      moment(this.flightSegment.ArrivalTime).date() -
      moment(this.flightSegment.TakeoffTime).date();
    // console.log(addDay);
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
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
