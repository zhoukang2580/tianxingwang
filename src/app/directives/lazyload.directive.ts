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
  private queue: string[];
  @Input() lazyLoad: string;
  @Input() recoverImage = true;
  @Input() defaultImage: string;
  constructor(
    private imageRecoverService: ImageRecoverService,
    private el: ElementRef<HTMLDivElement | HTMLImageElement>,
    private ngZone: NgZone
  ) {}
  ngOnChanges() {
    // console.log("lazyload changes",this.el.nativeElement,this.lazyLoad);
    this.ngZone.runOutsideAngular(() => {
      this.addIO();
    });
  }
  ngAfterContentInit() {}
  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.setDefaultImage();
      if (this.recoverImage) {
        this.setupImageRecover();
      }
    });
  }
  private setDefaultImage() {
    if (this.defaultImage) {
      this.load(this.defaultImage);
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
    let url = decodeURIComponent(src || this.lazyLoad || this.defaultImage);
    url = `${url}`.replace(/\?v=\d+/g, "");
    // console.log('load url:', url);
    this.ngZone.runOutsideAngular(() => {
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
  private addToQueue(url: string) {
    if (!this.queue) {
      this.queue = [];
    }
    this.queue.push(url);
    setTimeout(() => {
      const one = this.queue.shift();
      if (one) {
        this.load(one);
      }
    }, 200);
  }
  private addIO() {
    if (!this.lazyLoad) {
      return;
    }
    // if (AppHelper.isDingtalkH5()) {
    //   setTimeout(() => this.load(), 200);
    //   return;
    // }
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
        if (data.find(it => it.isIntersecting)) {
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
