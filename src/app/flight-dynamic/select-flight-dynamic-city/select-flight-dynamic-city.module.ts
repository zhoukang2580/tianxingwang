import { AppComponentsModule } from "../../components/appcomponents.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { SelectFlightDynamicCityPage } from "./select-flight-dynamic-city.page";

@NgModule({
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    AppComponentsModule,
    RouterModule.forChild([
      {
        path: "",
        component: SelectFlightDynamicCityPage,
        canActivate:[StylePageGuard]
      }
    ])
  ],
  declarations: [SelectFlightDynamicCityPage]
})
export class SelectFlightDynamicCityPageModule {}
