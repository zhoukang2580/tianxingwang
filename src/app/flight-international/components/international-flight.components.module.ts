import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, TmcComponentsModule],
  exports: [TmcComponentsModule]
})
export class InternationalFlightComponentsModule {}
