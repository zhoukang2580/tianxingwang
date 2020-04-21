import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TripPage } from "./trip.page";
import { TripBuyInsuranceComponent } from "./trip-buy-insurance/trip-buy-insurance.component";
import { OrderComponentsModule } from "src/app/order/components/components.module";
import { InsurancOpenUrlComponent } from './insuranc-open-url/insuranc-open-url.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: TripPage }]),
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [TripPage, TripBuyInsuranceComponent,InsurancOpenUrlComponent]
})
export class TripPageModule {}
