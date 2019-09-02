import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TrainComponentsModule } from "./components/traincomponents.module";
import { TrainRoutingModule } from './train-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, TrainComponentsModule, TrainRoutingModule],
  exports: [TrainRoutingModule]
})
export class TrainModule {}
