import { AppDirectivesModule } from "src/app/directives/directives.module";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OrderItemComponent } from "./order-item/order-item.component";
import { OrderItemPricePopoverComponent } from "./order-item-price-popover/order-item-price-popover.component";
import { SendMsgComponent } from "./send-msg/send-msg.component";
import { SendEmailComponent } from "./send-email/send-email.component";
import { SearchTicketModalComponent } from "./search-ticket-modal/search-ticket-modal.component";
import { TripRulePopoverComponent } from "./trip-rule-popover/trip-rule-popover.component";
import { FlightModule } from "src/app/flight/flight.module";
import { ProductHotelComponent } from "./product-hotel/product-hotel.component";
import { ProductInsuranceComponent } from "./product-insurance/product-insurance.component";
import { ProductTrainComponent } from "./product-train/product-train.component";
import { ProductPlaneComponent } from "./product-plane/product-plane.component";
import { SelectTicketPopoverComponent } from "./select-ticket-popover/select-ticket-popover.component";
import { OrderTrainTripComponent } from "./order-train-trip/order-train-trip.component";
import { OrderTripItemComponent } from './order-trip-item/order-trip-item.component';
import { TrainOrderDetailComponent } from 'src/app/order/components/train-order-detail/train-order-detail.component';
import { FlightOrderDetailComponent } from './flight-order-detail/flight-order-detail.component';
import { HotelOrderDetailComponent } from './hotel-order-detail/hotel-order-detail.component';

@NgModule({
  declarations: [
    OrderItemComponent,
    OrderItemPricePopoverComponent,
    SendMsgComponent,
    SendEmailComponent,
    TripRulePopoverComponent,
    SearchTicketModalComponent,
    ProductHotelComponent,
    ProductInsuranceComponent,
    ProductTrainComponent,
    ProductPlaneComponent,
    SelectTicketPopoverComponent,
    OrderTrainTripComponent,
    OrderTripItemComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    HotelOrderDetailComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FlightModule,
    AppDirectivesModule
  ],
  exports: [
    OrderItemComponent,
    OrderTrainTripComponent,
    OrderTripItemComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    HotelOrderDetailComponent
  ],
  entryComponents: [
    SearchTicketModalComponent,
    OrderItemPricePopoverComponent,
    SendMsgComponent,
    SendEmailComponent,
    SearchTicketModalComponent,
    TripRulePopoverComponent,
    SelectTicketPopoverComponent
  ]
})
export class OrderComponentsModule { }
