import { OnInit, OnDestroy } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Directive } from '@angular/core';
import { fromEvent } from 'rxjs';

@Directive({
  selector: 'ion-refresher'
})
export class RefresherDirective implements OnInit, OnDestroy {
  private isWechatH5 =  /micromessenger/gi.test(window.navigator.userAgent);
  private scroller: HTMLElement;
  private startY = 0;
  private scrollTop = 0;
  constructor(private el: ElementRef<HTMLElement>) { }
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
        if (delta >= 0 && this.scrollTop < this.el.nativeElement['pullMin']) {
          console.log("detal", delta)
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
    if (this.isWechatH5) {
      console.log("IonContentDirective", this.el, "是否在微信浏览器内部：", this.isWechatH5);
      if (this.el.nativeElement) {
        // this.el.nativeElement['pullMin'] = 30;
        // this.el.nativeElement['pullFactor'] = 1.1;
      }
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
