import { OnInit, OnChanges, Input, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Directive } from '@angular/core';
import { ImageRecoverService } from '../services/imageRecover/imageRecover.service';

@Directive({
  selector: '[lazyLoad]'
})
export class LazyloadDirective implements OnInit, OnChanges, OnDestroy {
  private io: IntersectionObserver;
  @Input() lazyLoad: string;
  @Input() defaultImage: string;
  constructor(private imageRecoverService: ImageRecoverService, private el: ElementRef<HTMLDivElement | HTMLImageElement>, private render: Renderer2) { }
  ngOnChanges() {
    this.setupImageRecover();
    this.setDefaultImage();
    this.addIO();
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
    if (this.el.nativeElement instanceof HTMLDivElement) {
      // this.render.setStyle(this.el.nativeElement, 'background-image', `url(${src || this.lazyLoad})`);
      this.render.setProperty(this.el.nativeElement,'backgroundImage',`url(${src || this.lazyLoad})`);
    } else {
      this.el.nativeElement.src = src || this.lazyLoad;
    }
  }
  private removeIO() {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }
  private addIO() {
    if (this.lazyLoad === undefined) {
      return;
    }
    if ('IntersectionObserver' in window) {
      this.removeIO();
      this.io = new IntersectionObserver(data => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        if (data[0].isIntersecting) {
          this.load();
          this.removeIO();
        }
      });
      this.io.observe(this.el.nativeElement);
    } else {
      // fall back to setTimeout for Safari and IE
      setTimeout(() => this.load(), 200);
    }
  }
}
