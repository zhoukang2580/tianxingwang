import { ApiService } from "./../services/api/api.service";
import { ImageRecoverService } from "./../services/imageRecover/imageRecover.service";
import { ConfigService } from "src/app/services/config/config.service";
import { DomSanitizer } from "@angular/platform-browser";
import {
  Directive,
  Input,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  OnInit,
  AfterViewInit
} from "@angular/core";
import { AppHelper } from "../appHelper";
import { RequestEntity } from "../services/api/Request.entity";

@Directive({
  selector: "[appLazyloadimage]"
})
export class LazyloadimageDirective
  implements OnChanges, OnDestroy, OnInit, AfterViewInit {
  @Input() lazyloadImage;
  @Input() defaultImage; // = AppHelper.getDefaultAvatar();
  @Input() errorImage; // = AppHelper.getDefaultAvatar();
  @Input() loadingImage; // = AppHelper.getDefaultLoadingImage();
  image: HTMLImageElement;
  Failover: any;
  constructor(
    private el: ElementRef<any>, // private render: Renderer2
    private configService: ConfigService,
    private apiService: ApiService,
    private imageRecorver: ImageRecoverService
  ) {}
  async ngOnInit() {
    if (!this.Failover) {
      await this.imageRecorver.get();
      if (this.imageRecorver) {
        this.Failover = this.imageRecorver.Failover;
      }
    }
    console.log("failover", this.Failover);
    await this.initializeDefaultImages();
    // if (this.image) {
    //   this.image.src = this.loadingImage;
    // }
  }
  async initializeDefaultImages() {
    const config = await this.configService.get().catch(_ => null);
    if (config) {
      this.defaultImage =
        config.DefaultImageUrl || AppHelper.getDefaultAvatar();
      this.errorImage = config.DefaultImageUrl || AppHelper.getDefaultAvatar();
      this.loadingImage =
        config.PrerenderImageUrl || AppHelper.getDefaultLoadingImage();
    } else {
      this.defaultImage = AppHelper.getDefaultAvatar();
      this.errorImage = AppHelper.getDefaultAvatar();
      this.loadingImage = AppHelper.getDefaultLoadingImage();
    }
  }
  async ngAfterViewInit() {
    await this.initializeDefaultImages();
    console.log("ngAfterViewInit", this.loadingImage);
    if (!this.image) {
      this.getImageEle();
    }
    if (this.image) {
      this.image.src = this.loadingImage || AppHelper.getDefaultLoadingImage();
    }
  }
  async ngOnChanges(changes: SimpleChanges) {
    if (
      changes &&
      changes.lazyloadImage &&
      changes.lazyloadImage.currentValue
    ) {
      await this.initializeDefaultImages();
      if (!this.image) {
        this.getImageEle();
      }
      if (this.image) {
        this.image.src =
          this.loadingImage || AppHelper.getDefaultLoadingImage();
      }
      this.setLoadImage();
    }
  }
  private getImageEle() {
    this.image =
      this.el.nativeElement instanceof HTMLImageElement
        ? this.el.nativeElement
        : (this.el.nativeElement as HTMLElement).querySelector("img") ||
          (this.el.nativeElement.shadowRoot &&
            this.el.nativeElement.shadowRoot.querySelector("img"));
    return this.image;
  }
  async setLoadImage() {
    if (this.image) {
      this.image.src = this.loadingImage || AppHelper.getDefaultLoadingImage();
      const id = setTimeout(() => {
        if (
          this.image.src == this.loadingImage &&
          this.image.src != AppHelper.getDefaultLoadingImage()
        ) {
          this.image.src = AppHelper.getDefaultLoadingImage();
        }
      }, 1000);
      this.image.onload = () => {
        if (this.image.src == this.loadingImage) {
          clearTimeout(id);
        }
      };
      this.image.onerror = () => {
        if (
          this.image.src == this.loadingImage &&
          this.image.src != AppHelper.getDefaultLoadingImage()
        ) {
          this.image.src = AppHelper.getDefaultLoadingImage();
        }
      };
      this.Initialize(this.image.parentElement);
    }
  }
  ngOnDestroy() {}
  Initialize(container) {
    this.LoadImages(container || document);
  }
  LoadImages(container) {
    let allImages = container.getElementsByTagName("img");
    allImages = allImages.length
      ? allImages
      : this.el.nativeElement.shadowRoot &&
        this.el.nativeElement.shadowRoot.querySelectorAll("img");
    console.log("allImages", allImages);
    for (let i = 0; i < allImages.length; i++) {
      this.BindErrorEvent(allImages[i]);
    }
  }
  BindErrorEvent(img: HTMLImageElement) {
    console.log("BindErrorEvent");
    const tempImg = document.createElement("img");
    tempImg.onload = () => {
      img.src = tempImg.src;
    };
    img.onerror = () => {
      this.Replace(img);
    };
    tempImg.onerror = () => {
      this.Replace(img);
    };
    tempImg.src = this.lazyloadImage;
  }
  Replace(img: HTMLImageElement) {
    if (!this.Failover) {
      return;
    }
    if (
      img.src &&
      this.Failover &&
      this.Failover.DefaultUrl &&
      img.src.toLowerCase() == this.Failover.DefaultUrl.toLowerCase()
    ) {
      return;
    }
    const date = new Date();
    const node = this.GetNode(this.lazyloadImage);
    if (!node && this.Failover && this.Failover.DefaultUrl) {
      img.src = this.Failover.DefaultUrl + "?v=" + date;
      return;
    }
    let isRecover = false;
    for (let i = 0; i < this.Failover.Nodes.length; i++) {
      if (
        !this.Failover.Nodes[i].IsNormal ||
        this.Failover.Nodes[i].GroupName != node.GroupName
      ) {
        continue;
      }
      const src = `${this.lazyloadImage}`.split("?")[0];
      img.src =
        src.replace(node.Url, this.Failover.Nodes[i].Url) + "?v=" + date;
      isRecover = true;
      break;
    }
    if (!isRecover) {
      if (this.Failover.DefaultUrl && this.Failover.DefaultUrl.length) {
        img.src = this.Failover.DefaultUrl + "?v=" + date;
      } else {
        img.src = this.defaultImage;
      }
    }
  }
  GetNode(url) {
    if (!this.Failover || !this.Failover.Nodes) {
      return;
    }
    for (let i = 0; i < this.Failover.Nodes.length; i++) {
      if (url.indexOf(this.Failover.Nodes[i].Url) > -1) {
        this.Failover.Nodes[i].IsNormal = false;
        return this.Failover.Nodes[i];
      }
    }
    return null;
  }
}
