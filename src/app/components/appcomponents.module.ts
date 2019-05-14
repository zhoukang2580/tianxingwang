import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrComponent } from './or/or.component';
import { CropImageComponent } from './crop-image/crop-image.component';
import {ImageCropperModule} from "ngx-image-cropper";
@NgModule({
  declarations: [OrComponent,CropImageComponent],
  imports: [
    CommonModule,
    IonicModule,
    ImageCropperModule
  ],
  exports:[OrComponent,CropImageComponent]
})
export class AppcomponentsModule { }
