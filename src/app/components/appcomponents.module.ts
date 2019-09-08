import { AppUpdateComponent } from "./appupdate/appupdate.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { OrComponent } from "./or/or.component";
import { PinchZoomComponent } from "./pinch-zoom/pinch-zoom.component";
import { SlidvalidateComponent } from "./slidvalidate/slidvalidate.component";
import { ScanComponent } from "./scan/scan.component";
import { LoadingComponent } from "./loading/loading.component";
import { LoginSkeletonPageComponent } from "./login-skeleton-page/login-skeleton-page.component";
import { TreeNgxModule } from "./tree-ngx/tree-ngx.module";
import { TimelineComponent } from "./timeline/timeline.component";
import { TimelineItemComponent } from "./timeline-item/timeline-item.component";
import { PayComponent } from './pay/pay.component';
import { BrowseImagesComponent } from './browse-images/browse-images.component';
@NgModule({
  declarations: [
    OrComponent,
    PinchZoomComponent,
    SlidvalidateComponent,
    ScanComponent,
    AppUpdateComponent,
    LoadingComponent,
    LoginSkeletonPageComponent,
    TimelineComponent,
    TimelineItemComponent,
    PayComponent,
    BrowseImagesComponent
  ],
  imports: [CommonModule, IonicModule, TreeNgxModule],
  exports: [
    OrComponent,
    PinchZoomComponent,
    SlidvalidateComponent,
    ScanComponent,
    AppUpdateComponent,
    LoadingComponent,
    TreeNgxModule,
    TimelineComponent,
    TimelineItemComponent,
    PayComponent,
    BrowseImagesComponent
  ],
  entryComponents: [LoginSkeletonPageComponent, PayComponent, BrowseImagesComponent]
})
export class AppComponentsModule { }
