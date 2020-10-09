import { SwiperSlidesComponent } from "./../components/swiper-slides/swiper-slides.component";
import { Injectable, NgZone, EventEmitter } from "@angular/core";
import { AppHelper } from "../appHelper";
import { ImageRecoverService } from "../services/imageRecover/imageRecover.service";

@Injectable({
  providedIn: "root",
})
export class LazyloadService {
  constructor(
    private ngZone: NgZone,
    private imageRecoverService: ImageRecoverService
  ) { }
  getNormalizeUrl(url: string) {
    if (url) {
      const m = url.includes("?v") ? url.substring(0, url.indexOf("?v")) : url;
      return m;
    }
    return url || "";
  }
  appendHtmlStr(data: {
    container: HTMLElement;
    htmlStr: string;
    defaultImage: string;
    loadingImage: string;
    isCanView?: boolean;
  }) {
    const container = data.container;
    const defaultImage = data.defaultImage;
    const loadingImage = data.loadingImage;
    const df = document.createDocumentFragment();
    const div = document.createElement("div");
    div.innerHTML = data.htmlStr;
    const imgs = div.querySelectorAll("img");
    if (imgs && imgs.length) {
      const images: { imageUrl: string }[] = [];
      imgs.forEach((img) => {
        images.push({
          imageUrl: img.src,
        });
      });
      imgs.forEach((img, pos) => {
        if (data.isCanView) {
          img.onclick = async () => {
            const tap = new EventEmitter();
            const m = await AppHelper.modalController.create({
              component: SwiperSlidesComponent,
              componentProps: {
                items: images,
                isOpenAsModel: true,
                bgColorBlack: true,
                tap,
                initialPos: pos,
                defaultImage,
                loadingImage,
                options: { imageStyle: { objectFit: "contain" } },
              },
            });
            m.present();
            tap.subscribe(() => {
              AppHelper.modalController.getTop().then((t) => {
                if (t) {
                  t.dismiss();
                }
              });
            });
          };
        }
        const lazyLoad = img.src;
        img.src = loadingImage || defaultImage;
        img["lazyLoad"] = lazyLoad;
        img.style.transition = "all ease-in-out 200ms";
        img.onload = () => {
          img.style.opacity = "1";
        };
        img.onerror = () => {
          img.style.opacity = "1";
        };
        this.addIO(img, lazyLoad, defaultImage, loadingImage, false);
      });
    }
    df.append(div);
    if (container) {
      container.append(df);
    }
  }
  private addIO(
    el: HTMLElement,
    lazyLoad: string,
    defaultImage: string,
    loadingImage: string,
    isPreventBgImage: boolean
  ) {
    if (!lazyLoad) {
      if (defaultImage) {
        this.load({
          el,
          isPreventBgImage,
          src: lazyLoad,
          defaultImage,
          loadingImage,
        });
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
          this.load({ el, src: el["lazyLoad"], defaultImage, loadingImage, isPreventBgImage });
          this.removeIO(el);
        } else if (AppHelper.isDingtalkH5()) {
          setTimeout(() => {
            this.load({ el, src: el["lazyLoad"], defaultImage, loadingImage, isPreventBgImage });
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
      setTimeout(
        () =>
          this.load({ el, src: el["lazyLoad"], loadingImage, defaultImage, isPreventBgImage }),
        200
      );
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
  load(data: {
    el: HTMLElement | HTMLImageElement;
    src: string;
    isPreventBgImage: boolean;
    defaultImage: string;
    loadingImage: string;
  }) {
    let src = data.src;
    const el = data.el;
    const loadingImage = data.loadingImage;
    const defaultImage = data.defaultImage;
    src = src || this.addVersion(el["lazyLoad"]);
    const url = this.addVersion(src);
    this.ngZone.runOutsideAngular(() => {
      if (!data.isPreventBgImage) {
        if (el instanceof HTMLDivElement) {
          el.style.backgroundImage = `url('${loadingImage}')`;
        } else {
          el["src"] = loadingImage;
        }
      }
      el.classList.add("lazyloading");
      el.style.opacity = `0.01`;
      setTimeout(() => {
        el.style.opacity = `1`;
      }, 200);
      this.imageRecoverService.recover(
        url,
        (loadedSrc) => {
          if (el instanceof HTMLDivElement) {
            if (!data.isPreventBgImage) {
              el.style.backgroundImage = `url('${loadedSrc}')`;
            }
          } else {
            el["src"] = loadedSrc;
          }
          el.style.opacity = `1`;
          const imgSrc = this.getNormalizeUrl(loadedSrc).toLowerCase();
          if (imgSrc == this.getNormalizeUrl(defaultImage).toLowerCase()) {
            el.setAttribute("loaderror", "unloaded");
          } else {
            el.removeAttribute("loaderror");
          }
          el.classList.add("lazyloaded");
          el.classList.remove("lazyloading");
        },
        (failoverDefaultUrl) => {
          el.classList.remove("lazyloaderror");
          el.classList.remove("lazyloading");
          if (el instanceof HTMLDivElement) {
            if (!data.isPreventBgImage) {
              el.style.backgroundImage = `url('${defaultImage || failoverDefaultUrl
                }')`;
            }
          } else {
            el["src"] = defaultImage || failoverDefaultUrl;
          }
          el.setAttribute("loaderror", "unloaded");
          el.style.opacity = `1`;
        }
      );
    });
  }
  private removeIO(el: any) {
    if (el.io) {
      el.io.disconnect();
      el.io = undefined;
    }
  }
}
