import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
// import { LazyLoadImageDirective } from './lazyload-image/lazyload-image.directive';
import { LazyloadimageDirective } from "./lazyloadimage.directive";

@NgModule({
  declarations: [CropAvatarDirective, LazyloadimageDirective],
  imports: [CommonModule],
  exports: [CropAvatarDirective, LazyloadimageDirective]
})
export class DirectivesModule {}
