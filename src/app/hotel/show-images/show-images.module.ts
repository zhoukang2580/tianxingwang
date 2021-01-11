import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from "@angular/router";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { ShowImagesPage } from "./show-images.page";
import { StylePageGuard } from 'src/app/guards/style-page.guard';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: ShowImagesPage,
        canActivate:[StylePageGuard]
      }
    ])
  ],
  declarations: [ShowImagesPage],
  exports: []
})
export class ShowImagesPageModule {}
