import { AppComponentsModule } from "./../../components/appcomponents.module";
import { AppDirectivesModule } from "./../../directives/directives.module";
import { HotelListItemComponent } from "./hotel-list-item/hotel-list-item.component";
import { HotelStarPriceComponent } from "./hotel-query/hotel-starprice/hotel-starprice.component";
import { HotelQueryComponent } from "./hotel-query/hotel-query.component";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DateCityComponent } from "./date-city/date-city.component";
import { IonicModule } from "@ionic/angular";
import { HotelGeoComponent } from "./hotel-query/hotel-geo/hotel-geo.component";
import { QueryTabComponent } from "./hotel-query/query-tab/query-tab.component";
import { RecommendRankComponent } from "./hotel-query/recommend-rank/recommend-rank.component";
import { HotelFilterComponent } from "./hotel-query/hotel-filter/hotel-filter.component";
import { RoomDetailComponent } from "./room-detail/room-detail.component";
import { RoomPlanItemComponent } from "./room-plan-item/room-plan-item.component";

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
    RoomDetailComponent,
    RoomPlanItemComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppDirectivesModule,
    AppComponentsModule
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
    RoomDetailComponent,
    RoomPlanItemComponent
  ]
})
export class HotelComponentsModule {}
