import { HrService } from "../../../hr/hr.service";
import { TrainSeatEntity } from "./../../models/TrainSeatEntity";
import { TrainService, TrainPolicyModel } from "./../../train.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { ModalController } from "@ionic/angular";
import { Observable, of, combineLatest, from } from "rxjs";
import { EventEmitter } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import * as moment from "moment";
import { TrainEntity } from "../../models/TrainEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { ITrainInfo } from "../../train.service";
import { LanguageHelper } from "src/app/languageHelper";
import { tap, map, filter } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import { SelectedTrainSegmentInfoComponent } from '../selected-train-segment-info/selected-train-segment-info.component';
@Component({
  selector: "app-selected-train-segment-info_en",
  templateUrl: "./selected-train-segment-info_en.component.html",
  styleUrls: ["./selected-train-segment-info_en.component.scss"]
})
export class SelectedTrainSegmentInfoEnComponent extends SelectedTrainSegmentInfoComponent {
 
}
