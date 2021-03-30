import { AppComponentsModule } from "../../components/appcomponents.module";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { InternationalRoomDetailDfPage } from "./international-room-detail-df.page";
import { StylePageGuard } from "src/app/guards/style-page.guard";

@NgModule({
  declarations: [InternationalRoomDetailDfPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: InternationalRoomDetailDfPage,
        canActivate: [StylePageGuard],
      },
    ]),
  ],
})
export class InternationalRoomDetailDfPageModule {}
