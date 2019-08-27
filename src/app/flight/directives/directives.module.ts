import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SelectCityDirective } from "./select-city.directive";
import { OpenSelectedBookInfosDirective } from './open-selected-book-infos.directive';

@NgModule({
  declarations: [SelectCityDirective, OpenSelectedBookInfosDirective],
  imports: [CommonModule],
  exports: [OpenSelectedBookInfosDirective]
})
export class FlightDirectivesModule {}
