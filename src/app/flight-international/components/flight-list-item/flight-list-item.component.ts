import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";

@Component({
  selector: "app-flight-list-item",
  templateUrl: "./flight-list-item.component.html",
  styleUrls: ["./flight-list-item.component.scss"],
})
export class FlightListItemComponent implements OnInit, OnChanges {
  @Input() flightRoute: FlightRouteEntity;
  @Output() transfer: EventEmitter<any>;
  fr: FlightRouteEntity;
  constructor() {
    this.transfer = new EventEmitter();
  }
  onTransfer(event: CustomEvent) {
    event.stopPropagation();
    this.transfer.emit();
  }
  ngOnInit() {}
  ngOnChanges(c: SimpleChanges) {
    if (c && c.flightRoute && c.flightRoute.currentValue) {
      this.initFr();
    }
  }
  private initFr() {
    if (this.flightRoute) {
      this.fr = {
        ...this.flightRoute,
        FirstTime: this.getTime(this.flightRoute.FirstTime),
        ArrivalTime: this.getTime(this.flightRoute.ArrivalTime),
        fromSegment: {
          ...this.flightRoute.fromSegment,
          FromAirportName: this.getAirName(
            this.flightRoute.fromSegment &&
              this.flightRoute.fromSegment.FromAirportName
          ),
        },
        toSegment: {
          ...this.flightRoute.toSegment,
          ToAirportName: this.getAirName(
            this.flightRoute.toSegment &&
              this.flightRoute.toSegment.ToAirportName
          ),
        },
      };
    }
  }
  private getTime(t: string) {
    if (t) {
      return t.replace("T", " ").substring(10, 16);
    }
    return t;
  }
  private getAirName(name: string) {
    if (name) {
      return name.replace("国际机场", "").replace("机场", "");
    }
    return name;
  }
}
