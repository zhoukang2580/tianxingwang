import { ModalController } from '@ionic/angular';
import { EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import Swiper from 'swiper';
@Component({
  selector: 'app-image-swiper',
  templateUrl: './image-swiper.component.html',
  styleUrls: ['./image-swiper.component.scss'],
})
export class ImageSwiperComponent implements OnInit, AfterViewInit, OnChanges {
  private swiper: Swiper;
  private thumbsSwiper: Swiper;
  private isSwiperInit = false;
  @ViewChildren("slides") private slideEles: QueryList<ElementRef<HTMLElement>>;
  @ViewChild("swiperContainer") swiperContainer: ElementRef<HTMLElement>;
  @ViewChild("swiperbuttonprev") preEle: ElementRef<HTMLElement>;
  @ViewChild("swiperbuttonnext") nextEle: ElementRef<HTMLElement>;
  @ViewChild("pagination") paginationEle: ElementRef<HTMLElement>;
  @ViewChild("thumbs") thumbs: ElementRef<HTMLElement>;
  @Input() hasThumbs = false;
  @Input() effect: boolean | "fade" | "flip" | "cube" | "coverflow" = 'fade';
  @Input() direction: "vertical" | "horizontal" = 'horizontal';
  @Input() pagination = null;
  @Input() autoplay = false;
  @Input() zoom = true;
  @Input() loop = true;
  @Input() isShowCloseBtn = true;
  @Input() isShowPagination = true;
  @Input() imagesUrls: string[];
  @Input() texts: { text: string; }[];
  @Input() slideStyle: any = {
    backgroundColor: 'black'
  };
  @Input() autoplayspeed: number = 300;
  @Input() pos: number = 0;
  @Input() imgStyle: any;
  @Output() close: EventEmitter<any>;
  @Input() fabvertical: string = 'top';
  @Input() fabhorizontal: string = 'end';
  images: { active: boolean; url?: string; idx: number; text?: string; }[];
  constructor(private modalCtrl: ModalController) {
    this.close = new EventEmitter();
  }
  // ngDoCheck(){
  //   console.log('ngdocheck');
  // }
  // ngAfterContentChecked(){
  //   console.log("ngAfterContentChecked");
  // }
  // ngAfterViewChecked(){
  //   console.log('ngAfterViewChecked');
  // }
  ngOnInit() {
    // if (this.imagesUrls) {
    //   const images = this.imagesUrls && this.imagesUrls.map((it, idx) => {
    //     return {
    //       active: idx == (this.pos || 0),
    //       url: it,
    //       idx,
    //     }
    //   });
    //   this.images=[];
    //   const loop = () => {
    //     if (!images || !images.length) {
    //       this.update();
    //       return;
    //     } else {
    //       const one = images.splice(0,10);
    //       this.images=this.images.concat(one);
    //       this.update();
    //       window.requestAnimationFrame(loop);
    //     }
    //   }
    //   window.requestAnimationFrame(loop);
    // }
    this.initImages();
  }
  ngAfterContentInit() {
    console.log("ngAfterContentInit");
  }
  private update() {
    setTimeout(() => {
      if (this.swiper && this.swiper.update) {
        if (this.thumbsSwiper && this.thumbsSwiper.update) {
          this.thumbsSwiper.update();
        }
        this.swiper.update();
      }
    }, 100);
  }
  onClose() {
    console.log("onClose");
    this.close.emit();
    this.modalCtrl.getTop().then(t => {
      if (t) {
        t.dismiss();
      }
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.texts && changes.texts.currentValue) {
      if (this.texts) {
        this.images = this.texts && this.texts.map((it, idx) => {
          return {
            active: idx == (this.pos || 0),
            idx,
            text: it.text
          }
        });
        setTimeout(() => {
          if (this.swiper && this.swiper.update) {
            this.swiper.update();
          }
        }, 1000);
      }
      if (changes.effect && !changes.effect.currentValue) {
        if (this.swiper && this.swiper.update) {
          this.swiper.params.effect = false;
          this.swiper.update();
        }
      }
    }
    // if (changes.imagesUrls && changes.imagesUrls.currentValue && !this.isSwiperInit) {
    //   this.initImages();
    // }
    // if (changes.pos && changes.pos.currentValue == 0) {
    //   console.log("this.pos", this.pos);
    //   if (this.swiper) {
    //     if (this.swiper.params) {
    //       this.swiper.params.initialSlide = 0;
    //       this.slidToPage(0);
    //     }
    //   }
    // }
  }
  private initImages() {
    // this.images = [];
    // console.log("initImages");
    this.images = this.imagesUrls && this.imagesUrls.map((it, idx) => {
      return {
        active: idx == (this.pos || 0),
        url: it,
        idx,
      }
    });
    // const loop = () => {
    //   if (!images || !images.length) {
    // if (this.swiper) {
    //   this.initSwiper();
    // }
    //     return;
    //   } else {
    //     this.images = this.images.concat(images.splice(0, 10));
    //     window.requestAnimationFrame(loop);
    //   }
    // }
    // loop();
  }
  private initSwiper() {
    if (!this.isSwiperInit) {
      if (this.swiper && this.swiper.init) {
        if (this.thumbsSwiper && this.thumbsSwiper.init) {
          this.thumbsSwiper.init();
        }
        this.swiper.init();
        this.isSwiperInit = true;
      }
    }
  }
  createSwiper() {
    setTimeout(() => {
      const that = this;
      if (this.swiperContainer && this.swiperContainer.nativeElement) {
        const params: any = {
          autoplay: this.autoplay,//可选选项，自动滑动
          speed: this.autoplayspeed,
          effect: this.effect,
          init: true,
          direction: this.direction,
          pagination: {
            el: this.paginationEle.nativeElement,
            type: "fraction"
          },
          // spaceBetween: 10,
          zoom: this.zoom,
          loop: this.loop,
          initialSlide: this.pos
        }
        if (this.effect == "coverflow") {
          params.effect = "coverflow";
          params.slidesPerView = 3;
          params.centeredSlides = true;
          params.coverflowEffect = {
            rotate: 30,
            stretch: 10,
            depth: 60,
            modifier: 2,
            slideShadows: true
          }
        } else if (this.effect == 'flip') {
          params.effect = 'flip';
          params.flipEffect = {
            slideShadows: true,
            limitRotation: true,
          }
        } else if (this.effect == 'cube') {
          params.effect = 'cube';
          params.cubeEffect = {
            slideShadows: true,
            shadow: true,
            shadowOffset: 100,
            shadowScale: 0.6
          }
        } else if (this.effect == 'fade') {
          params.effect = 'fade';
          params.fadeEffect = {
            crossFade: true,
          }
        } else if (!this.effect) {
          params.effect = false;
        }
        if (this.hasThumbs) {
          const thumbsOptions = {
            init: true,
            spaceBetween: 10,
            slidesPerView: 4,
            loop: false,
            loopedSlides: 5, //looped slides should be the same
            freeMode: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
          }
          if (this.loop) {
            thumbsOptions.loop = true;
            thumbsOptions.loopedSlides = 5;
          }
          this.thumbsSwiper = new Swiper(this.thumbs.nativeElement, thumbsOptions);
          params["thumbs"] =
            {
              swiper: this.thumbsSwiper,
            }
        }
        if (this.loop) {
          params.loop = true;
          params.loopedSlides = 5;
        }
        const swiper = new Swiper(this.swiperContainer.nativeElement, params);
        this.swiper = swiper;

      }
    }, 300);
  }
  slidToPage(idx: number) {
    if (this.images) {
      this.images = this.images.map(it => {
        it.active = it.idx == idx;
        return it;
      })
    }
    if (this.loop) {
      if (this.swiper) {
        this.swiper.slideToLoop(idx, 100, false);
      }
    } else {
      if (this.swiper) {
        this.swiper.slideTo(idx, 100, false);
      }
    }
  }
  createThumbsSwiper() {
    setTimeout(() => {
      this.createSwiper();
    }, 100);
  }
  ngAfterViewInit() {
    console.log("ngAfterViewInit")
    // this.init();
    if (this.hasThumbs) {
      this.createThumbsSwiper();
    } else {
      this.createSwiper();
    }
    if (this.slideEles) {
      this.slideEles.changes.subscribe(_ => {
        console.log("slideEles",this.slideEles.length);
        if (this.slideEles.length == (this.imagesUrls && this.imagesUrls.length)) {
          this.initSwiper();
          this.update();
        }
      })
    }
  }

}
