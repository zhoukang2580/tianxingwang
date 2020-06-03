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
import { TrainOrderDetailComponent } from "src/app/order/components/train-order-detail/train-order-detail.component";
import { FlightOrderDetailComponent } from "./flight-order-detail/flight-order-detail.component";
import { HotelOrderDetailComponent } from "./hotel-order-detail/hotel-order-detail.component";
import { InsuranceOrderDetailComponent } from "./insurance-order-detail/insurance-order-detail.component";
import { CarItemComponent } from "./car-item/car-item.component";
import { TrainTripComponent } from "./train-trip/train-trip.component";
import { HotelTripComponent } from "./hotel-trip/hotel-trip.component";
import { FlightTripComponent } from "./flight-trip/flight-trip.component";
import { RefundFlightTicketTipComponent } from "./refund-flight-ticket-tip/refund-flight-ticket-tip.component";
import { UploadFileComponent } from './upload-file/upload-file.component';
import { HotelOrderPricePopoverComponent } from './hotel-order-price-popover/hotel-order-price-popover.component';
import { TrainOrderPricePopoverComponent } from './train-order-price-popover/train-order-price-popover.component';

@NgModule({
  declarations: [
    OrderItemComponent,
    CarItemComponent,
    OrderItemPricePopoverComponent,
    HotelOrderPricePopoverComponent,
    TrainOrderPricePopoverComponent,
    UploadFileComponent,
    SendMsgComponent,
    SendEmailComponent,
    TripRulePopoverComponent,
    SearchTicketModalComponent,
    SelectTicketPopoverComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    HotelOrderDetailComponent,
    InsuranceOrderDetailComponent,
    TrainTripComponent,
    HotelTripComponent,
    FlightTripComponent,
    SwiperSlideContentComponent,
    RefundFlightTicketTipComponent
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
    UploadFileComponent,
    CarItemComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    HotelOrderDetailComponent,
    InsuranceOrderDetailComponent,
    SwiperSlideContentComponent,
    TrainTripComponent,
    HotelTripComponent,
    RefundFlightTicketTipComponent,
    FlightTripComponent
  ]
})
export class OrderComponentsModule {}
