import { OriginalFlightTripComponent } from './original-flight-trip/original-flight-trip.component';
import { SearchTicketModalComponent } from "./search-ticket-modal/search-ticket-modal.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SelectTrainStationModalComponent } from "./select-stations/select-station.component";
import { SelectAirportsModalComponent } from "./select-airports/select-airports.component";
import { IonicModule } from "@ionic/angular";
import { ProductInsuranceComponent } from "./product-insurance/product-insurance.component";
import { ProductHotelComponent } from "./product-hotel/product-hotel.component";
import { ProductTrainComponent } from "./product-train/product-train.component";
import { ProductPlaneComponent } from "./product-plane/product-plane.component";
import { OrderItemComponent } from "./order-item/order-item.component";
import { FlightTripComponent } from "./flight-trip/flight-trip.component";
import { FlightPipesModule } from "src/app/flight/pipes/Pipes.module";
import { OrderItemPricePopoverComponent } from './order-item-price-popover/order-item-price-popover.component';
import { TripRulePopoverComponent } from './trip-rule-popover/trip-rule-popover.component';
import { SendEmailComponent } from './send-email/send-email.component';
import { SendMsgComponent } from './send-msg/send-msg.component';

@NgModule({
  declarations: [
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent,
    ProductPlaneComponent,
    ProductTrainComponent,
    ProductHotelComponent,
    ProductInsuranceComponent,
    FlightTripComponent,
    OrderItemComponent,
    OrderItemPricePopoverComponent,
    TripRulePopoverComponent,
    OriginalFlightTripComponent,
    SendEmailComponent,
    SendMsgComponent,
  ],
  imports: [CommonModule, IonicModule, FormsModule, FlightPipesModule],
  exports: [
    OriginalFlightTripComponent,
    SearchTicketModalComponent,
    ProductPlaneComponent,
    ProductTrainComponent,
    ProductHotelComponent,
    ProductInsuranceComponent,
    OrderItemComponent,
    FlightTripComponent
  ],
  entryComponents: [
    SendMsgComponent,
    SendEmailComponent,
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent,
    OrderItemPricePopoverComponent,
    TripRulePopoverComponent
  ]
})
export class TmcComponentsModule {}
