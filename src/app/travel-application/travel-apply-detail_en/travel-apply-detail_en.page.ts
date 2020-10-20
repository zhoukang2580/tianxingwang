import { Router } from "@angular/router";
import { TaskStatusType } from "../../workflow/models/TaskStatusType";
import { async } from "@angular/core/testing";
import { Component, OnInit, OnDestroy, Input, OnChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { TmcService } from "src/app/tmc/tmc.service";
import { FlightService } from "src/app/flight/flight.service";
import { TrainService } from "src/app/train/train.service";
import { HotelService } from "src/app/hotel/hotel.service";
import { InternationalHotelService } from "src/app/hotel-international/international-hotel.service";
import { TravelApplyDetailPage } from '../travel-apply-detail/travel-apply-detail.page';

@Component({
  selector: "app-travel-apply-detail_en",
  templateUrl: "./travel-apply-detail_en.page.html",
  styleUrls: ["./travel-apply-detail_en.page.scss"],
})
export class TravelApplyDetailEnPage extends TravelApplyDetailPage {
  
}
