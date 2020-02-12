import { Subscription, fromEvent } from "rxjs";
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
  SimpleChanges
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
    private domCtrl: DomController
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
  async ngOnInit() {
    this.content = (this.el.nativeElement.closest(
      "ion-content"
    ) as any) as IonContent;
    if (!this.content) {
      this.content = this.el.nativeElement.parentElement.querySelector(
        "ion-content"
      ) as any;
    }
    if (!this.content) {
      console.error("请将组件放置在<ion-content>内部");
      return;
    }
    this.scrollEle = await this.content.getScrollElement();
    this.obserScoll();
  }
  private obserScoll() {
    if (!this.scrollEle) {
      return;
    }
    const height = this.scrollEle.offsetHeight;
    const threshold = 0.15 * height;
    this.subscriptions.push(
      fromEvent(this.scrollEle, "scroll").subscribe(_ => {
        console.log("status isloading", this.status.isLoading);
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
          const scrollHeight = this.scrollEle.scrollHeight;
          const scrollTop = this.scrollEle.scrollTop;
          const distanceFromInfinite =
            scrollHeight - height - scrollTop - threshold;
          // console.log(
          //   `scrollHeight=${scrollHeight},distanceFromInfinite=${distanceFromInfinite}`
          // );
          if (distanceFromInfinite < 0) {
            if (!this.status.isLoading) {
              this.status.isLoading = true;
              this.ionInfinite.emit();
              return 3;
            }
          }
        });
      })
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngAfterViewInit() {}
}
