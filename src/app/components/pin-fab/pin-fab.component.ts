import {
  Component,
  OnInit,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input,
  AfterViewInit,
  HostBinding,
  Optional,
  ViewContainerRef,
  TemplateRef,
  ViewChild
} from "@angular/core";
import {
  trigger,
  transition,
  style,
  animate,
  state
} from "@angular/animations";
import { Subscription, interval, fromEvent, from } from "rxjs";
import { IonContent, IonFab, DomController } from "@ionic/angular";
import { tap, map, switchMap } from "rxjs/operators";

@Component({
  selector: "app-pin-fab",
  templateUrl: "./pin-fab.component.html",
  styleUrls: ["./pin-fab.component.scss"],
  animations: [
    trigger("showfab", [
      state("true", style({ opacity: 1, transform: "translateX(0) scale(1)" })),
      state(
        "false",
        style({ opacity: 0, transform: "translateX(100%) scale(0.1)" })
      ),
      transition("*=>true", [
        style({ opacity: 0, transform: "translateX(100%) scale(0.1)" }),
        animate(
          "200ms ease-in",
          style({ opacity: 1, transform: "translateX(0) scale(1)" })
        )
      ]),
      transition("*=>false", [
        animate(
          "200ms 100ms ease-out",
          style({ opacity: 0, transform: "translateX(100%) scale(0.1)" })
        )
      ])
    ])
  ]
})
export class PinFabComponent implements OnInit, OnDestroy, AfterViewInit {
  // @HostBinding("@showfab") showfab;
  @ViewChild("canvas") canvasEl: ElementRef<HTMLCanvasElement>;
  @Input() name = "arrow-dropup";
  @Input() vertical = "bottom";
  @Input() horizontal = "end";
  private subscriptions: Subscription[] = [];
  private isScrollingCheck = false;
  private content: IonContent;
  private scrollTimer: number;
  private isInitStyle = false;
  private isShowFab = false;
  private isAnimationAdded = false;
  private scrollTimerSubscription = Subscription.EMPTY;
  constructor(
    private render: Renderer2,
    private el: ElementRef<HTMLElement>,
    @Optional() private fab: IonFab,
    private domCtrl: DomController
  ) {}
  ngOnInit() {}
  ngOnDestroy() {
    this.isScrollingCheck = false;
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  private draw(start = true) {
    let aniFrame;
    if (!start) {
      if (aniFrame) {
        window.cancelAnimationFrame(aniFrame);
      }
      return;
    }
    if (this.canvasEl && this.canvasEl.nativeElement) {
      const canvas = this.canvasEl.nativeElement;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const unit = 16;
      let opacity = 1;
      let dir;
      ctx.arc(w / 2, h / 2, 2 * Math.PI, 0, 0, true);
      ctx.fill();
      drawCircle("#3880ff", "white");
      function drawCircle(fillColor = "#3880ff", strokeColor = "white") {
        ctx.clearRect(0, 0, w, h);
        if (!start) {
          return;
        }
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor || "white";
        ctx.fill();
        // ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = strokeColor || "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        // ctx.save();
        ctx.beginPath();
        ctx.moveTo(w / 3, (h + unit / 2) / 2);
        ctx.lineTo(w / 2, (h + unit / 2) / 3);
        ctx.lineTo((2 * w) / 3, (h + unit / 2) / 2);
        ctx.stroke();
        if (aniFrame) {
          cancelAnimationFrame(aniFrame);
        }
        const increment = 0.005;
        aniFrame = requestAnimationFrame(_ => {
          if (dir) {
            opacity += increment;
          } else {
            opacity -= increment;
          }
          if (opacity <= 0.2 || opacity >= 1) {
            dir = !dir;
          }
          drawCircle(fillColor, strokeColor);
        });
      }
    }
  }
  async ngAfterViewInit() {
    if (this.fab && this.fab["el"]) {
      this.domCtrl.write(_ => {
        this.showFab(false);
        this.render.setAttribute(this.fab["el"], "edge", "");
        this.render.setAttribute(this.fab["el"], "mode", "ios");
        this.render.setAttribute(
          this.fab["el"],
          "vertical",
          `${this.vertical}`
        );
        this.render.setAttribute(
          this.fab["el"],
          "horizontal",
          `${this.horizontal}`
        );
        this.render.setAttribute(this.fab["el"], "slot", "fixed");
      });
    }
    this.content = this.el.nativeElement.closest("ion-content") as any;
    if (!this.content) {
      console.error("请将组件放于<ion-content>内部的<ion-fab>xxx</ion-fab>");
      return;
    }
    await this.startCheck();
    this.checkIsScrolling();
  }
  private showFab(isShow: boolean) {
    if (!isShow) {
      this.stopCheck();
      this.removeAnimation();
    }
    this.domCtrl.write(_ => {
      this.render.setProperty(this.fab["el"], "@showfab", isShow);
    });
  }
  private addAnimation() {
    if (this.isAnimationAdded) {
      return;
    }
    this.draw();
  }
  private removeAnimation() {
    this.isAnimationAdded = false;
    this.draw(false);
  }
  private checkIsScrolling() {
    this.scrollTimerSubscription.unsubscribe();
    this.isScrollingCheck = true;
    this.scrollTimerSubscription = interval(120).subscribe(_ => {
      const isScrolling = Date.now() - this.scrollTimer < 230;
      // console.log("isscrolling", Date.now() - this.scrollTimer);
      if (isScrolling) {
        if (!this.isInitStyle) {
          this.isInitStyle = true;
          this.removeAnimation();
          this.render.addClass(this.canvasEl.nativeElement, "scrolling");
        }
      } else {
        this.stopCheck();
        this.isInitStyle = false;
        this.render.removeClass(this.canvasEl.nativeElement, "scrolling");
        this.addAnimation();
      }
    });
    this.subscriptions.push(this.scrollTimerSubscription);
  }

  private async startCheck() {
    if (this.content) {
      const el = await this.content.getScrollElement();
      if (el) {
        this.subscriptions.push(
          fromEvent(el, "scroll")
            .pipe(
              tap(_ => {
                this.scrollTimer = Date.now();
              }),
              map(evt => (evt.target as HTMLElement).scrollTop)
            )
            .subscribe(top => {
              this.isShowFab = top >= 20;
              if (!this.isScrollingCheck) {
                this.checkIsScrolling();
              }
              this.showFab(this.isShowFab);
            })
        );
      }
    }
    return true;
  }
  private stopCheck() {
    this.isScrollingCheck = false;
    this.scrollTimerSubscription.unsubscribe();
  }
}
