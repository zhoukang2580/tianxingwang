import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import {
  InternationalFlightService,
  IFilterCondition,
  ITripInfo,
  IInternationalFlightSearchModel,
  FlightVoyageType,
} from "../international-flight.service";
import { RefresherComponent } from "src/app/components/refresher";
import { finalize } from "rxjs/operators";
import { Subscription } from "rxjs";
import {
  ModalController,
  PopoverController,
  IonInfiniteScroll,
  IonContent,
} from "@ionic/angular";
import { FlightDialogComponent } from "../components/flight-dialog/flight-dialog.component";
import { FlightResultEntity } from "src/app/flight/models/FlightResultEntity";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { FlightTransferComponent } from "../components/flight-transfer/flight-transfer.component";
import { environment } from "src/environments/environment";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";
import { RefundChangeDetailComponent } from "../components/refund-change-detail/refund-change-detail.component";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { FlightFareRuleEntity } from "src/app/flight/models/FlightFareRuleEntity";
import { FlightListPage } from 'src/app/flight/flight-list/flight-list.page';
interface Iisblue {
  isshow: false;
}
@Component({
  selector: "app-flight-list",
  templateUrl: "./flight-list_en.page.html",
  styleUrls: ["./flight-list_en.page.scss"],
})
export class FlightListEnPage extends FlightListPage{
  
}
