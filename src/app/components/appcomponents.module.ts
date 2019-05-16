import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrComponent } from './or/or.component';
@NgModule({
  declarations: [OrComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports:[OrComponent]
})
export class AppcomponentsModule { }
