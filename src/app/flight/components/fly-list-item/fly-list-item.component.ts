import { CalendarService } from "src/app/tmc/calendar.service";
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
  ElementRef,
} from "@angular/core";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { FlightSegmentEntity } from "../../models/flight/FlightSegmentEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { FlightPolicy } from "../../models/PassengerFlightInfo";
import { FlightFareType } from "../../models/flight/FlightFareType";
import { FlightCabinFareType } from "../../models/flight/FlightCabinFareType";
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: "app-fly-list-item",
  templateUrl: "./fly-list-item.component.html",
  styleUrls: ["./fly-list-item.component.scss"],
})
export class FlyListItemComponent implements OnInit, AfterViewInit, OnChanges {
  FlightFareType = FlightFareType;
  @Input() flightSegment: FlightSegmentEntity;
  @Input() showDetails: boolean;
  @Input() itmIndex: number;
  @Input() flightPolicy: FlightPolicy;
  @Input() langOpt: any = {
    meal: "餐食",
    isStop: "经停",
    directFly: "直飞",
    no: "无",
    common: "共享",
    agreement: "协",
    agreementDesc: "协议价",
    planeType: "机型",
    lowestPrice: "最低价",
    lowestPriceRecommend: "最低价推荐",
  };
  showIndex = !environment.production;
  isAgreement = false;
  constructor(private calendarService: CalendarService) {}
  ngOnChanges(changes: SimpleChanges) {}
  ngAfterViewInit() {}
  addoneday() {
    if (
      !this.flightSegment ||
      !this.flightSegment.ArrivalTime ||
      !this.flightSegment.TakeoffTime
    ) {
      return;
    }
    const addDay =
      moment(this.flightSegment.ArrivalTime).date() -
      moment(this.flightSegment.TakeoffTime).date();
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
  ngOnInit() {
    if (
      this.flightSegment &&
      this.flightSegment.Cabins &&
      this.flightSegment.Cabins.some(
        (it) => it.FareType == FlightCabinFareType.Agreement
      )
    ) {
      this.isAgreement = true;
    }
  }
  onShowAgreement(evt:CustomEvent){
    evt.stopPropagation();
    AppHelper.alert(this.langOpt.agreementDesc,false,LanguageHelper.getConfirmTip());
  }
}
