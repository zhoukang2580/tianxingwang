import { DomController } from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  QueryList,
  ViewChildren,
  OnChanges,
  SimpleChanges,
  HostBinding
} from "@angular/core";
import { Subscription, fromEvent } from "rxjs";
export class ScrollWheelItem {
  key: number;
  value: number;
  selected?: boolean;
}
@Component({
  selector: "app-select-wheel",
  templateUrl: "./select-wheel.component.html",
  styleUrls: ["./select-wheel.component.scss"]
})
export class SelectWheelComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild("scrollEle") scrollEle: ElementRef<HTMLElement>;
  @ViewChild("wheelcontainer") wheelcontainer: ElementRef<HTMLElement>;
  @ViewChildren("liEle") liEles: QueryList<ElementRef<HTMLElement>>;
  @Input() items: ScrollWheelItem[];
  @HostBinding("class.show")
  @Input()
  show = true;
  @Output() itemSelected: EventEmitter<ScrollWheelItem>;
  @Input() curSelectedItem: ScrollWheelItem;
  private scrollSubscription = Subscription.EMPTY;
  private watchDog: any;
  private lastScroll = 0;
  constructor(private domCtrl: DomController) {
    this.itemSelected = new EventEmitter();
  }
  ngOnDestroy() {
    this.scrollSubscription.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes &&
      changes.curSelectedItem &&
      changes.curSelectedItem.currentValue &&
      this.items
    ) {
      console.log(changes);
      setTimeout(() => {
        this.initCurSelectedView();
      }, 100);
    }
  }
  private initCurSelectedView() {
    if (this.items && this.curSelectedItem) {
      if (this.scrollEle && this.liEles) {
        const h =
          this.liEles &&
          this.liEles.first &&
          this.liEles.first.nativeElement &&
          this.liEles.first.nativeElement.clientHeight;
        const selected = this.items.find(it => it.selected);
        const index = this.items.indexOf(selected) - 1;
        // console.log("item", selected, index);
        const targetScrollTop = h * index;
        this.domCtrl.write(_ => {
          this.scrollEle.nativeElement.scrollTop = targetScrollTop;
        });
      }
    }
  }
  ngAfterViewInit() {
    this.initCurSelectedView();
    this.listenEleScroll();
  }
  private onScroll(
    scrollEle: ElementRef<HTMLElement>,
    eles: QueryList<ElementRef<HTMLElement>>
  ) {
    if (this.watchDog) {
      clearInterval(this.watchDog);
    }
    this.watchDog = setInterval(() => {
      if (this.lastScroll < Date.now() - 120) {
        this.onScrollEnd(scrollEle, eles);
      }
    }, 150);
  }
  private onScrollEnd(
    scrollEle: ElementRef<HTMLElement>,
    eles: QueryList<ElementRef<HTMLElement>>
  ) {
    clearInterval(this.watchDog);
    this.watchDog = null;
    const rect0 =
      this.wheelcontainer &&
      this.wheelcontainer.nativeElement &&
      this.wheelcontainer.nativeElement.getBoundingClientRect();
    if (!this.wheelcontainer || !rect0) {
      return;
    }
    if (eles) {
      const h =
        eles.first &&
        eles.first.nativeElement &&
        eles.first.nativeElement.clientHeight;
      const closestLiEles = eles.toArray();
      closestLiEles.sort((a, b) => {
        const recta = a.nativeElement.getBoundingClientRect();
        const rectb = b.nativeElement.getBoundingClientRect();
        const acenter = recta && recta.height / 2 + recta.top;
        const bcenter = rectb && rectb.height / 2 + rectb.top;
        const containerCenter = rect0.height / 2 + rect0.top;
        const AeleDelta = Math.abs(containerCenter - acenter);
        const BeleDelta = Math.abs(containerCenter - bcenter);
        return AeleDelta - BeleDelta;
      });
      const closestEl = closestLiEles[0].nativeElement;
      const selectedValue = closestEl.getAttribute("data");
      let index = 0;
      if (this.scrollEle == scrollEle) {
        this.items.forEach((it, i) => {
          it.selected = selectedValue === `${it.key}`;
          if (it.selected) {
            index = i;
            this.curSelectedItem = it;
            this.itemSelected.emit(it);
          }
        });
      }
      this.moveToPosition(scrollEle.nativeElement, h, index);
    }
  }
  private moveToPosition(
    scrollEle: HTMLElement,
    liEleHeight: number,
    closestIndex: number
  ) {
    if (closestIndex < 0 || !scrollEle || !liEleHeight) {
      return;
    }
    this.domCtrl.read(_ => {
      const index = closestIndex > 0 ? closestIndex - 1 : closestIndex;
      const scrollTop = scrollEle.scrollTop;
      const remain = scrollTop % liEleHeight;
      const targetScrollDelta = liEleHeight * index - scrollTop;
      if (remain !== 0 || targetScrollDelta) {
        this.domCtrl.write(_ => {
          scrollEle.scrollBy({
            top: targetScrollDelta,
            left: 0,
            behavior: "smooth"
          });
        });
      }
    });
  }
  ngOnInit() {}
  private listenEleScroll() {
    if (this.scrollEle) {
      this.scrollSubscription = fromEvent(
        this.scrollEle.nativeElement,
        "scroll"
      ).subscribe(evt => {
        this.onScroll(this.scrollEle, this.liEles);
        if (Date.now() - this.lastScroll < 32) {
          evt.preventDefault();
          evt.stopPropagation();
          return;
        }
        this.lastScroll = Date.now();
      });
    }
  }
}
