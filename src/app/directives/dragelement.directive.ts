import { Platform } from "@ionic/angular";
import { Subscription, fromEvent } from "rxjs";
import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
} from "@angular/core";

@Directive({
  selector: "[appDragelement]",
})
export class DragElementDirective implements OnInit, OnDestroy {
  private halfW = 0;
  private halfH = 0;
  private orgOpacity;
  private orgPos: { x: number; y: number };
  private subscriptions: Subscription[] = [];
  constructor(
    private el: ElementRef<HTMLElement>,
    private render: Renderer2,
    private plt: Platform
  ) {}
  ngOnInit() {
    // console.log(this.el.nativeElement);
    if (this.el.nativeElement.style.opacity) {
      this.orgOpacity = this.el.nativeElement.style.opacity;
    }
    this.el.nativeElement.draggable = true;
    const sub1 = fromEvent(this.el.nativeElement, "touchmove").subscribe(
      (evt: TouchEvent) => {
        this.onMove(evt);
      }
    );
    const sub = fromEvent(this.el.nativeElement, "touchstart").subscribe(
      (evt: TouchEvent) => {
        this.render.setStyle(this.el.nativeElement, "opacity", 0.4);
      }
    );
    const sub2 = fromEvent(this.el.nativeElement, "touchend").subscribe(
      (evt: TouchEvent) => {
        if (this.orgOpacity) {
          this.render.setStyle(
            this.el.nativeElement,
            "opacity",
            this.orgOpacity
          );
        } else {
          this.render.setStyle(this.el.nativeElement, "opacity", 1);
        }
        requestAnimationFrame((_) => {
          const transform = this.el.nativeElement.style.transform || "";
          const arr = transform.match(/[-]?\d+/g);
          if (arr && arr.length > 1) {
            let [left, top] = arr.slice(1).map((it) => +it);
            const l = left;
            const t = top;
            left =
              left < 0
                ? -(this.orgPos && this.orgPos.x) || 0
                : left > this.plt.width() - 2 * this.halfH
                ? this.plt.width() - 2 * this.halfH
                : left;
            top =
              top < 0
                ? -(this.orgPos && this.orgPos.y) || 0
                : top > this.plt.height() - 2 * this.halfH
                ? this.plt.height() - 2 * this.halfH
                : top;
            // console.log(
            //   `touchend transform=${transform},orgPos.x=${this.orgPos.x},orgPos.y=${this.orgPos.y}`
            // );
            if (
              l < 0 ||
              l > this.plt.width() ||
              t > this.plt.height() ||
              t < 0
            ) {
              this.setStyle(left, top);
            }
          }
        });
      }
    );
    this.subscriptions.push(sub1);
    this.subscriptions.push(sub);
    this.subscriptions.push(sub2);
    setTimeout(() => {
      try {
        const rect = this.el.nativeElement.getBoundingClientRect();
        // console.log("rect", rect);
        if (rect) {
          this.halfW = rect.width / 2;
          this.halfH = rect.height / 2;
          this.orgPos = {
            x: rect.left,
            y: rect.top,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }, 200);
  }
  private setStyle(left: number, top: number) {
    this.render.setStyle(
      this.el.nativeElement,
      "transform",
      `translate3d(${left}px,${top}px,0)`
    );
  }
  onMove(evt: TouchEvent) {
    evt.preventDefault();
    if (!evt.touches.length) {
      return;
    }
    if (evt.touches.length > 1) {
      return;
    }
    requestAnimationFrame((_) => {
      const t = evt.touches[0];
      // console.log("touches t", t);
      this.setStyle(t.clientX - this.halfW, t.clientY - this.halfH);
    });
  }
  onDrop(evt: DragEvent) {
    console.log(evt);
    evt.preventDefault();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
