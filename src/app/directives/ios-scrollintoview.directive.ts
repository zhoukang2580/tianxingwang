import { ElementRef } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { HostListener } from '@angular/core';
import { Directive } from '@angular/core';
import { Platform } from '@ionic/angular';

@Directive({
  selector: '[appIosScrollintoview],ion-textarea,input,textarea'
})
export class IosScrollintoviewDirective implements OnDestroy {
  private ele: HTMLElement;
  constructor(plt: Platform, private el: ElementRef<HTMLElement>) {
    if (el.nativeElement && plt.is("ios")) {
      if (typeof el.nativeElement['getInputElement'] == 'function') {
        this.el.nativeElement['getInputElement']().then(inputEl => {
          this.ele = inputEl;
          this.ele.addEventListener("blur", this.onBlur.bind(this));
        })
      } else {
        this.ele = el.nativeElement;
        this.ele.addEventListener("blur", this.onBlur.bind(this));
      }
    }
  }
  private onBlur() {
    // console.log(document.documentElement.offsetHeight, document.documentElement.clientHeight);
    if (
      document.documentElement.offsetHeight <=
      document.documentElement.clientHeight
    ) {
      document.body.scrollIntoView() // 回顶部
    }
  }
  ngOnDestroy() {
    if (this.ele) {
      this.ele.removeEventListener("blur", this.onBlur.bind(this));
    }
  }
}
