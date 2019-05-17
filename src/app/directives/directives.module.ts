import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CropAvatarDirective } from './crop-avatar.directive';

@NgModule({
  declarations: [CropAvatarDirective],
  imports: [
    CommonModule
  ],
  exports:[CropAvatarDirective]
})
export class DirectivesModule { }
