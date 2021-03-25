import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { ImgControlComponent } from "src/app/components/img-control/img-control.component";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";

@Component({
  selector: "app-images-manager",
  templateUrl: "./images-manager.component.html",
  styleUrls: ["./images-manager.component.scss"],
})
export class ImagesMangerComponent implements OnInit {
  private config: ConfigEntity;
  @Input() defaultImage;
  @Input() loadingImage;
  @Input() chooseScene = true;
  @Input() isMulti = false;
  @Input() maxCount = Infinity;
  @Input() desc = false;
  @Input() cropperOptions;
  // @Input() maxCropWidth;
  // @Input() maxCropHeight;
  @Input() images: {
    fileValue: string;
    imageUrl: string;
    fileName: string;
    isActive?: boolean;
  }[];
  @Output() imagesChange: EventEmitter<any>;
  constructor(private configService: ConfigService) {
    this.imagesChange = new EventEmitter();
  }

  ngOnInit() {
    this.configService.getConfigAsync().then((c) => {
      this.config = c;
    });
  }
  async onViewPic(img, idx) {
    const m = await AppHelper.modalController.create({
      component: ImgControlComponent,
      componentProps: {
        imageUrls: this.images.map((it, index) => {
          it.isActive = idx == index;
          return it;
        }),
        pos: idx,
        isViewImage: true,
        loadingImage: this.config && this.config.PrerenderImageUrl,
        defaultImage: this.config && this.config.DefaultImageUrl,
        cropperOptions: this.cropperOptions,
      },
    });
    m.present();
  }
  onRemoveImage(img) {
    this.images = this.images.filter((it) => it != img);
    this.imagesChange.emit(this.images);
  }
  onAddFile(img) {
    if (!this.images) {
      this.images = [];
    }
    if (this.isMulti) {
      if (this.images.length < this.maxCount) {
        this.images.push({
          fileName: img.fileName,
          fileValue: img.fileValue,
          imageUrl: img.imageUrl || img.fileName || img.fileValue,
        });
      }
    } else {
      this.images = [img];
    }
    this.imagesChange.emit(this.images);
  }
}
