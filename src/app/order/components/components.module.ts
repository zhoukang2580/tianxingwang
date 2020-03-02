import { SwiperSlideContentComponent } from './swiper-slide-content/swiper-slide-content.component';
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
import { TrainOrderDetailComponent } from 'src/app/order/components/train-order-detail/train-order-detail.component';
import { FlightOrderDetailComponent } from './flight-order-detail/flight-order-detail.component';
import { HotelOrderDetailComponent } from './hotel-order-detail/hotel-order-detail.component';
import { InsuranceOrderDetailComponent } from './insurance-order-detail/insurance-order-detail.component';
import { MyTripComponent } from './my-trip/my-trip.component';
import { CarItemComponent } from './car-item/car-item.component';

@NgModule({
  declarations: [
    OrderItemComponent,
    CarItemComponent,
    OrderItemPricePopoverComponent,
    SendMsgComponent,
    SendEmailComponent,
    TripRulePopoverComponent,
    SearchTicketModalComponent,
    SelectTicketPopoverComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    HotelOrderDetailComponent,
    InsuranceOrderDetailComponent,
    MyTripComponent,
    SwiperSlideContentComponent
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
    CarItemComponent,
    TrainOrderDetailComponent,
    FlightOrderDetailComponent,
    HotelOrderDetailComponent,
    InsuranceOrderDetailComponent,
    MyTripComponent,
    SwiperSlideContentComponent
  ]
})
export class OrderComponentsModule { }
