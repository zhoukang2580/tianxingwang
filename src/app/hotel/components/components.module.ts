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
import { ChangeRoomplanDateComponent } from "./change-roomplan-date/change-roomplan-date.component";
import { ShowMsgComponent } from "./show-msg/show-msg.component";
import { HotelGeoComponent } from "./hotel-geo/hotel-geo.component";
import { QueryTabComponent } from "./query-tab/query-tab.component";
import { RecommendRankComponent } from "./recommend-rank/recommend-rank.component";
import { HotelFilterComponent } from "./hotel-filter/hotel-filter.component";
import { HotelStarPriceComponent } from "./hotel-starprice/hotel-starprice.component";
import { WarrantyComponent } from "./warranty/warranty.component";
import { OverHotelComponent } from "./over-hotel/over-hotel.component";
import { RoomShowItemEnComponent } from "./room-show-item_en/room-show-item_en.component";
import { RoomPlanItemEnComponent } from "./room-plan-item_en/room-plan-item_en.component";
import { HotelStarPriceEnComponent } from "./hotel-starprice_en/hotel-starprice_en.component";
import { RoomPlanItemDfComponent } from './room-plan-item-df/room-plan-item-df.component';
import { HotelAddcontactsCompComponent } from './hotel-addcontacts-comp/hotel-addcontacts-comp.component';
import { ShowFreebookTipComponent } from './show-freebook-tip/show-freebook-tip.component';
import { HotelSearchDfComponent } from './hotel-search-df/hotel-search-df.component';
import { HotelOutNumberComponent } from './hotel-outnumber/hotel-outnumber.component';
import { GuaranteeAgreementComponent } from "./guarantee-agreement/guarantee-agreement.component";

@NgModule({
  declarations: [
    DateCityComponent,
    HotelGeoComponent,
    HotelQueryComponent,
    QueryTabComponent,
    RecommendRankComponent,
    HotelFilterComponent,
    HotelSearchDfComponent,
    HotelStarPriceComponent,
    HotelStarPriceEnComponent,
    HotelAddcontactsCompComponent,
    HotelListItemComponent,
    RoomPlanItemComponent,
    RoomPlanItemEnComponent,
    RoomPlanItemDfComponent,
    RoomShowItemComponent,
    RoomShowItemEnComponent,
    ChangeRoomplanDateComponent,
    ShowMsgComponent,
    WarrantyComponent,
    HotelOutNumberComponent,
    OverHotelComponent,
    ShowFreebookTipComponent,
    GuaranteeAgreementComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppComponentsModule,
    TmcComponentsModule,
  ],
  exports: [
    HotelOutNumberComponent,
    HotelAddcontactsCompComponent,
    WarrantyComponent,
    HotelListItemComponent,
    DateCityComponent,
    HotelGeoComponent,
    HotelQueryComponent,
    QueryTabComponent,
    HotelFilterComponent,
    RecommendRankComponent,
    HotelStarPriceComponent,
    HotelStarPriceEnComponent,
    RoomPlanItemComponent,
    RoomPlanItemEnComponent,
    RoomPlanItemDfComponent,
    RoomShowItemComponent,
    RoomShowItemEnComponent,
    TmcComponentsModule,
    ChangeRoomplanDateComponent,
    OverHotelComponent,
    GuaranteeAgreementComponent
  ],
  entryComponents: [ShowMsgComponent],
})
export class HotelComponentsModule {}
