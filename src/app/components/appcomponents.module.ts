import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrComponent } from './or/or.component';
import { CropImageComponent } from './crop-image/crop-image.component';
@NgModule({
  declarations: [OrComponent,CropImageComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports:[OrComponent,CropImageComponent]
})
export class AppcomponentsModule { }
