import { AppComponentsModule } from "../../components/appcomponents.module";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { RoomDetailDfPage } from "./room-detail_df.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

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
        component: RoomDetailDfPage,
        canActivate: [StylePageGuard]
      }
    ])
  ]
})
export class RoomDetailDfPageModule {}
