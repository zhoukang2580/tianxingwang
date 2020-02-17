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
import {
  IonContent,
  IonFab,
  DomController,
  IonFabButton
} from "@ionic/angular";
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
  @ViewChild(IonFabButton, { static: true }) private fabBtn: IonFabButton;
  private subscriptions: Subscription[] = [];
  private content: IonContent;
  private scrollEl: HTMLElement;
  private timer = Subscription.EMPTY;
  private lastTime = 0;
  private isScrolling = false;
  constructor(
    private render: Renderer2,
    private el: ElementRef<HTMLElement>,
    @Optional() private fab: IonFab,
    private domCtrl: DomController
  ) {}
  ngOnInit() {}
  ngOnDestroy() {
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
      this.subscriptions.push(
        fromEvent(this.fab["el"], "click").subscribe(_ => {
          if (this.content) {
            this.content.scrollToTop();
          }
        })
      );
      this.domCtrl.write(_ => {
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
    this.scrollEl = await this.content.getScrollElement();
    this.checkStatus();
  }
  private checkIsScrolling() {
    if (this.timer) {
      this.timer.unsubscribe();
    }
    this.timer = interval(200).subscribe(() => {
      this.isScrolling = Date.now() - this.lastTime < 120;
      if (this.isScrolling) {
        return;
      }
      this.timer.unsubscribe();
      this.domCtrl.write(() => {
        const top = this.scrollEl && this.scrollEl.scrollTop;
        if (top > 20) {
          if (this.fabBtn) {
            if (this.fabBtn["el"].classList.contains("hide")) {
              this.domCtrl.write(() => {
                this.render.removeClass(this.el.nativeElement, "hide");
                this.render.removeClass(this.fabBtn["el"], "hide");
                // this.draw(true);
              });
            }
          }
        } else {
          if (this.fabBtn) {
            if (!this.fabBtn["el"].classList.contains("hide")) {
              this.domCtrl.write(() => {
                // this.draw(false);
                this.render.addClass(this.fabBtn["el"], "hide");
                this.render.addClass(this.el.nativeElement, "hide");
              });
            }
          }
        }
      });
    });
    this.subscriptions.push(this.timer);
  }
  private checkStatus() {
    const el = this.scrollEl;
    if (!el) {
      return;
    }
    this.subscriptions.push(
      fromEvent(el, "touchstart").subscribe(() => {
        this.checkIsScrolling();
      })
    );
    this.checkIsScrolling();
    this.subscriptions.push(
      fromEvent(el, "scroll").subscribe((evt: TouchEvent) => {
        this.lastTime = Date.now();
      })
    );
  }
}
