import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TextInputComponent } from './text-input/text-input.component';

@NgModule({
  declarations: [TextInputComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: [TextInputComponent],
})
export class ControlsModule {}
