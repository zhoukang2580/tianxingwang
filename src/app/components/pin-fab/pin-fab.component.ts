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
  styleUrls: ["./pin-fab.component.scss"]
})
export class PinFabComponent implements OnInit, OnDestroy, AfterViewInit {
  // @HostBinding("@showfab") showfab;
  @Input() name = "arrow-dropup";
  @Input() vertical = "bottom";
  @Input() horizontal = "end";
  private subscriptions: Subscription[] = [];
  private isScrollingCheck = false;
  private content: IonContent;
  private ionFabBtn: HTMLElement;
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
    this.ionFabBtn = this.el.nativeElement.querySelector("ion-fab-button");
    await this.startCheck();
    this.checkIsScrolling();
  }
  private showFab(isShow: boolean) {
    if (!isShow) {
      this.stopCheck();
      this.removeAnimation();
    }
  }
  private addAnimation() {
    if (this.isAnimationAdded) {
      return;
    }
    this.isAnimationAdded = true;
    this.render.removeClass(this.ionFabBtn, `activated`);
    this.render.setStyle(this.ionFabBtn, "animation-name", "fabAnimation", 2);
    this.render.setStyle(
      this.ionFabBtn,
      "-webkit-animation-name",
      "fabAnimation",
      2
    );
  }
  private removeAnimation() {
    this.render.removeStyle(this.ionFabBtn, "animation-name", 2);
    this.render.removeStyle(this.ionFabBtn, "-webkit-animation-name", 2);
    this.render.removeClass(this.ionFabBtn, `activated`);
    this.isAnimationAdded = false;
  }
  private checkIsScrolling() {
    this.scrollTimerSubscription.unsubscribe();
    this.isScrollingCheck = true;
    this.scrollTimerSubscription = interval(100).subscribe(_ => {
      const isScrolling = Date.now() - this.scrollTimer < 130;
      // console.log("isscrolling", Date.now() - this.scrollTimer);
      if (isScrolling) {
        if (!this.isInitStyle) {
          this.isInitStyle = true;
          this.removeAnimation();
          if (this.ionFabBtn) {
            this.render.addClass(this.ionFabBtn, "scrolling");
          }
        }
      } else {
        this.stopCheck();
        this.isInitStyle = false;
        this.addAnimation();
        if (this.ionFabBtn) {
          this.render.removeClass(this.ionFabBtn, "scrolling");
        }
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
