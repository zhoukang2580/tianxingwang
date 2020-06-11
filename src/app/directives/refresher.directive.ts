// import { Platform } from '@ionic/angular';
// import { OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// import { ElementRef } from '@angular/core';
// import { Directive } from '@angular/core';

// @Directive({
//   selector: 'ion-refresher'
// })
// export class RefresherDirective implements OnInit, AfterViewInit, OnDestroy {
//   private isWechatH5 = /micromessenger/gi.test(window.navigator.userAgent);
//   private scroller: HTMLElement;
//   private startY = 0;
//   private content: HTMLIonContentElement;
//   constructor(private el: ElementRef<HTMLElement>, private plt: Platform) { }
//   private scrollStart(evt: TouchEvent) {
//     this.startY = evt.touches[0] && evt.touches[0].clientY;
//     if (!this.scroller) {
//       this.content = this.el.nativeElement.closest("ion-content");
//       if (this.content) {
//         this.content.getScrollElement().then(el => {
//           this.scroller = el;
//         });
//       }
//     }
//   }
//   private scrollFn(evt: TouchEvent) {

//     // console.log(evt);
//     const delta = evt.touches[0] && evt.touches[0].clientY - this.startY;
//     if (evt) {
//       if (evt.cancelable) {
//         const scrollTop = this.scroller && this.scroller.scrollTop || 0;
//         window['_isPreventDefault'] = delta >= 0 && scrollTop <= 0;
//         console.log("detal", delta,scrollTop, window['_isPreventDefault'])
//         if (delta >= 0 && scrollTop <= 0) {
//           // console.log("detal", delta)
//           evt.preventDefault();
//         }
//       }
//     }
//   }
//   ngOnDestroy() {
//     document.body.removeEventListener("touchstart", this.scrollStart.bind(this));
//     document.body.removeEventListener("touchmove", this.scrollFn.bind(this));
//     document.body.removeEventListener("touchend", this.touchend.bind(this));
//   }
//   private touchend() {
//     window['_isPreventDefault'] = false;
//   }
//   ngAfterViewInit() {
//     setTimeout(async () => {
//       // window['_isPreventDefault'] = true;
//       if (this.el.nativeElement) {
//         // console.dir(this.el);
//         this.el.nativeElement['pullFactor'] = 1.1;
//       }
//       const isAndroidWechatH5 = this.plt.is('android') && this.isWechatH5;
//       if (isAndroidWechatH5) {
//         // console.log("IonContentDirective", this.el, "是否在微信浏览器内部：", this.isWechatH5);
//         this.content = this.el.nativeElement.closest("ion-content");
//         if (this.content) {
//           this.scroller = await this.content.getScrollElement();
//           document.body.addEventListener("touchmove", this.scrollFn.bind(this), false);
//           document.body.addEventListener("touchstart", this.scrollStart.bind(this), false);
//           document.body.addEventListener("touchend", this.touchend.bind(this), false);
//         }
//       }
//     }, 1000);
//   }
//   ngOnInit() {
//   }
// }
