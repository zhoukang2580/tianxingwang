import { LazyloadDirective } from './lazyload.directive';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
import { ShowtipDirective } from "./showtip.directive";
import { AutoGrowDirective } from "./auto-grow.directive";

@NgModule({
  declarations: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyloadDirective
  ],
  imports: [CommonModule],
  exports: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyloadDirective
  ]
})
export class AppDirectivesModule {
}