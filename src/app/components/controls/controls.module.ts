import { ImagePickerComponent } from './image-picker/image-picker.component';
import { DateTimeInputComponent } from './date-time-input/date-time-input.component';
import { DateInputComponent } from './date-input/date-input.component';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextInputComponent } from './text-input/text-input.component';



@NgModule({
  declarations: [TextInputComponent, DateInputComponent, DateTimeInputComponent, ImagePickerComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [TextInputComponent, DateInputComponent, DateTimeInputComponent, ImagePickerComponent]
})
export class ControlsModule { }
