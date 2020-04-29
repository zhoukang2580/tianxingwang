import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddStrokeComponent } from './add-stroke/add-stroke.component';
import { IonicModule } from '@ionic/angular';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';



@NgModule({
  declarations: [AddStrokeComponent],
  imports: [
    IonicModule,CommonModule, AppComponentsModule
  ],
  exports:[AddStrokeComponent]
})
export class TravelApplicationComponentsModule { }
