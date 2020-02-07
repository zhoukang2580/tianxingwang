import { AppComponentsModule } from "../../components/appcomponents.module";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { InternationalRoomDetailPage } from "./international-room-detail.page";

@NgModule({
  declarations: [InternationalRoomDetailPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: InternationalRoomDetailPage
      }
    ])
  ]
})
export class InternationalRoomDetailPageModule {}
