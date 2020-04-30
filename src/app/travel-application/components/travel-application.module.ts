import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddStrokeComponent } from "./add-stroke/add-stroke.component";
import { IonicModule } from "@ionic/angular";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { SelectCity } from "./select-city/select-city";
import { FormsModule } from "@angular/forms";
import { SelectCostcenter } from "./select-costcenter/select-costcenter";

@NgModule({
  declarations: [AddStrokeComponent, SelectCity, SelectCostcenter],
  imports: [IonicModule, CommonModule, FormsModule, AppComponentsModule],
  exports: [AddStrokeComponent],
})
export class TravelApplicationComponentsModule {}
