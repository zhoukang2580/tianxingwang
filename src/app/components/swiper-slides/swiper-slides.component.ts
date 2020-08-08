import { Subscription } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  ChangeDetectorRef,
  SimpleChanges,
  ViewChildren,
  QueryList,
  AfterViewInit,
  AfterContentInit,
  OnDestroy,
  Output,
  EventEmitter,
  Renderer2,
} from "@angular/core";
import Swiper from "swiper";
const TAG = "swiper-slides";
@Component({
  selector: "app-swiper-slides",
  templateUrl: "./swiper-slides.component.html",
  styleUrls: ["./swiper-slides.component.scss"],
})
export class SwiperSlidesComponent
  implements OnInit, OnChanges, AfterViewInit, AfterContentInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private swiper: any;
  private pageSize = 20;
  private isFirstEntry = true;
  private isOpenAsModel = false;
  // 索引统一从0开始
  curIndex = 0;
  @ViewChild("container", { static: true }) containerEl: ElementRef<
    HTMLElement
  >;
  @ViewChildren("slide") slides: QueryList<ElementRef<HTMLElement>>;
  @Input() options: any;
  @Input() items: any[];
  @Input() vmItems: any[];
  @Input() direction = "horizontal";
  @Input() logoUrl;
  @Input() bgColorBlack;
  @Input() defaultImage;
  @Input() loadingImage = "assets/loading.gif";
  @Input() initialPos = 0;
  isShowImage = true;
  @Output() slideChange: EventEmitter<any>;
  @Output() tap: EventEmitter<any>;
  constructor(private render: Renderer2) {
    this.slideChange = new EventEmitter();
    this.tap = new EventEmitter();
  }

  ngOnInit() {
    this.curIndex = this.initialPos;
    this.vmItems = [];
    if (this.items) {
      this.isShowImage = !!this.items.some((it) => it.imageUrl);
      if (this.isOpenAsModel) {
        this.initVmItems();
      }
    }
    // console.log(TAG + " this.initialPos ", this.initialPos);
    if (this.containerEl && this.containerEl.nativeElement) {
      let options = {
        direction: "horizontal", // 垂直切换选项
        // loop: true, // 循环模式选项
        ...this.getDefaultOptions(),
        // autoplay: true
        // freeMode : true,
        // 如果需要分页器
        pagination: {
          // el: ".swiper-pagination"
          // bulletClass: "my-bullet", // 需设置.my-bullet样式
        },
        // 如果需要前进后退按钮
        // navigation: {
        //   nextEl: ".swiper-button-next",
        //   prevEl: ".swiper-button-prev"
        // },

        // 如果需要滚动条
        // scrollbar: {
        //   el: ".swiper-scrollbar"
        // }
      };
      if (this.options) {
        options = {
          ...options,
          ...this.options,
        };
      }
      // console.log(TAG, options);
      const self = this;
      this.swiper = new Swiper(this.containerEl.nativeElement, {
        ...options,
      });
      this.stopAutoPlay();
      // console.log("swiper", this.swiper);
      this.swiper.on("slideChange", function () {
        // self.cdRef.markForCheck();
        // console.log(TAG + "slideChange ", this.realIndex);
        self.onChangeCurIndex(this.realIndex);
      });
      this.swiper.on("touchEnd", () => {
        this.onTouchEnd();
      });
      this.swiper.on("slidePrevTransitionEnd", function () {
        self.onPreSlide(this.realIndex);
      });
      this.swiper.on("reachBeginning", () => {
        this.onReachBeginning();
      });
      this.swiper.on("reachEnd", () => {
        this.onReachEnd();
      });
    }
  }
  onItemClick(itm, idx) {
    this.tap.emit({
      itm,
      idx,
    });
  }
  private loopLoad() {
    console.log("正在加载数据，", this.slides.length);
    this.loadMore();
  }
  private onReachBeginning() {}
  private onReachEnd() {
    // this.loadMore();
  }
  private onTouchEnd() {
    // console.log("touchEnd");
    setTimeout(() => {
      this.startAutoPlay();
    }, 1000);
  }
  private slideToSlide(idx: number) {
    return new Promise((resolve) => {
      if (this.swiper) {
        // console.log("切换到", idx);
        if (idx > 0) {
          this.swiper.slideTo(idx <= 0 ? 0 : idx, 0, () => {
            // console.log("成功切换到 " + idx);
            this.swiper.slideNext(300, () => {
              resolve();
            });
          });
        } else {
          resolve();
        }
      }
    });
  }
  private onPreSlide(idx: number) {
    // const cur = this.vmItems[idx];
    // console.log("onPreSlide 当前下标", idx, "当前对应的元素：", cur);
    // if (idx <= 0) {
    //   let items = [];
    //   if (cur.idx > this.pageSize) {
    //     items = this.items.slice(cur.idx - this.pageSize, cur.idx);
    //   } else {
    //     items = this.items.slice(0, cur.idx);
    //   }
    //   if (items.length) {
    //     this.vmItems.unshift(items);
    //   }
    // }
  }
  private loadMore() {
    if (this.items) {
      let items = [];
      if (false && this.items.length <= 100) {
        this.vmItems = this.items;
      } else {
        if (this.vmItems) {
          items = this.items.slice(
            this.vmItems.length,
            this.vmItems.length + this.pageSize
          );
          if (items.length) {
            this.vmItems = this.vmItems.concat(items);
          }
        }
      }
    }
  }
  ngAfterContentInit() {
    // console.log(this.slides);
    setTimeout(() => {
      try {
        if (this.containerEl.nativeElement.parentElement.clientHeight) {
          this.render.setStyle(
            this.containerEl.nativeElement,
            "height",
            `${this.containerEl.nativeElement.parentElement.clientHeight}px`
          );
        }
        if (this.containerEl.nativeElement.parentElement.clientWidth) {
          this.render.setStyle(
            this.containerEl.nativeElement,
            "width",
            `${this.containerEl.nativeElement.parentElement.clientWidth}px`
          );
        }
      } catch (e) {
        console.error(e);
      }
      if (this.isOpenAsModel) {
        this.update();
        this.slideToSlide(this.initialPos);
      }
    }, 0);
  }
  private slideToInitialPos() {
    if (this.isFirstEntry) {
      this.isFirstEntry = false;
      setTimeout(() => {
        this.slideToSlide(this.initialPos).then((_) => {
          this.startAutoPlay();
        });
      }, 100);
    }
  }
  ngAfterViewInit() {
    const sub = this.slides.changes.subscribe((_) => {
      setTimeout(() => {
        // console.log(
        //   "slides.changes.subscribe ",
        //   this.slides.length,
        //   this.initialPos + 1
        // );
        this.update();
        if (this.slides.length < this.initialPos + 1) {
          this.loopLoad();
        } else {
          this.slideToInitialPos();
        }
      }, 0);
    });
    this.subscriptions.push(sub);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroySwiper();
  }
  private destroySwiper() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
  private onChangeCurIndex(realIndex: number) {
    try {
      this.curIndex = realIndex;
      this.slideChange.emit(realIndex);
      if (this.vmItems && this.vmItems.length) {
        if (
          this.curIndex == this.vmItems.length - 3 ||
          this.curIndex == this.vmItems.length
        ) {
          this.loadMore();
        }
      }
    } catch (e) {
      console.error("swiper error", e);
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    try {
      if (
        changes.options &&
        changes.options.currentValue &&
        !changes.options.firstChange
      ) {
        if (this.swiper) {
          if (this.options) {
            Object.assign(this.swiper.params, this.options);
          }
        }
      }
      if (changes.initialPos) {
        this.curIndex = this.initialPos + 1 || 1;
        // console.log("onchanges this.curIndex", this.curIndex);
      }
      if (changes.items && changes.items.currentValue) {
        this.items = this.items.map((it, idx) => {
          return {
            idx,
            imageUrl: it.imageUrl,
            text: it.text,
          };
        });
        setTimeout(() => {
          this.initVmItems();
        }, 0);
      }
    } catch (e) {
      console.error("swiper slides ngonchanges", e);
    }
  }
  private initVmItems() {
    this.vmItems = [];
    this.loadMore();
    // if (this.items) {
    //   console.log("图片总数", this.items.length, "vmItems", this.vmItems);
    // }
  }
  private update() {
    try {
      if (this.swiper) {
        this.swiper.update();
        setTimeout(() => {
          this.startAutoPlay();
        }, 3000);
      }
    } catch (e) {
      console.error("swiper slides update ", e);
    }
    // console.log("swiper update");
  }
  private stopAutoPlay() {
    if (this.options && this.options.autoplay) {
      if (this.swiper && this.swiper.autoplay) {
        this.swiper.autoplay.stop();
      }
    }
  }
  private startAutoPlay() {
    if (this.options && this.options.autoplay) {
      if (this.swiper && this.swiper.autoplay) {
        this.swiper.autoplay.start();
      }
    }
  }
  private getDefaultOptions() {
    const swiperOptions = {
      effect: undefined,
      direction: "horizontal",
      initialSlide: 0,
      loop: false,
      parallax: false,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 300,
      slidesPerColumn: 1,
      slidesPerColumnFill: "column",
      slidesPerGroup: 1,
      centeredSlides: false,
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,
      touchEventsTarget: "container",
      autoplay: false,
      freeMode: false,
      freeModeMomentum: true,
      freeModeMomentumRatio: 1,
      freeModeMomentumBounce: true,
      freeModeMomentumBounceRatio: 1,
      freeModeMomentumVelocityRatio: 1,
      freeModeSticky: false,
      freeModeMinimumVelocity: 0.02,
      autoHeight: false,
      setWrapperSize: false,
      // zoom: { 开启，导致ios 13 滑动的时候包错误  undefined is not an object t.$imageWrapEl.transform undefined
      //   maxRatio: 3,
      //   minRatio: 1,
      //   toggle: false
      // },
      zoom: false,
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      touchStartPreventDefault: false,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      threshold: 0,
      touchMoveStopPropagation: true,
      touchReleaseOnEdges: false,
      iOSEdgeSwipeDetection: false,
      iOSEdgeSwipeThreshold: 20,
      resistance: true,
      resistanceRatio: 0.85,
      watchSlidesProgress: false,
      watchSlidesVisibility: false,
      preventClicks: true,
      preventClicksPropagation: true,
      slideToClickedSlide: false,
      loopAdditionalSlides: 0,
      noSwiping: true,
      runCallbacksOnInit: true,
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      flipEffect: {
        slideShadows: true,
        limitRotation: true,
      },
      cubeEffect: {
        slideShadows: true,
        shadow: true,
        shadowOffset: 20,
        shadowScale: 0.94,
      },
      fadeEffect: {
        crossfade: false,
      },
      a11y: {
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "This is the first slide",
        lastSlideMessage: "This is the last slide",
      },
    };
    return swiperOptions;
  }
}
