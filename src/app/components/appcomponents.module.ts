import { PinFabComponent } from "./pin-fab/pin-fab.component";
import { SlidesComponent } from "./slides/slides.component";
import { FormsModule } from "@angular/forms";
import { AppDirectivesModule } from "./../directives/directives.module";
import { MapComponent } from "./../components/map/map.component";
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
import { PayComponent } from "./pay/pay.component";
import { RefresherModule } from "./refresher";
import { MyCalendarComponent } from "./my-calendar/my-calendar.component";
import { BaseInputComponent } from "./base-input/base-input.component";
import { SwiperSlidesComponent } from "./swiper-slides/swiper-slides.component";
import { ScrollerComponent } from "./scroller/scroller.component";
import { BackButtonComponent } from "./back-button/back-button.component";
@NgModule({
  declarations: [
    OrComponent,
    SwiperSlidesComponent,
    PinchZoomComponent,
    SlidvalidateComponent,
    ScanComponent,
    AppUpdateComponent,
    LoadingComponent,
    LoginSkeletonPageComponent,
    TimelineComponent,
    TimelineItemComponent,
    PayComponent,
    MapComponent,
    SlidesComponent,
    MyCalendarComponent,
    BaseInputComponent,
    PinFabComponent,
    ScrollerComponent,
    BackButtonComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TreeNgxModule,
    AppDirectivesModule,
    RefresherModule
  ],
  exports: [
    BackButtonComponent,
    SwiperSlidesComponent,
    PinFabComponent,
    BaseInputComponent,
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
    MapComponent,
    SlidesComponent,
    AppDirectivesModule,
    RefresherModule,
    MyCalendarComponent,
    ScrollerComponent
  ]
})
export class AppComponentsModule {}
