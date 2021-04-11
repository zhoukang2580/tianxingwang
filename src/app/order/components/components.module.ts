import { SwiperSlideContentComponent } from "./swiper-slide-content/swiper-slide-content.component";
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
import { SelectTicketPopoverComponent } from "./select-ticket-popover/select-ticket-popover.component";
import { CarItemComponent } from "./car-item/car-item.component";
import { TrainTripComponent } from "./train-trip/train-trip.component";
import { HotelTripComponent } from "./hotel-trip/hotel-trip.component";
import { FlightTripComponent } from "./flight-trip/flight-trip.component";
import { RefundFlightTicketTipComponent } from "./refund-flight-ticket-tip/refund-flight-ticket-tip.component";
import { UploadFileComponent } from './upload-file/upload-file.component';
import { HotelOrderPricePopoverComponent } from './hotel-order-price-popover/hotel-order-price-popover.component';
import { TrainOrderPricePopoverComponent } from './train-order-price-popover/train-order-price-popover.component';
import { TrainOrderDetailComponent } from './train-order-detail/train-order-detail.component';
import { FlightOrderDetailComponent } from './flight-order-detail/flight-order-detail.component';
import { HotelOrderDetailComponent } from './hotel-order-detail/hotel-order-detail.component';
import { InsuranceOrderDetailComponent } from './insurance-order-detail/insurance-order-detail.component';
import { TrainTripEnComponent } from './train-trip_en/train-trip_en.component';
import { FlightTripEnComponent } from './flight-trip_en/flight-trip_en.component';
import { HotelTripEnComponent } from './hotel-trip_en/hotel-trip_en.component';
import { OrderItemEnComponent } from './order-item_en/order-item_en.component';
import { FlightOrderDetailEnComponent } from './flight-order-detail_en/flight-order-detail_en.component';
import { OrderItemPricePopoverEnComponent } from './order-item-price-popover_en/order-item-price-popover_en.component';
import { SearchTicketModalEnComponent } from './search-ticket-modal_en/search-ticket-modal_en.component';
import { CarItemEnComponent } from './car-item-en/car-item-en.component';
import { OrderItemDfComponent } from './order-item-df/order-item-df.component';
import { CarItemDfComponent } from "./car-item-df/car-item-df.component";
import { GetsmscodeComponent } from "./getsmscode/getsmscode.component";

@NgModule({
  declarations: [
    OrderItemComponent,
    OrderItemEnComponent,
    OrderItemDfComponent,
    CarItemComponent,
    CarItemDfComponent,
    OrderItemPricePopoverComponent,
    OrderItemPricePopoverEnComponent,
    HotelOrderPricePopoverComponent,
    TrainOrderPricePopoverComponent,
    UploadFileComponent,
    GetsmscodeComponent,
    SendMsgComponent,
    SendEmailComponent,
    TripRulePopoverComponent,
    SearchTicketModalComponent,
    SearchTicketModalEnComponent,
    SelectTicketPopoverComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    FlightOrderDetailEnComponent,
    HotelOrderDetailComponent,
    InsuranceOrderDetailComponent,
    TrainTripComponent,
    TrainTripEnComponent,
    HotelTripComponent,
    HotelTripEnComponent,
    FlightTripComponent,
    FlightTripEnComponent,
    SwiperSlideContentComponent,
    RefundFlightTicketTipComponent,
    CarItemEnComponent
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
    CarItemEnComponent,
    OrderItemEnComponent,
    OrderItemDfComponent,
    UploadFileComponent,
    CarItemComponent,
    CarItemDfComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    FlightOrderDetailEnComponent,
    HotelOrderDetailComponent,
    InsuranceOrderDetailComponent,
    SwiperSlideContentComponent,
    TrainTripComponent,
    TrainTripEnComponent,
    HotelTripComponent,
    HotelTripEnComponent,
    RefundFlightTicketTipComponent,
    FlightTripComponent,
    FlightTripEnComponent
  ]
})
export class OrderComponentsModule {}
