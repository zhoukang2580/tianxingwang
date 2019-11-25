import { ConfigEntity } from './../services/config/config.entity';
import { ConfigService } from 'src/app/services/config/config.service';
import { AppHelper } from 'src/app/appHelper';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
import { ShowtipDirective } from "./showtip.directive";
import { AutoGrowDirective } from "./auto-grow.directive";
import { SetErrorImageProps, Attributes } from './ng-lazyload-image/types';
import { LazyLoadImageModule } from './ng-lazyload-image/lazyload-image.module';
import { scrollPreset } from './ng-lazyload-image/scroll-preset';

@NgModule({
  declarations: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
  ],
  imports: [CommonModule, LazyLoadImageModule],
  exports: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyLoadImageModule
  ]
})
export class AppDirectivesModule {
}