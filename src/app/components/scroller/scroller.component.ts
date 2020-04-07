import { Subscription, fromEvent, interval } from "rxjs";
import { IonContent, DomController } from "@ionic/angular";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostBinding,
  DoCheck,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  NgZone
} from "@angular/core";
export interface IScrollerStatus {
  isLoading: boolean;
  disabled?: boolean;
}
@Component({
  selector: "app-scroller",
  templateUrl: "./scroller.component.html",
  styleUrls: ["./scroller.component.scss"]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollerComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges, DoCheck {
  @Input() status: IScrollerStatus;
  @Output() statusChange: EventEmitter<any>;
  @Output() ionInfinite: EventEmitter<any>;
  private scrollEle: HTMLElement;
  private content: IonContent;
  private subscriptions: Subscription[] = [];
  @HostBinding("class.show")
  private show: boolean;
  constructor(
    private el: ElementRef<HTMLElement>,
    private domCtrl: DomController,
    private ngZone: NgZone
  ) {
    this.statusChange = new EventEmitter();
    this.ionInfinite = new EventEmitter();
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log("ngOnChanges", changes);
  }
  ngDoCheck() {
    this.show = this.status && this.status.isLoading;
  }
  private onScroll() {
    let height = 0;
    let threshold = 0;
    let scrollHeight = 0;
    let scrollTop = 0;
    if (!this.status) {
      this.status = { isLoading: false };
    }
    if (this.status.disabled) {
      return;
    }
    if (this.status.isLoading) {
      return;
    }
    this.domCtrl.read(() => {
      height = height || this.scrollEle.offsetHeight;
      threshold = 0.15 * height;
      scrollHeight = this.scrollEle.scrollHeight;
      scrollTop = this.scrollEle.scrollTop;
      const distanceFromInfinite =
        scrollHeight - height - scrollTop - threshold;
      // console.log(
      //   `height:${height},scrollHeight=${scrollHeight},scrollTop=${scrollTop},threshold=${threshold}
      //   ,distanceFromInfinite=${distanceFromInfinite},`
      // );
      if (distanceFromInfinite < 0) {
        if (!this.status.isLoading) {
          this.status.isLoading = true;
          this.ionInfinite.emit();
          return 3;
        }
      }
    });
  }
  async ngOnInit() {
    this.content = (this.el.nativeElement.closest(
      "ion-content"
    ) as any) as IonContent;
    if (!this.content) {
      this.content = this.el.nativeElement.parentElement.querySelector(
        "ion-content"
      ) as any;
    }
    this.scrollEle = this.content
      ? await this.content.getScrollElement()
      : this.el.nativeElement.parentElement.querySelector(".inner-scroll") ||
        this.el.nativeElement.parentElement;
    if (!this.scrollEle) {
      console.error("请将组件放置在<ion-content>内部");
      return;
    }
    console.log(
      this.scrollEle,
      this.scrollEle.offsetHeight,
      this.scrollEle.clientHeight
    );
    this.observeAction();
  }

  private observeAction() {
    if (!this.scrollEle) {
      return;
    }
    this.subscriptions.push(
      fromEvent(this.scrollEle, "scroll").subscribe(() => this.onScroll())
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngAfterViewInit() {}
}
