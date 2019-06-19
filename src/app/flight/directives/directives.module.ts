import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SelectCityDirective } from "./select-city.directive";

@NgModule({
  declarations: [SelectCityDirective],
  imports: [CommonModule],
  exports: [SelectCityDirective]
})
export class DirectivesModule {}
