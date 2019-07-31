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

@NgModule({
  declarations: [
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent,
    ProductPlaneComponent,
    ProductTrainComponent,
    ProductHotelComponent,
    ProductInsuranceComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [
    SearchTicketModalComponent,
    ProductPlaneComponent,
    ProductTrainComponent,
    ProductHotelComponent,
    ProductInsuranceComponent
  ],
  entryComponents: [
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent
  ]
})
export class TmcComponentsModule {}
