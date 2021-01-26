import { AppComponentsModule } from "./../../components/appcomponents.module";
import { HotelComponentsModule } from "./../components/components.module";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { HotelRoomBookedinfosPage } from "./hotel-room-bookedinfos.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

@NgModule({
  declarations: [HotelRoomBookedinfosPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HotelComponentsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: HotelRoomBookedinfosPage,
        canActivate: [StylePageGuard]
      }
    ])
  ]
})
export class HotelRoomBookedInfosPageModule {}
