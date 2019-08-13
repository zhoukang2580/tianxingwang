import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SelectCityDirective } from "./select-city.directive";
import { SelectFlyDateDirective } from "./select-fly-date.directive";

@NgModule({
  declarations: [SelectCityDirective, SelectFlyDateDirective],
  imports: [CommonModule],
  exports: [SelectFlyDateDirective, SelectFlyDateDirective]
})
export class FlightDirectivesModule {}
