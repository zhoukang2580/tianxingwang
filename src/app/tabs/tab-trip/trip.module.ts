import { FlightTripComponent } from './flight-trip/flight-trip.component';
import { HotelTripComponent } from './hotel-trip/hotel-trip.component';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TripPage } from "./trip.page";
import { TripBuyInsuranceComponent } from './trip-buy-insurance/trip-buy-insurance.component';
import { TrainTripComponent } from './train-trip/train-trip.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: TripPage }]),
    AppComponentsModule
  ],
  declarations: [TripPage,TripBuyInsuranceComponent,TrainTripComponent,HotelTripComponent,FlightTripComponent],
  entryComponents:[TripBuyInsuranceComponent]
})
export class TripPageModule {}
