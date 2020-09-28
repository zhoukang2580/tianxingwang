import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { RefresherComponent } from "../../components/refresher/refresher.component";
import { IdentityService } from "../../services/identity/identity.service";
import { OrderTripModel } from "../models/OrderTripModel";
import { OrderService } from "../order.service";
import { ApiService } from "../../services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import { OrderModel } from "src/app/order/models/OrderModel";
import {
  TmcEntity,
  TmcService,
  PassengerBookInfo,
} from "../../tmc/tmc.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ModalController,
  IonInfiniteScroll,
  IonRefresher,
  IonContent,
  IonDatetime,
  PickerController,
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  EventEmitter,
} from "@angular/core";
import { SearchTicketModalComponent } from "../components/search-ticket-modal/search-ticket-modal.component";
import { SearchTicketConditionModel } from "../../tmc/models/SearchTicketConditionModel";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "src/app/order/models/OrderTrainTicketStatusType";
import { OrderFlightTicketEntity } from "src/app/order/models/OrderFlightTicketEntity";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { finalize, take } from "rxjs/operators";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ORDER_TABS } from "../product-list/product-list.page";
import { PayService } from "src/app/services/pay/pay.service";
import { StaffService, StaffEntity } from "src/app/hr/staff.service";
import { FlightService } from "src/app/flight/flight.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { OrderFlightTripEntity } from "../models/OrderFlightTripEntity";
import { IFlightSegmentInfo } from "src/app/flight/models/PassengerFlightInfo";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { OrderListPage } from '../order-list/order-list.page';

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list_en.page.html",
  styleUrls: ["./order-list_en.page.scss"],
})
export class OrderListEnPage extends OrderListPage {
  
}
