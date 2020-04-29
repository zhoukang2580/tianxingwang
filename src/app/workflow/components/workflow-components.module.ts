import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [],
  imports: [IonicModule,CommonModule, AppComponentsModule],
  exports: []
})
export class WorkflowComponentsModule {}
