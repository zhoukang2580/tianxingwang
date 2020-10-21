import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddStrokeComponent } from "./add-stroke/add-stroke.component";
import { IonicModule } from "@ionic/angular";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { SelectCity } from "./select-city/select-city";
import { SelectCityEn } from "./select-city_en/select-city_en";
import { FormsModule } from "@angular/forms";
import { SelectCostcenter } from "./select-costcenter/select-costcenter";
import { AddStrokeEnComponent } from './add-stroke_en/add-stroke_en.component';

@NgModule({
  declarations: [AddStrokeComponent, AddStrokeEnComponent, SelectCity, SelectCityEn, SelectCostcenter],
  imports: [IonicModule, CommonModule, FormsModule, AppComponentsModule],
  exports: [AddStrokeComponent, AddStrokeEnComponent],
})
export class TravelApplicationComponentsModule {}
