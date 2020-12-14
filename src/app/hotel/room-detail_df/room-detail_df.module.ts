import { AppComponentsModule } from "../../components/appcomponents.module";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { RoomDetailDfPage } from "./room-detail_df.page";

@NgModule({
  declarations: [RoomDetailDfPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: RoomDetailDfPage
      }
    ])
  ]
})
export class RoomDetailDfPageModule {}
