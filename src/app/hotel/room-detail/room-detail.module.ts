import { AppComponentsModule } from "./../../components/appcomponents.module";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { RoomDetailPage } from "./room-detail.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

@NgModule({
  declarations: [RoomDetailPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: RoomDetailPage,
        canActivate: [StylePageGuard]
      }
    ])
  ]
})
export class RoomDetailPageModule {}
