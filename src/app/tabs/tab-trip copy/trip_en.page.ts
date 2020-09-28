import { TabsPage } from "./../tabs.page";
import { ActivatedRoute, NavigationStart } from "@angular/router";
import { TripBuyInsuranceComponent } from "./trip-buy-insurance/trip-buy-insurance.component";
import { Platform, ModalController } from "@ionic/angular";
import { TmcService } from "src/app/tmc/tmc.service";
import { Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { OrderEntity } from "src/app/order/models/OrderEntity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { CalendarService } from "./../../tmc/calendar.service";
import { finalize, map, filter } from "rxjs/operators";
import { Subscription, interval, of } from "rxjs";
import { IonRefresher, IonInfiniteScroll } from "@ionic/angular";
import { OrderModel } from "./../../order/models/OrderModel";
import { ApiService } from "./../../services/api/api.service";
import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  Optional,
} from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { OrderInsuranceType } from "src/app/insurance/models/OrderInsuranceType";
import { OrderInsuranceStatusType } from "src/app/order/models/OrderInsuranceStatusType";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { environment } from "src/environments/environment";
import { TravelModel } from "src/app/order/models/TravelModel";
import { RefresherComponent } from "src/app/components/refresher";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { OrderFlightTicketType } from 'src/app/order/models/OrderFlightTicketType';
import { TripPage } from '../tab-trip/trip.page';
@Component({
  selector: "app-trip",
  templateUrl: "trip_en.page.html",
  styleUrls: ["trip_en.page.scss"],
})
export class TripEnPage extends TripPage{
 
}
