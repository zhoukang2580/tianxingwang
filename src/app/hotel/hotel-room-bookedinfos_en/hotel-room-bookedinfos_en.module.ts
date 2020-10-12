import { StylePageGuard } from './../../guards/style-page.guard';
import { AppComponentsModule } from "../../components/appcomponents.module";
import { HotelComponentsModule } from "../components/components.module";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { HotelRoomBookedinfosEnPage } from "./hotel-room-bookedinfos_en.page";

@NgModule({
  declarations: [HotelRoomBookedinfosEnPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HotelComponentsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: HotelRoomBookedinfosEnPage,
        canActivate: [StylePageGuard]
      }
    ])
  ]
})
export class HotelRoomBookedInfosEnPageModule {}
