import { environment } from "./../../../../environments/environment";
import { OrderFlightTripEntity } from "./../../models/OrderFlightTripEntity";
import { TrainService } from "./../../../train/train.service";
import { CalendarService } from "./../../../tmc/calendar.service";
import { AppHelper } from "src/app/appHelper";
import { TmcEntity } from "src/app/tmc/tmc.service";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import { OrderTravelPayType } from "../../models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "../../models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "../../models/OrderTrainTicketStatusType";
import { OrderFlightTicketEntity } from "../../models/OrderFlightTicketEntity";
import { OrderTrainTicketEntity } from "../../models/OrderTrainTicketEntity";
import { TrainBookType } from "src/app/train/models/TrainBookType";
import { OrderHotelStatusType } from "../../models/OrderHotelEntity";
import { HotelPaymentType } from "src/app/hotel/models/HotelPaymentType";
import { TrainSupplierType } from "src/app/train/models/TrainSupplierType";
import { Router } from "@angular/router";
import { OrderPassengerEntity } from "../../models/OrderPassengerEntity";
import { OrderFlightTicketType } from "../../models/OrderFlightTicketType";
import {
  PopoverController,
  PickerController,
  IonDatetime,
} from "@ionic/angular";
import { RefundFlightTicketTipComponent } from "../refund-flight-ticket-tip/refund-flight-ticket-tip.component";
import { OrderService } from "../../order.service";
import { LanguageHelper } from "src/app/languageHelper";
import { DayModel } from "src/app/tmc/models/DayModel";
import { tick } from "@angular/core/testing";
import { OrderItemComponent } from '../order-item/order-item.component';
@Component({
  selector: "app-order-item_en",
  templateUrl: "./order-item_en.component.html",
  styleUrls: ["./order-item_en.component.scss"],
})
export class OrderItemEnComponent extends OrderItemComponent {
  }
