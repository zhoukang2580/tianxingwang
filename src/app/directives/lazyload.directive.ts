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
  SimpleChanges,
} from "@angular/core";
import { Directive } from "@angular/core";
import { ImageRecoverService } from "../services/imageRecover/imageRecover.service";
import { LazyloadService } from "./lazyload.service";

@Directive({
  selector: "[lazyLoad],[htmlStr]",
})
export class LazyloadDirective
  implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  private io: IntersectionObserver;
  @Input() lazyLoad: string;
  @Input() recoverImage = true;
  @Input() defaultImage;
  @Input() loadingImage;
  @Input() htmlStr;
  @Input() isCanView;
  @Input() isReload = false;
  @Input() isPreventBgImage = false;
  constructor(
    private imageRecoverService: ImageRecoverService,
    private el: ElementRef<HTMLDivElement | HTMLImageElement>,
    private ngZone: NgZone,
    private lazyLoadService: LazyloadService
  ) { }
  ngOnChanges(c: SimpleChanges) {
    // console.log("lazyload changes",this.el.nativeElement,this.lazyLoad);
    this.ngZone.runOutsideAngular(() => {
      this.addIO();
    });
    // console.log(
    //   "default image ",
    //   this.defaultImage,
    //   "lazyLoad ",
    //   this.lazyLoad
    // );
    if (c && c.htmlStr) {
      this.lazyLoadService.appendHtmlStr({
        container: this.el.nativeElement,
        htmlStr: this.htmlStr,
        defaultImage: this.defaultImage,
        loadingImage: this.loadingImage,
        isCanView: this.isCanView,
      });
    }
  }
  ngAfterContentInit() {
    // console.log("ngAfterContentInit", this.defaultImage);
  }
  private load(src?: string) {
    this.lazyLoadService.load({
      el: this.el.nativeElement,
      isPreventBgImage: this.isPreventBgImage,
      src: src || this.lazyLoad,
      loadingImage: this.loadingImage,
      defaultImage: this.defaultImage,
    });
  }
  private onReload() {
    if (this.el.nativeElement.getAttribute("loaderror")) {
      this.load(this.addVersion(this.lazyLoad));
    }
  }
  ngOnInit() {
    this.loadingImage = this.loadingImage || `assets/loading.gif`;
    if (this.isReload) {
      this.el.nativeElement.addEventListener("click", this.onReload);
    }
    this.el.nativeElement.style.transition = "all ease-in-out 200ms";
    if (this.el.nativeElement instanceof HTMLImageElement) {
      this.el.nativeElement.src = this.loadingImage;
    } else {
      if (!this.isPreventBgImage) {
        this.el.nativeElement.style.backgroundImage = `url('${this.loadingImage}')`;
      }
    }
  }
  private getNormalizeUrl(url: string) {
    return this.lazyLoadService.getNormalizeUrl(url);
  }
  ngOnDestroy() {
    this.removeIO();
  }
  private addVersion(url: string) {
    if (url) {
      if (url.includes("data:image")) {
        return url;
      }
      url = url.includes("?")
        ? `${url}&v=${Date.now()}`
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
    if (
      "IntersectionObserver" in window &&
      "IntersectionObserverEntry" in window
    ) {
      // console.log("????????????????????????IntersectionObserver");
      this.removeIO();
      this.io = new IntersectionObserver((data) => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        // console.log("IntersectionObserver ?????????", Date.now() - this.time);
        // console.log(data);
        if (data.find((it) => it.isIntersecting)) {
          // console.log(
          //   "IntersectionObserver  isIntersecting ?????????",
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
      // console.error("???????????????????????????IntersectionObserver");
      // this.addToQueue(this.lazyLoad);
      setTimeout(() => this.load(), 200);
    }
  }
}
