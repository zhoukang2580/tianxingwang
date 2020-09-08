import { Injectable, NgZone } from "@angular/core";
import { AppHelper } from "../appHelper";
import { ImageRecoverService } from "../services/imageRecover/imageRecover.service";

@Injectable({
  providedIn: "root",
})
export class LazyloadService {
  private container: HTMLElement;
  private defaultImage: string;
  private loadingImage: string;
  // private io: IntersectionObserver;

  constructor(
    private ngZone: NgZone,
    private imageRecoverService: ImageRecoverService
  ) {}
  append(data: {
    el: HTMLElement;
    html: string;
    defaultImage: string;
    loadingImage: string;
  }) {
    this.container = data.el;
    this.defaultImage = data.defaultImage;
    this.loadingImage = data.loadingImage;
    const df = document.createDocumentFragment();
    const div = document.createElement("div");
    div.innerHTML = data.html;
    const imgs = div.querySelectorAll("img");
    if (imgs && imgs.length) {
      imgs.forEach((img) => {
        const lazyLoad = img.src;
        img.src = this.loadingImage || this.defaultImage;
        img["lazyLoad"] = lazyLoad;
        img.style.transition = "all ease-in-out 200ms";
        img.onload = () => {
          img.style.opacity = "1";
        };
        img.onerror = () => {
          img.style.opacity = "1";
        };
        this.setupImageRecover(img);
        this.addIO(img, lazyLoad);
      });
    }
    df.append(div);
    if (this.container) {
      this.container.append(df);
    }
  }
  private addIO(el: HTMLElement, lazyLoad: string) {
    if (!lazyLoad) {
      if (this.defaultImage) {
        this.load(el, lazyLoad);
      }
      return;
    }
    if (
      "IntersectionObserver" in window &&
      "IntersectionObserverEntry" in window
    ) {
      // console.log("当前浏览器支持：IntersectionObserver");
      this.removeIO(el);
      const io = new IntersectionObserver((data) => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        // console.log("IntersectionObserver 耗时：", Date.now() - this.time);
        // console.log(data);
        if (data[0].isIntersecting) {
          // console.log(
          //   "IntersectionObserver  isIntersecting 耗时：",
          //   Date.now() - this.time
          // );
          this.load(el, el["lazyLoad"]);
          this.removeIO(el);
        } else if (AppHelper.isDingtalkH5()) {
          setTimeout(() => {
            this.load(el, el["lazyLoad"]);
            this.removeIO(el);
          }, 200);
        }
      });
      el["io"] = io;
      el["io"].observe(el);
    } else {
      // fall back to setTimeout for Safari and IE
      // console.error("当前浏览器不支持：IntersectionObserver");
      // this.addToQueue(this.lazyLoad);
      setTimeout(() => this.load(el, el["lazyLoad"]), 200);
    }
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
  private async setupImageRecover(el: HTMLElement) {
    // Do something
    // console.log("settup", atter)
    // atter.imagePath = null;
    if (!el.dataset || !el.dataset["isInitialized"]) {
      el.dataset["isInitialized"] = "isInitialized";
      await this.imageRecoverService.initialize(el);
    }
  }
  private load(el: HTMLElement | HTMLImageElement, src: string) {
    let url = src;
    url = this.addVersion(url);
    this.ngZone.runOutsideAngular(() => {
      el.style.opacity = `0.01`;
      // console.log("加载图片耗时：", Date.now() - this.time);
      if (el instanceof HTMLDivElement) {
        // this.render.setProperty(this.el.nativeElement,'backgroundImage',`${src || this.lazyLoad}`);
        el.style.backgroundImage = `url('${url}')`;
      } else {
        el["src"] = url || this.addVersion(el["lazyLoad"]);
      }
    });
  }
  private removeIO(el: any) {
    if (el.io) {
      el.io.disconnect();
      el.io = undefined;
    }
  }
}
