import { Subscription, fromEvent } from "rxjs";
import {
  Component,
  OnInit,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ViewEncapsulation
} from "@angular/core";

@Component({
  selector: "app-refresher",
  templateUrl: "./refresher.component.html",
  styleUrls: ["./refresher.component.scss"],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class RefresherComponent implements OnInit, OnDestroy, AfterViewInit {
  private appliedStyles = false;
  private didStart = false;
  private progress = 0;
  private scrollEl?: HTMLElement;
  private startY = 0;
  private intervalId;
  private _disabled;
  private isMoveBeginRefresh = false;
  private subscriptions: Subscription[] = [];
  constructor(private el: ElementRef<HTMLElement>) {
    this.ionRefresh = new EventEmitter();
    this.ionPull = new EventEmitter();
    this.ionStart = new EventEmitter();
  }
  ngAfterViewInit() {
    this.connectedCallback();
  }
  ngOnInit() {}
  ngOnDestroy() {
    this.disconnectedCallback();
  }
  get disabled() {
    return this.disabled;
  }
  /**
   * If `true`, the refresher will be hidden.
   */
  @Input() set disabled(value: boolean) {
    this._disabled = value;
    if (this._disabled) {
      this.close(RefresherState.Inactive, this.closeDuration);
    }
  }
  /**
   * The current state which the refresher is in. The refresher's states include:
   *
   * - `inactive` - The refresher is not being pulled down or refreshing and is currently hidden.
   * - `pulling` - The user is actively pulling down the refresher, but has not reached the point yet that if the user lets go, it'll refresh.
   * - `cancelling` - The user pulled down the refresher and let go, but did not pull down far enough to kick off the `refreshing` state. After letting go, the refresher is in the `cancelling` state while it is closing, and will go back to the `inactive` state once closed.
   * - `ready` - The user has pulled down the refresher far enough that if they let go, it'll begin the `refreshing` state.
   * - `refreshing` - The refresher is actively waiting on the async operation to end. Once the refresh handler calls `complete()` it will begin the `completing` state.
   * - `completing` - The `refreshing` state has finished and the refresher is in the way of closing itself. Once closed, the refresher will go back to the `inactive` state.
   */
  private state: RefresherState = RefresherState.Inactive;

  /**
   * The minimum distance the user must pull down until the
   * refresher will go into the `refreshing` state.
   */
  @Input() pullMin = 60;

  /**
   * The maximum distance of the pull until the refresher
   * will automatically go into the `refreshing` state.
   * Defaults to the result of `pullMin + 60`.
   */
  @Input() pullMax: number = this.pullMin + 60;

  /**
   * Time it takes to close the refresher.
   */
  @Input() closeDuration = "280ms";

  /**
   * Time it takes the refresher to to snap back to the `refreshing` state.
   */
  @Input() snapbackDuration = "280ms";

  /**
   * How much to multiply the pull speed by. To slow the pull animation down,
   * pass a number less than `1`. To speed up the pull, pass a number greater
   * than `1`. The default value is `1` which is equal to the speed of the cursor.
   * If a negative value is passed in, the factor will be `1` instead.
   *
   * For example: If the value passed is `1.2` and the content is dragged by
   * `10` pixels, instead of `10` pixels the content will be pulled by `12` pixels
   * (an increase of 20 percent). If the value passed is `0.8`, the dragged amount
   * will be `8` pixels, less than the amount the cursor has moved.
   */
  @Input() pullFactor = 1;

  /**
   * Emitted when the user lets go of the content and has pulled down
   * further than the `pullMin` or pulls the content down and exceeds the pullMax.
   * Updates the refresher state to `refreshing`. The `complete()` method should be
   * called when the async operation has completed.
   */
  @Output() ionRefresh!: EventEmitter<RefresherEventDetail>;

  /**
   * Emitted while the user is pulling down the content and exposing the refresher.
   */
  @Output() ionPull!: EventEmitter<void>;

  /**
   * Emitted when the user begins to start pulling down.
   */
  @Output() ionStart!: EventEmitter<void>;

  private async connectedCallback() {
    console.time("scrollEl");
    if (this.el.nativeElement.getAttribute("slot") !== "fixed") {
      console.error('Make sure you use: <app-refresher slot="fixed">');
      return;
    }
    const contentEl = this.el.nativeElement.closest("ion-content");
    if (!contentEl) {
      console.error("<ion-refresher> must be used inside an <ion-content>");
      return;
    }
    this.scrollEl = await contentEl.getScrollElement();
    if (!this.scrollEl) {
      await new Promise<any>(s => {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(async _ => {
          this.scrollEl = await contentEl.getScrollElement();
          if (this.scrollEl) {
            console.timeEnd("scrollEl");
            clearInterval(this.intervalId);
            s();
          }
        }, 100);
      });
    }
    if (this.scrollEl) {
      const startSub = fromEvent(this.scrollEl, "touchstart").subscribe(
        (evt: TouchEvent) => {
          this.onStart(evt);
        }
      );
      const mouveSub = fromEvent(this.scrollEl, "touchmove").subscribe(
        (evt: TouchEvent) => {
          this.onMove(evt);
        }
      );
      const endSub = fromEvent(this.scrollEl, "touchend").subscribe(
        (evt: TouchEvent) => {
          this.onEnd();
        }
      );
      this.subscriptions.push(startSub);
      this.subscriptions.push(mouveSub);
      this.subscriptions.push(endSub);
    }
  }

  disconnectedCallback() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.scrollEl = undefined;
  }

  /**
   * Call `complete()` when your async operation has completed.
   * For example, the `refreshing` state is while the app is performing
   * an asynchronous operation, such as receiving more data from an
   * AJAX request. Once the data has been received, you then call this
   * method to signify that the refreshing has completed and to close
   * the refresher. This method also changes the refresher's state from
   * `refreshing` to `completing`.
   */

  async complete() {
    this.close(RefresherState.Completing, "120ms");
  }

  /**
   * Changes the refresher's state from `refreshing` to `cancelling`.
   */

  async cancel() {
    this.close(RefresherState.Cancelling, "");
  }

  /**
   * A number representing how far down the user has pulled.
   * The number `0` represents the user hasn't pulled down at all. The
   * number `1`, and anything greater than `1`, represents that the user
   * has pulled far enough down that when they let go then the refresh will
   * happen. If they let go and the number is less than `1`, then the
   * refresh will not happen, and the content will return to it's original
   * position.
   */

  getProgress() {
    return Promise.resolve(this.progress);
  }

  private canStart(): boolean {
    if (!this.scrollEl) {
      return false;
    }
    if (this.state !== RefresherState.Inactive) {
      return false;
    }
    // if the scrollTop is greater than zero then it's
    // not possible to pull the content down yet
    if (this.scrollEl.scrollTop > 0) {
      return false;
    }
    return true;
  }

  private onStart(evt: TouchEvent) {
    this.progress = 0;
    this.state = RefresherState.Inactive;
    this.startY = evt.touches[0] && evt.touches[0].clientY;
    this.isMoveBeginRefresh = false;
  }

  private onMove(detail: TouchEvent) {
    if (!this.scrollEl) {
      return false;
    }
    // this method can get called like a bazillion times per second,
    // so it's built to be as efficient as possible, and does its
    // best to do any DOM read/writes only when absolutely necessary
    // if multi-touch then get out immediately
    const ev = detail;
    if (ev.touches && ev.touches.length > 1) {
      return;
    }

    // do nothing if it's actively refreshing
    // or it's in the way of closing
    // or this was never a startY
    if ((this.state & RefresherState._BUSY_) !== 0) {
      return;
    }
    let deltaY = ev.touches[0].clientY - this.startY;
    const pullFactor =
      Number.isNaN(this.pullFactor) || this.pullFactor < 0
        ? 1
        : this.pullFactor;
    deltaY = deltaY * pullFactor;
    // don't bother if they're scrolling up
    // and have not already started dragging
    if (deltaY <= 0) {
      // the current Y is higher than the starting Y
      // so they scrolled up enough to be ignored
      this.progress = 0;
      this.state = RefresherState.Inactive;

      if (this.appliedStyles) {
        // reset the styles only if they were applied
        this.setCss(0, "", false, "");
        return;
      }

      return;
    }

    if (this.state === RefresherState.Inactive) {
      // this refresh is not already actively pulling down
      // get the content's scrollTop
      const scrollHostScrollTop = this.scrollEl.scrollTop;

      // if the scrollTop is greater than zero then it's
      // not possible to pull the content down yet
      if (scrollHostScrollTop > 0) {
        this.progress = 0;
        return;
      }

      // content scrolled all the way to the top, and dragging down
      this.state = RefresherState.Pulling;
    }

    // prevent native scroll events
    if (ev.cancelable) {
      ev.preventDefault();
    }

    // the refresher is actively pulling at this point
    // move the scroll element within the content element
    if (deltaY < this.pullMax) {
      this.setCss(deltaY, "0ms", true, "");
    } else {
      return;
    }

    if (deltaY === 0) {
      // don't continue if there's no delta yet
      this.progress = 0;
      return;
    }

    const pullMin = this.pullMin;
    // set pull progress
    this.progress = deltaY / pullMin;

    // emit "start" if it hasn't started yet
    if (!this.didStart) {
      this.didStart = true;
      this.ionStart.emit();
    }

    // emit "pulling" on every move
    this.ionPull.emit();

    // do nothing if the delta is less than the pull threshold
    if (deltaY < pullMin) {
      // ensure it stays in the pulling state, cuz its not ready yet
      this.state = RefresherState.Pulling;
      return;
    }

    if (deltaY > this.pullMax) {
      // they pulled farther than the max, so kick off the refresh
      if (!this.isMoveBeginRefresh) {
        this.isMoveBeginRefresh = true;
        this.beginRefresh();
      }
      return;
    }

    // pulled farther than the pull min!!
    // it is now in the `ready` state!!
    // if they let go then it'll refresh, kerpow!!
    this.state = RefresherState.Ready;
    return;
  }

  private onEnd() {
    // only run in a zone when absolutely necessary
    if (this.state === RefresherState.Ready) {
      // they pulled down far enough, so it's ready to refresh
      this.beginRefresh();
    } else if (this.state === RefresherState.Pulling) {
      // they were pulling down, but didn't pull down far enough
      // set the content back to it's original location
      // and close the refresher
      // set that the refresh is actively cancelling
      this.cancel();
    }
  }

  private beginRefresh() {
    // assumes we're already back in a zone
    // they pulled down far enough, so it's ready to refresh
    this.state = RefresherState.Refreshing;

    // place the content in a hangout position while it thinks
    this.setCss(this.pullMin, this.snapbackDuration, true, "");

    // emit "refresh" because it was pulled down far enough
    // and they let go to begin refreshing
    this.ionRefresh.emit({
      complete: this.complete.bind(this)
    });
  }

  private close(state: RefresherState, delay: string) {
    // create fallback timer incase something goes wrong with transitionEnd event
    setTimeout(() => {
      this.state = RefresherState.Inactive;
      this.progress = 0;
      this.didStart = false;
      this.setCss(0, "0ms", false, "");
    }, 120);

    // reset set the styles on the scroll element
    // set that the refresh is actively cancelling/completing
    this.state = state;
    this.setCss(0, this.closeDuration, true, delay);
  }

  private setCss(
    y: number,
    duration: string,
    overflowVisible: boolean,
    delay: string
  ) {
    this.appliedStyles = y > 0;
    if (this.scrollEl) {
      const style = this.scrollEl.style;
      style.transform =
        y > 0 ? `translateY(${y}px) translateZ(0px)` : "translateZ(0px)";
      style.transitionDuration = duration;
      style.transitionDelay = delay;
      style.overflow = overflowVisible ? "hidden" : "";
    }
  }
  // @HostBinding('class.refresher') private refresherclass = true;
  // @HostBinding('class.refresher-active') private get active() { return this.state !== RefresherState.Inactive; }
  // @HostBinding('class.refresher-pulling') private get pulling() { return this.state == RefresherState.Pulling; }
  // @HostBinding('class.refresher-ready') private get ready() { return this.state == RefresherState.Ready; }
  // @HostBinding('class.refresher-refreshing') private get refreshing() { return this.state == RefresherState.Refreshing; }
  // @HostBinding('class.refresher-cancelling') private get cancelling() { return this.state == RefresherState.Cancelling; }
  // @HostBinding('class.refresher-completing') private get completing() { return this.state == RefresherState.Completing; }
  get getClazz() {
    return {
      "refresher-active": this.state !== RefresherState.Inactive,
      "refresher-pulling": this.state === RefresherState.Pulling,
      "refresher-ready": this.state === RefresherState.Ready,
      "refresher-refreshing": this.state === RefresherState.Refreshing,
      "refresher-cancelling": this.state === RefresherState.Cancelling,
      "refresher-completing": this.state === RefresherState.Completing
    };
  }
}
const enum RefresherState {
  Inactive = 1 << 0,
  Pulling = 1 << 1,
  Ready = 1 << 2,
  Refreshing = 1 << 3,
  Cancelling = 1 << 4,
  Completing = 1 << 5,

  _BUSY_ = Refreshing | Cancelling | Completing
}
interface RefresherEventDetail {
  complete(): void;
}
