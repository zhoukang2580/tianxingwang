import { DomSanitizer } from '@angular/platform-browser';
import { OnInit, OnChanges, Input, OnDestroy, Renderer2, ElementRef, AfterContentInit } from '@angular/core';
import { Directive } from '@angular/core';
import { ImageRecoverService } from '../services/imageRecover/imageRecover.service';

@Directive({
  selector: '[lazyLoad]'
})
export class LazyloadDirective implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  private io: IntersectionObserver;
  @Input() lazyLoad: string;
  @Input() defaultImage: string;
  constructor(private imageRecoverService: ImageRecoverService, private el: ElementRef<HTMLDivElement | HTMLImageElement>, private render: Renderer2) { }
  ngOnChanges() {
    this.addIO();
  }
  ngAfterContentInit() {
  }
  ngOnInit() {
    this.setupImageRecover();
    this.setDefaultImage();
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
    if (!this.el.nativeElement.dataset || !this.el.nativeElement.dataset['isInitialized']) {
      this.imageRecoverService.initialize(this.el.nativeElement);
      this.el.nativeElement.dataset['isInitialized'] = "isInitialized";
    }
  }
  ngOnDestroy() {
    this.removeIO();
  }
  private load(src: string = null) {
    let url = decodeURIComponent(src || this.lazyLoad);
    url = `${url}`.replace(/\?v=\d+/g, "");
    // console.log('load url:', url);
    if (this.el.nativeElement instanceof HTMLDivElement) {
      this.render.setStyle(this.el.nativeElement, 'background-image', `url(${url})`);
      // this.render.setProperty(this.el.nativeElement,'backgroundImage',`${src || this.lazyLoad}`);
      // this.el.nativeElement.style.backgroundImage=`${src || this.lazyLoad}`;
    } else {
      this.render.setProperty(this.el.nativeElement, 'src', url);
      // this.el.nativeElement.src = src || this.lazyLoad;
    }
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
    if ('IntersectionObserver' in window && "IntersectionObserverEntry" in window) {
      console.log('当前浏览器支持：IntersectionObserver');
      this.removeIO();
      this.io = new IntersectionObserver(data => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        if (data.find(it=>it.isIntersecting)) {
          this.load();
          this.removeIO();
        }
      });
      this.io.observe(this.el.nativeElement);
    } else {
      // fall back to setTimeout for Safari and IE
      console.error('当前浏览器不支持：IntersectionObserver');
      setTimeout(() => this.load(), 200);
    }
  }
}
