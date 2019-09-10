import { Subscription, fromEvent, interval } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChildren,
  QueryList,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { Platform, DomController } from "@ionic/angular";
import { switchMap, tap, takeUntil, takeLast } from "rxjs/operators";

@Component({
  selector: "app-image-scroller",
  templateUrl: "./image-scroller.component.html",
  styleUrls: ["./image-scroller.component.scss"]
})
export class ImageScrollerComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("imageContainer") imageContainer: ElementRef<HTMLElement>;
  @ViewChildren("imgEle") imgEles: QueryList<ElementRef<HTMLImageElement>>;
  @Input() images: string[] = [];
  @Output() close: EventEmitter<any>;
  subscriptions: Subscription[] = [];
  width = 0;
  scrollEndIntervalId: any;
  lastScrollTime = 0;
  curIndex = 0;
  constructor(
    plt: Platform,
    private domCtrl: DomController,
    private render: Renderer2
  ) {
    this.width = plt.width();
    this.close = new EventEmitter();
  }
  ngAfterViewInit() {
    if (this.imageContainer && this.imageContainer.nativeElement) {
      let lastPos = 0;
      let deltaX = 0;
      let startX = 0;
      let isMoveLeft = true;
      const sub = fromEvent(this.imageContainer.nativeElement, "touchstart")
        .pipe(
          tap((evt: TouchEvent) => {
            startX = evt.touches[0].pageX;
            const lastTransform =
              this.imageContainer.nativeElement.style.transform ||
              `translate3d(0,0,0)`;
            lastPos = this.getTranformPos(lastTransform);
            // console.log("lastPos", lastPos);
          }),
          switchMap(evt =>
            fromEvent(this.imageContainer.nativeElement, "touchmove")
          )
        )
        .subscribe((evt: TouchEvent) => {
          deltaX = evt.touches[0].pageX - startX;
          isMoveLeft = deltaX < 0;
          this.onMove(isMoveLeft, deltaX, lastPos);
        });
      const sub2 = fromEvent(
        this.imageContainer.nativeElement,
        "touchend"
      ).subscribe((evt: TouchEvent) => {
        setTimeout(() => {
          this.onScrollEnd(lastPos, deltaX, isMoveLeft);
        }, 100);
      });
      this.subscriptions.push(sub);
      this.subscriptions.push(sub2);
    }
  }
  private onMove(isMoveLeft: boolean, deltaX: number, lastPos: number) {
    if (this.imageContainer && this.imageContainer.nativeElement) {
      this.domCtrl.write(_ => {
        deltaX = isMoveLeft ? -Math.abs(deltaX) : Math.abs(deltaX);
        this.render.setStyle(
          this.imageContainer.nativeElement,
          "transform",
          `translate3d(${lastPos + deltaX}px,0,0)`
        );
      });
    }
  }
  onClose() {
    this.close.emit();
  }
  getTranformPos(latestTransform: string = `transform3d(0,0,0)`) {
    return +latestTransform
      .substring(`translate3d(`.length, latestTransform.indexOf(","))
      .replace("px", "");
  }
  private onScrollEnd(lastPos: number, deltaX: number, isMoveLeft: boolean) {
    if (this.scrollEndIntervalId) {
      clearInterval(this.scrollEndIntervalId);
    }
    this.scrollEndIntervalId = null;
    // console.log("滚动停止", lastPos, deltaX, isMoveLeft);
    this.scrollImageToCenter(lastPos, deltaX, isMoveLeft);
  }
  private scrollImageToCenter(
    lastPos: number,
    deltaX: number,
    isMoveLeft: boolean
  ) {
    const curScrollPos = Math.abs(
      this.getTranformPos(this.imageContainer.nativeElement.style.transform)
    );
    this.curIndex = isMoveLeft ? this.curIndex + 1 : this.curIndex - 1;
    this.curIndex =
      this.curIndex < 0
        ? 0
        : this.curIndex >= this.images.length
        ? this.images.length - 1
        : this.curIndex;
    const finalPos = isMoveLeft
      ? -this.curIndex * this.width
      : lastPos
      ? this.curIndex * this.width * (lastPos / Math.abs(lastPos))
      : this.curIndex * this.width;
    // console.log(
    //   "scrollImageToCenter2",
    //   "curIndex",
    //   this.curIndex,
    //   `curScrollPos=${curScrollPos},lastPos=${lastPos},deltaX=${deltaX},finalPos=${finalPos}`
    // );
    this.render.setStyle(
      this.imageContainer.nativeElement,
      "transform",
      `translate3d(${finalPos}px,0,0)`
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  ngOnInit() {
    if (!this.images || !this.images.length) {
      this.images = [
        `https://dimg04.c-ctrip.com/images//200w0j000000adn01C1E3_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//20010j000000abuqn111A_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//200s0j000000addzr5076_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//200a0j000000aaxyr2867_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//200m0r000000hk6fdD193_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//20040j000000aaz0p8DAB_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//200f0m000000dexohC099_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//200k0j000000abmiv4690_C_750_400_Q50.jpg_.webp`,
        `https://dimg04.c-ctrip.com/images//200c0m000000di4yy22D1_C_750_400_Q50.jpg_.webp`
      ];
    }
  }
}
