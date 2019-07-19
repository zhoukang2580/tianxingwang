import { AppUpdateComponent } from "./appupdate/appupdate.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { OrComponent } from "./or/or.component";
import { PinchZoomComponent } from "./pinch-zoom/pinch-zoom.component";
import { SlidvalidateComponent } from "./slidvalidate/slidvalidate.component";
import { ScanComponent } from "./scan/scan.component";
import { LoadingComponent } from "./loading/loading.component";
import { TimelineComponent } from "./timeline/timeline.component";
import { TimelineItemComponent } from "./timeline-item/timeline-item.component";
import { LoginSkeletonPageComponent } from './login-skeleton-page/login-skeleton-page.component';
@NgModule({
  declarations: [
    OrComponent,
    PinchZoomComponent,
    SlidvalidateComponent,
    ScanComponent,
    AppUpdateComponent,
    TimelineComponent,
    TimelineItemComponent,
    LoadingComponent,
    LoginSkeletonPageComponent
  ],
  imports: [CommonModule, IonicModule],
  exports: [
    OrComponent,
    PinchZoomComponent,
    SlidvalidateComponent,
    ScanComponent,
    AppUpdateComponent,
    LoadingComponent,
    TimelineItemComponent,
    TimelineComponent
  ],
  entryComponents: [LoginSkeletonPageComponent]
})
export class AppcomponentsModule {}
