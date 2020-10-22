import { CalendarService } from "./../../../tmc/calendar.service";
import { Component, OnInit, Input } from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { OrderInsuranceType } from "src/app/insurance/models/OrderInsuranceType";

@Component({
  selector: "app-train-trip",
  templateUrl: "./train-trip.component.html",
  styleUrls: ["./train-trip.component.scss"],
})
export class TrainTripComponent implements OnInit {
  @Input() trip: OrderTripModel;
  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    this.initTime();
  }
  private initTime() {
    if (this.trip) {
      this.trip["goDate"] = this.getDate();
      this.trip.StartTime = this.getHHmm(this.trip.StartTime);
      this.trip.EndTime = this.getHHmm(this.trip.EndTime);
      this.trip["trainProducts"] = this.getTrainProducts();
    }
  }
  private getDate() {
    const str =
      (this.trip &&
        this.trip.StartTime &&
        this.trip.StartTime.replace("T", " ")) ||
      "";
    return `${str.substr(0, 4)}年${str.substr(5, 2)}月${str.substr(
      "yyyy-mm-".length,
      2
    )}日 ${this.calendarService.getDescOfDate(
      str.substr(0, "yyyy-mm-dd".length)
    )}`;
  }
  private getHHmm(time: string) {
    const str = (time && time.replace("T", " ")) || "";
    return str.substr("yyyy-mm-ddT".length, "hh:mm".length);
  }
  private getTrainProducts() {
    const orderTrip = this.trip;
    const types = [OrderInsuranceType.TrainAccident];
    if (!orderTrip || !orderTrip.InsuranceResult) {
      return [];
    }
    return orderTrip.InsuranceResult.Products.filter((it) =>
      types.some((t) => t == it.InsuranceType)
    );
  }
}
