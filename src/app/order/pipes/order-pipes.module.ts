import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OrderstatusPipe } from "./orderstatus.pipe";

@NgModule({
  declarations: [OrderstatusPipe],
  imports: [CommonModule],
  exports: [OrderstatusPipe]
})
export class OrderPipesModule {}
