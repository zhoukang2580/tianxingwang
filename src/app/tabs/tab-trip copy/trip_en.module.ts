import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { Route, RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TripEnPage } from "./trip_en.page";
import { TripBuyInsuranceComponent } from "./trip-buy-insurance/trip-buy-insurance.component";
import { OrderComponentsModule } from "src/app/order/components/components.module";
import { InsurancOpenUrlComponent } from './insuranc-open-url/insuranc-open-url.component';
import { StylePageGuard } from 'src/app/guards/style-page.guard';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: TripEnPage ,canActivate: [StylePageGuard]}]),
    AppComponentsModule,
    OrderComponentsModule
  ],
  declarations: [TripEnPage, TripBuyInsuranceComponent,InsurancOpenUrlComponent]
})
export class TripEnPageModule {}
