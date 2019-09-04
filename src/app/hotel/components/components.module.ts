import { HotelQueryComponent } from "./hotel-query/hotel-query.component";
import { HotelServiceComponent } from "./hotel-query/hotel-service/hotel-service.component";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DateCityComponent } from "./date-city/date-city.component";
import { IonicModule } from "@ionic/angular";
import { HotelFacilityComponent } from "./hotel-query/hotel-facility/hotel-facility.component";
import { HotelGeoComponent } from "./hotel-query/hotel-geo/hotel-geo.component";
import { HotelThemeComponent } from "./hotel-query/hotel-theme/hotel-theme.component";
import { HotelBrandsComponent } from "./hotel-query/hotel-brands/hotel-brands.component";
import { QueryTabComponent } from "./hotel-query/query-tab/query-tab.component";
import { RecommendRankComponent } from './hotel-query/recommend-rank/recommend-rank.component';

@NgModule({
  declarations: [
    DateCityComponent,
    HotelGeoComponent,
    HotelThemeComponent,
    HotelFacilityComponent,
    HotelServiceComponent,
    HotelBrandsComponent,
    HotelQueryComponent,
    QueryTabComponent,
    RecommendRankComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [
    DateCityComponent,
    HotelGeoComponent,
    HotelThemeComponent,
    HotelFacilityComponent,
    HotelServiceComponent,
    HotelBrandsComponent,
    HotelQueryComponent,
    QueryTabComponent,
    RecommendRankComponent
  ]
})
export class HotelComponentsModule {}
