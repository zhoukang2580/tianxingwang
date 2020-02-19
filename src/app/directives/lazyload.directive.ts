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
  NgZone
} from "@angular/core";
import { Directive } from "@angular/core";
import { ImageRecoverService } from "../services/imageRecover/imageRecover.service";

@Directive({
  selector: "[lazyLoad]"
})
export class LazyloadDirective
  implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  private io: IntersectionObserver;
  @Input() lazyLoad: string;
  @Input() recoverImage = true;
  @Input() defaultImage;
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
  }
  ngAfterContentInit() {
    // console.log("ngAfterContentInit", this.defaultImage);
  }
  ngOnInit() {
    this.time = Date.now();
    this.ngZone.runOutsideAngular(() => {
      // console.log(
      //   "runOutsideAngular ",
      //   Date.now() - this.time,
      //   this.defaultImage
      // );
      this.setDefaultImage();
      if (this.recoverImage) {
        this.setupImageRecover();
      }
    });
  }
  private setDefaultImage() {
    if (this.defaultImage) {
      this.load(this.defaultImage);
    } else {
      this.load("assets/loading.gif");
    }
  }
  private async setupImageRecover() {
    // Do something
    // console.log("settup", atter)
    // atter.imagePath = null;
    if (
      !this.el.nativeElement.dataset ||
      !this.el.nativeElement.dataset["isInitialized"]
    ) {
      await this.imageRecoverService.initialize(this.el.nativeElement);
      this.el.nativeElement.dataset["isInitialized"] = "isInitialized";
    }
  }
  ngOnDestroy() {
    this.removeIO();
  }
  private load(src: string = null) {
    console.log("进入load ", Date.now() - this.time);
    let url = decodeURIComponent(src || this.lazyLoad || this.defaultImage);
    url = `${url}`.replace(/\?v=\d+/g, "");
    // console.log('load url:', url);
    this.time = Date.now();
    this.ngZone.runOutsideAngular(() => {
      // console.log("加载图片耗时：", Date.now() - this.time);
      if (this.el.nativeElement instanceof HTMLDivElement) {
        // this.render.setProperty(this.el.nativeElement,'backgroundImage',`${src || this.lazyLoad}`);
        this.el.nativeElement.style.backgroundImage = `url('${url}')`;
      } else {
        this.el.nativeElement.src = url || this.lazyLoad;
      }
    });
  }
  private removeIO() {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }
  private addIO() {
    if (!this.lazyLoad) {
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
      this.io = new IntersectionObserver(data => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        // console.log("IntersectionObserver 耗时：", Date.now() - this.time);

        if (data.find(it => it.isIntersecting)) {
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
