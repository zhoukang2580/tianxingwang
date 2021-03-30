import { StylePageGuard } from 'src/app/guards/style-page.guard';
import { AppComponentsModule } from "../../components/appcomponents.module";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { InternationalRoomDetailEnPage } from "./international-room-detail_en.page";

@NgModule({
  declarations: [InternationalRoomDetailEnPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: InternationalRoomDetailEnPage,
        canActivate: [StylePageGuard]
      }
    ])
  ]
})
export class InternationalRoomDetailEnPageModule {}
