import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TmcRoutingModule } from "./tmc-routing.module";
import { MemberPipesModule } from "../member/pipe/pipe.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TmcRoutingModule,
    TmcComponentsModule,
 
  ],
  exports: [TmcRoutingModule, TmcComponentsModule],
})
export class TmcModule {}
