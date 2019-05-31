import { HcpupdateComponent } from './hcpupdate/hcpupdate.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrComponent } from './or/or.component';
import { PinchZoomComponent } from './pinch-zoom/pinch-zoom.component';
import { SlidvalidateComponent } from './slidvalidate/slidvalidate.component';
import { ScanComponent } from './scan/scan.component';
@NgModule({
  declarations: [OrComponent, PinchZoomComponent, SlidvalidateComponent, ScanComponent,HcpupdateComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [OrComponent, PinchZoomComponent, SlidvalidateComponent, ScanComponent,HcpupdateComponent],
  entryComponents:[]
})
export class AppcomponentsModule { }
