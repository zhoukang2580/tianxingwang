import { ConfigEntity } from './../services/config/config.entity';
import { ConfigService } from 'src/app/services/config/config.service';
import { AppHelper } from 'src/app/appHelper';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
import { ShowtipDirective } from "./showtip.directive";
import { AutoGrowDirective } from "./auto-grow.directive";
import { SetErrorImageProps, Attributes } from './ng-lazyload-image/types';
import { scrollPreset } from './ng-lazyload-image/scroll-preset';
import { LazyloadDirective } from './lazyload.directive';

@NgModule({
  declarations: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyloadDirective,
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