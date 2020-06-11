import { Platform } from "@ionic/angular";
import { Subscription, fromEvent } from "rxjs";
import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy
} from "@angular/core";

@Directive({
  selector: "[appDragelement]"
})
export class DragElementDirective implements OnInit, OnDestroy {
  private halfW = 0;
  private halfH = 0;
  private subscriptions: Subscription[] = [];
  constructor(
    private el: ElementRef<HTMLElement>,
    private render: Renderer2,
    private plt: Platform
  ) {}
  ngOnInit() {
    console.log(this.el.nativeElement);
    this.el.nativeElement.draggable = true;
    const sub1 = fromEvent(this.el.nativeElement, "touchmove").subscribe(
      (evt: TouchEvent) => {
        this.onMove(evt);
      }
    );
    const sub = fromEvent(this.el.nativeElement, "touchstart").subscribe(
      (evt: TouchEvent) => {
        this.render.setStyle(this.el.nativeElement, "opacity", 0.5);
      }
    );
    const sub2 = fromEvent(this.el.nativeElement, "touchend").subscribe(
      (evt: TouchEvent) => {
        this.render.setStyle(this.el.nativeElement, "opacity", 1);
        console.log(evt);
        requestAnimationFrame(_ => {
          const left = Math.min(
            +this.el.nativeElement.style.left.replace("px", ""),
            this.plt.width() - 2 * this.halfW
          );
          const top = Math.min(
            +this.el.nativeElement.style.top.replace("px", ""),
            this.plt.height() - 2 * this.halfH
          );
          console.log(left, top);
          this.setStyle(Math.max(this.halfW, left), Math.max(top, this.halfH));
        });
      }
    );
    this.subscriptions.push(sub1);
    this.subscriptions.push(sub);
    this.subscriptions.push(sub2);
    setTimeout(() => {
      const rect = this.el.nativeElement.getBoundingClientRect();
      if (rect) {
        this.halfW = rect.width / 2;
        this.halfH = rect.height / 2;
      }
    }, 200);
  }
  private setStyle(left: number, top: number) {
    this.render.setStyle(this.el.nativeElement, "left", `${left}px`);
    this.render.setStyle(this.el.nativeElement, "top", `${top}px`);
  }
  onMove(evt: TouchEvent) {
    evt.preventDefault();
    if (evt.touches.length > 1) {
      return;
    }
    if (!evt.touches.length) {
      return;
    }
    requestAnimationFrame(_ => {
      this.setStyle(
        evt.touches[0].clientX - this.halfW,
        evt.touches[0].clientY - this.halfH * 2
      );
    });
  }
  onDrop(evt: DragEvent) {
    console.log(evt);
    evt.preventDefault();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
