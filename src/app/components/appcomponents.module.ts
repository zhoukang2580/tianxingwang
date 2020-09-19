import { PinFabComponent } from "./pin-fab/pin-fab.component";
import { SlidesComponent } from "./slides/slides.component";
import { FormsModule } from "@angular/forms";
import { AppDirectivesModule } from "./../directives/directives.module";
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
import { AddNumberComponent } from "./add-number/add-number.component";
import { ComboboxComponent } from "./combobox/combobox.component";
import { ComboboxModalComponent } from "./combobox-modal/combobox-modal.component";
import { EchartComponent } from "./echart/echart.component";
import { MenuPopoverComponent } from "./menu-popover/menu-popover.component";
import { ListItemComponent } from "./list-item/list-item.component";
import { ImgControlComponent } from "./img-control/img-control.component";
import { ImgPickerComponent } from "./img-picker/img-picker.component";
import { MapComponent } from "./map/map.component";
import { PhotoGalleryComponent } from "./photo-gallary/photo-gallery.component";
import { EditorComponent } from "./editor/editor.component";
import { ImagesMangerComponent } from './images-manager/images-manager.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
@NgModule({
  declarations: [
    MapComponent,
    ImgPickerComponent,
    ImgControlComponent,
    OrComponent,
    SwiperSlidesComponent,
    PinchZoomComponent,
    SlidvalidateComponent,
    ScanComponent,
    AppUpdateComponent,
    PhotoGalleryComponent,
    LoadingComponent,
    LoginSkeletonPageComponent,
    TimelineComponent,
    TimelineItemComponent,
    PayComponent,
    SlidesComponent,
    MyCalendarComponent,
    BaseInputComponent,
    PinFabComponent,
    ScrollerComponent,
    BackButtonComponent,
    AddNumberComponent,
    ComboboxComponent,
    ComboboxModalComponent,
    EchartComponent,
    MenuPopoverComponent,
    ListItemComponent,
    TabsContainerComponent,
    ImagesMangerComponent,
    EditorComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TreeNgxModule,
    AppDirectivesModule,
    RefresherModule,
  ],
  exports: [
    EditorComponent,
    TabsContainerComponent,
    MapComponent,
    ImagesMangerComponent,
    ImgControlComponent,
    ComboboxComponent,
    AddNumberComponent,
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
    SlidesComponent,
    AppDirectivesModule,
    MenuPopoverComponent,
    RefresherModule,
    MyCalendarComponent,
    ScrollerComponent,
    ComboboxModalComponent,
    EchartComponent,
    ListItemComponent,
  ],
})
export class AppComponentsModule {}
