import { DirectivesModule } from "src/app/directives/directives.module";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { FlightComponentsModule } from "src/app/flight/components/components.module";
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
import { ProductTrainComponent } from './product-train/product-train.component';
import { ProductPlaneComponent } from './product-plane/product-plane.component';

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
    ProductPlaneComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FlightModule,
    DirectivesModule
  ],
  exports: [OrderItemComponent],
  entryComponents: [
    SearchTicketModalComponent,
    TripRulePopoverComponent,
    OrderItemPricePopoverComponent,
    SendMsgComponent,
    SendEmailComponent,
    SearchTicketModalComponent,
    TripRulePopoverComponent
  ]
})
export class OrderComponentsModule {}
