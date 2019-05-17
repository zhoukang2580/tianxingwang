import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrComponent } from './or/or.component';
import { PinchZoomComponent } from './pinch-zoom/pinch-zoom.component';
@NgModule({
  declarations: [OrComponent, PinchZoomComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [OrComponent, PinchZoomComponent]
})
export class AppcomponentsModule { }
