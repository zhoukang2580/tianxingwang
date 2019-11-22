import { ImageRecoverService } from './../services/imageRecover/imageRecover.service';
import { ConfigEntity } from './../services/config/config.entity';
import { ConfigService } from 'src/app/services/config/config.service';
import { AppHelper } from 'src/app/appHelper';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CropAvatarDirective } from "./crop-avatar.directive";
import { ShowtipDirective } from "./showtip.directive";
import { AutoGrowDirective } from "./auto-grow.directive";
import { LazyLoadImageModule, Attributes, SetErrorImageProps, scrollPreset } from 'ng-lazyload-image';
let config: ConfigEntity;
let recover: ImageRecoverService;
export function setErrorImage({ element, errorImagePath, useSrcset }: SetErrorImageProps) {
  console.log("setErrorImage", element, errorImagePath);
  if (element instanceof HTMLImageElement) {
    element.src = errorImagePath;
  } else if (element instanceof HTMLDivElement) {
    element.style.backgroundImage = errorImagePath;
  }
}
export function setup(atter: Attributes) {
  // Do something
  console.log("settup", atter)
  atter.defaultImagePath = AppHelper.getDefaultAvatar();
  // atter.imagePath = null;
  if (config) {
    atter.errorImagePath=atter.errorImagePath||config.DefaultImageUrl;
    atter.defaultImagePath = config.DefaultImageUrl;
  }
  if(recover){
    if(!atter.element.dataset||!atter.element.dataset['isInitialized']){
      recover.initialize(atter.element);
      atter.element.dataset['isInitialized']="isInitialized";
    }
  }
}
@NgModule({
  declarations: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
  ],
  imports: [CommonModule, LazyLoadImageModule.forRoot({
    preset: {
      ...scrollPreset, setErrorImage, setup
    }
  }),],
  exports: [
    CropAvatarDirective,
    ShowtipDirective,
    AutoGrowDirective,
    LazyLoadImageModule
  ]
})
export class AppDirectivesModule {
  constructor(private configService: ConfigService, private imageRecoverService: ImageRecoverService) {
    this.configService.getConfigAsync().then(c => {
      config = c;
    });
    recover = imageRecoverService;
  }
}