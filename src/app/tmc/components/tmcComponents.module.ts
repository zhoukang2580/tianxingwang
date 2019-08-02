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
    OrderItemPricePopoverComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule, FlightPipesModule],
  exports: [
    SearchTicketModalComponent,
    ProductPlaneComponent,
    ProductTrainComponent,
    ProductHotelComponent,
    ProductInsuranceComponent,
    OrderItemComponent,
    FlightTripComponent
  ],
  entryComponents: [
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent,
    OrderItemPricePopoverComponent
  ]
})
export class TmcComponentsModule {}
