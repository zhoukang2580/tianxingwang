import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddStrokeComponent } from './add-stroke/add-stroke.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [AddStrokeComponent],
  imports: [IonicModule,CommonModule, AppComponentsModule],
  exports: [AddStrokeComponent]
})
export class WorkflowComponentsModule {}
