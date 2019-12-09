import { Platform } from '@ionic/angular';
import { OnInit, OnDestroy } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Directive } from '@angular/core';

@Directive({
  selector: 'ion-refresher'
})
export class RefresherDirective implements OnInit, OnDestroy {
  private isWechatH5 = /micromessenger/gi.test(window.navigator.userAgent);
  private scroller: HTMLElement;
  private startY = 0;
  private scrollTop = 0;
  constructor(private el: ElementRef<HTMLElement>, private plt: Platform) { }
  private scrollStart(evt: TouchEvent) {
    this.startY = evt.touches[0] && evt.touches[0].clientY;
    this.scrollTop = this.scroller && this.scroller.scrollTop;
  }
  private scrollFn(evt: TouchEvent) {
    // console.log(evt);
    const delta = evt.touches[0] && evt.touches[0].clientY - this.startY;
    // console.log("detal", delta)
    if (evt) {
      if (evt.cancelable) {
        if (delta >= 0 && this.scrollTop <= 0) {
          // console.log("detal", delta)
          evt.preventDefault();
        }
      }
    }
  }
  ngOnDestroy() {
    document.body.removeEventListener("touchstart", this.scrollStart.bind(this));
    document.body.removeEventListener("touchmove", this.scrollFn.bind(this));
  }
  async ngOnInit() {
    if (this.el.nativeElement) {
      // console.dir(this.el);
      this.el.nativeElement['pullFactor'] = 1.1;
      if(this.el.nativeElement['ionRefresh']){
        
      }
    }
    const isAndroidWechatH5 = this.plt.is('android') && this.isWechatH5;
    if (isAndroidWechatH5) {
      // console.log("IonContentDirective", this.el, "是否在微信浏览器内部：", this.isWechatH5);
      const content = this.el.nativeElement.closest("ion-content");
      if (content) {
        this.scroller = await content.getScrollElement();

        // this.overscroll(this.scroller.querySelector(".scroll"));
        document.body.addEventListener("touchmove", this.scrollFn.bind(this), {
          passive: false,
        });
        document.body.addEventListener("touchstart", this.scrollStart.bind(this));
      }
    }
  }
}
