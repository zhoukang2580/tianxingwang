import { InterHotelQueryComponent } from "./inter-hotel-query/inter-hotel-query.component";
import { InterShowMsgComponent } from "./inter-show-msg/inter-show-msg.component";
import { AppDirectivesModule } from "./../../directives/directives.module";
import { HotelListItemComponent } from "./hotel-list-item/hotel-list-item.component";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { InterRoomPlanItemComponent } from "./inter-room-plan-item/inter-room-plan-item.component";
import { InterRoomShowItemComponent } from "./inter-room-show-item/inter-room-show-item.component";
import { ChangeInterRoomPlanDateComponent } from "./change-inter-roomplan-date/change-inter-roomplan-date.component";
import { InterHotelStarPriceComponent } from "./inter-hotel-starprice/inter-hotel-starprice.component";
import { InterRecommendRankComponent } from "./inter-recommend-rank/inter-recommend-rank.component";
import { InterHotelWarrantyComponent } from "./inter-hotel-warranty/inter-hotel-warranty.component";
import { AmapComponent } from "./amap/amap.component";
import { OverHotelComponent } from './over-hotel/over-hotel.component';
import { InterHotelQueryEnComponent } from './inter-hotel-query_en/inter-hotel-query_en.component';
import { InterRoomShowItemEnComponent } from './inter-room-show-item_en/inter-room-show-item_en.component';
import { InterRoomPlanItemEnComponent } from './inter-room-plan-item_en/inter-room-plan-item_en.component';

@NgModule({
  declarations: [
    HotelListItemComponent,
    InterHotelWarrantyComponent,
    InterRoomPlanItemComponent,
    InterRoomPlanItemEnComponent,
    InterShowMsgComponent,
    InterRoomShowItemComponent,
    InterRoomShowItemEnComponent,
    ChangeInterRoomPlanDateComponent,
    InterHotelQueryComponent,
    InterHotelQueryEnComponent,
    InterHotelStarPriceComponent,
    InterRecommendRankComponent,
    AmapComponent,
    OverHotelComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppComponentsModule,
    AppDirectivesModule
  ],
  exports: [
    AmapComponent,
    InterHotelWarrantyComponent,
    InterHotelQueryComponent,
    InterHotelQueryEnComponent,
    HotelListItemComponent,
    AppComponentsModule,
    InterRoomPlanItemComponent,
    InterRoomPlanItemEnComponent,
    InterRoomShowItemComponent,
    InterRoomShowItemEnComponent,
    ChangeInterRoomPlanDateComponent,
    InterHotelStarPriceComponent,
    InterRecommendRankComponent,
    OverHotelComponent
  ]
})
export class HotelInternationalComponentsModule {}
