import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrComponent } from './or/or.component';
import { PinchZoomComponent } from './pinch-zoom/pinch-zoom.component';
import { SlidvalidateComponent } from './slidvalidate/slidvalidate.component';
@NgModule({
  declarations: [OrComponent, PinchZoomComponent,SlidvalidateComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [OrComponent, PinchZoomComponent,SlidvalidateComponent]
})
export class AppcomponentsModule { }
