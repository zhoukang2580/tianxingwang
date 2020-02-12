import { AppComponentsModule } from "./../../components/appcomponents.module";
import { AppDirectivesModule } from "./../../directives/directives.module";
import { HotelListItemComponent } from "./hotel-list-item/hotel-list-item.component";
import { HotelQueryComponent } from "./hotel-query/hotel-query.component";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DateCityComponent } from "./date-city/date-city.component";
import { IonicModule } from "@ionic/angular";
import { RoomPlanItemComponent } from "./room-plan-item/room-plan-item.component";
import { RoomShowItemComponent } from "./room-show-item/room-show-item.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { ChangeRoomplanDateComponent } from './change-roomplan-date/change-roomplan-date.component';
import { ShowMsgComponent } from './show-msg/show-msg.component';
import { HotelGeoComponent } from './hotel-geo/hotel-geo.component';
import { QueryTabComponent } from './query-tab/query-tab.component';
import { RecommendRankComponent } from './recommend-rank/recommend-rank.component';
import { HotelFilterComponent } from './hotel-filter/hotel-filter.component';
import { HotelStarPriceComponent } from './hotel-starprice/hotel-starprice.component';

@NgModule({
  declarations: [
    DateCityComponent,
    HotelGeoComponent,
    HotelQueryComponent,
    QueryTabComponent,
    RecommendRankComponent,
    HotelFilterComponent,
    HotelStarPriceComponent,
    HotelStarPriceComponent,
    HotelListItemComponent,
    RoomPlanItemComponent,
    RoomShowItemComponent,
    ChangeRoomplanDateComponent,
    ShowMsgComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppDirectivesModule,
    AppComponentsModule,
    TmcComponentsModule
  ],
  exports: [
    HotelListItemComponent,
    DateCityComponent,
    HotelGeoComponent,
    HotelQueryComponent,
    QueryTabComponent,
    HotelFilterComponent,
    RecommendRankComponent,
    HotelStarPriceComponent,
    HotelStarPriceComponent,
    RoomPlanItemComponent,
    RoomShowItemComponent,
    TmcComponentsModule,
    ChangeRoomplanDateComponent
  ],
  entryComponents: [ShowMsgComponent]
})
export class HotelComponentsModule {}
