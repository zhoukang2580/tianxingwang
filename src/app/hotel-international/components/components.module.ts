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
import { InterHotelWarrantyComponent } from './inter-hotel-warranty/inter-hotel-warranty.component';

@NgModule({
  declarations: [
    HotelListItemComponent,
    InterHotelWarrantyComponent,
    InterRoomPlanItemComponent,
    InterShowMsgComponent,
    InterRoomShowItemComponent,
    ChangeInterRoomPlanDateComponent,
    InterHotelQueryComponent,
    InterHotelStarPriceComponent,
    InterRecommendRankComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppComponentsModule,
    AppDirectivesModule
  ],
  exports: [
    InterHotelWarrantyComponent,
    InterHotelQueryComponent,
    HotelListItemComponent,
    AppComponentsModule,
    InterRoomPlanItemComponent,
    InterRoomShowItemComponent,
    ChangeInterRoomPlanDateComponent,
    InterHotelStarPriceComponent,
    InterRecommendRankComponent
  ]
})
export class HotelInternationalComponentsModule {}
