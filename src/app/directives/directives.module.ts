import { LazyloadDirective } from "./lazyload.directive";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
import { ShowtipDirective } from "./showtip.directive";
import { AutoGrowDirective } from "./auto-grow.directive";
import { AuthorizeDirective } from './authorize.directive';
import { ShowMenusDirective } from './show-menus.directive';
import { LongPressShowpopDirective } from './long-press-showpop.directive';

@NgModule({
  declarations: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyloadDirective,
    AuthorizeDirective,
    ShowMenusDirective,
    LongPressShowpopDirective
  ],
  imports: [CommonModule],
  exports: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyloadDirective,
    LongPressShowpopDirective,
    AuthorizeDirective,
    ShowMenusDirective
  ]
})
export class AppDirectivesModule { }
