import { DomController } from "@ionic/angular";
import { AppHelper } from "./../appHelper";
import { DomSanitizer } from "@angular/platform-browser";
import {
  OnInit,
  OnChanges,
  Input,
  OnDestroy,
  Renderer2,
  ElementRef,
  AfterContentInit,
  NgZone,
} from "@angular/core";
import { Directive } from "@angular/core";
import { ImageRecoverService } from "../services/imageRecover/imageRecover.service";

@Directive({
  selector: "[lazyLoad]",
})
export class LazyloadDirective
  implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  private io: IntersectionObserver;
  @Input() lazyLoad: string;
  @Input() recoverImage = true;
  @Input() defaultImage;
  @Input() loadingImage;
  private time = 0;
  constructor(
    private imageRecoverService: ImageRecoverService,
    private el: ElementRef<HTMLDivElement | HTMLImageElement>,
    private ngZone: NgZone
  ) {}
  ngOnChanges() {
    // console.log("lazyload changes",this.el.nativeElement,this.lazyLoad);
    this.time = Date.now();
    this.ngZone.runOutsideAngular(() => {
      this.addIO();
    });
    // console.log(
    //   "default image ",
    //   this.defaultImage,
    //   "lazyLoad ",
    //   this.lazyLoad
    // );
  }
  ngAfterContentInit() {
    // console.log("ngAfterContentInit", this.defaultImage);
  }
  ngOnInit() {
    this.loadingImage = this.loadingImage || `assets/loading.gif`;
    this.time = Date.now();
    this.ngZone.runOutsideAngular(() => {
      this.setDefaultImage();
      if (this.recoverImage) {
        this.setupImageRecover();
      }
    });
    this.el.nativeElement.style.transition = "all ease-in-out 200ms";
    this.el.nativeElement.onload = () => {
      this.el.nativeElement.style.opacity = `1`;
    };
  }
  private setDefaultImage() {
    this.load(this.lazyLoad ? this.loadingImage : this.defaultImage);
  }
  private async setupImageRecover() {
    // Do something
    // console.log("settup", atter)
    // atter.imagePath = null;
    if (
      !this.el.nativeElement.dataset ||
      !this.el.nativeElement.dataset["isInitialized"]
    ) {
      this.el.nativeElement.dataset["isInitialized"] = "isInitialized";
      await this.imageRecoverService.initialize(this.el.nativeElement);
    }
  }
  ngOnDestroy() {
    this.removeIO();
  }
  private load(src: string = null) {
    // console.log("进入load ", Date.now() - this.time);
    let url = src || this.lazyLoad || this.defaultImage;
    // url = `${url}`.replace(/\?v=\d+/g, "");
    url = this.addVersion(url);
    // console.log('load url:', url);
    this.time = Date.now();
    this.ngZone.runOutsideAngular(() => {
      this.el.nativeElement.style.opacity = `0.25`;
      // console.log("加载图片耗时：", Date.now() - this.time);
      if (this.el.nativeElement instanceof HTMLDivElement) {
        // this.render.setProperty(this.el.nativeElement,'backgroundImage',`${src || this.lazyLoad}`);
        this.el.nativeElement.style.backgroundImage = `url('${url}')`;
      } else {
        this.el.nativeElement.src = url || this.addVersion(this.lazyLoad);
      }
    });
  }
  private addVersion(url: string) {
    if (url) {
      if (url.includes("data:image")) {
        return url;
      }
      url = url.includes("?v")
        ? `${url.split("?v")[0]}?v=${Date.now()}`
        : `${url}?v=${Date.now()}`;
    }
    return url;
  }
  private removeIO() {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }
  private addIO() {
    if (!this.lazyLoad) {
      if (this.defaultImage) {
        this.load(this.defaultImage);
      }
      return;
    }
    // if (AppHelper.isDingtalkH5()) {
    //   setTimeout(() => this.load(), 200);
    //   return;
    // }
    this.time = Date.now();
    if (
      "IntersectionObserver" in window &&
      "IntersectionObserverEntry" in window
    ) {
      // console.log("当前浏览器支持：IntersectionObserver");
      this.removeIO();
      this.io = new IntersectionObserver((data) => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        // console.log("IntersectionObserver 耗时：", Date.now() - this.time);
        // console.log(data);
        if (data.find((it) => it.isIntersecting)) {
          // console.log(
          //   "IntersectionObserver  isIntersecting 耗时：",
          //   Date.now() - this.time
          // );
          this.load();
          this.removeIO();
        } else if (AppHelper.isDingtalkH5()) {
          setTimeout(() => {
            this.load();
            this.removeIO();
          }, 200);
        }
      });
      this.io.observe(this.el.nativeElement);
    } else {
      // fall back to setTimeout for Safari and IE
      // console.error("当前浏览器不支持：IntersectionObserver");
      // this.addToQueue(this.lazyLoad);
      setTimeout(() => this.load(), 200);
    }
  }
}
