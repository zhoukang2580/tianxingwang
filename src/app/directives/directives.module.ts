import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
// import { LazyLoadImageDirective } from './lazyload-image/lazyload-image.directive';
import { LazyloadimageDirective } from "./lazyloadimage.directive";
import { ShowtipDirective } from "./showtip.directive";
import { AutoGrowDirective } from "./auto-grow.directive";

@NgModule({
  declarations: [
    CropAvatarDirective,
    LazyloadimageDirective,
    ShowtipDirective,
    AutoGrowDirective
  ],
  imports: [CommonModule],
  exports: [
    CropAvatarDirective,
    LazyloadimageDirective,
    ShowtipDirective,
    AutoGrowDirective
  ]
})
export class AppDirectivesModule {}
