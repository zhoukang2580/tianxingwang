import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectionStrategy
} from "@angular/core";
import { IonSlides } from "@ionic/angular";
interface IItem {
  id: string;
  text: string;
  imageUrl: string;
  desc: string;
}
@Component({
  selector: "app-ion-slides",
  templateUrl: "./slides.component.html",
  styleUrls: ["./slides.component.scss"]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlidesComponent implements OnInit, OnChanges, AfterViewInit {
  private swiper;
  @ViewChildren("img") imgs: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild(IonSlides, { static: true }) slides: IonSlides;
  @Input() items: IItem[];
  @Input() direction = "horizontal";
  @Input() options;
  @Input() logoUrl;
  @Input() defaultImage = "assets/loading.gif";
  @Input() bgColorBlack = false;
  isShowImage = false;
  curIndex: number;

  constructor() {}
  async ngAfterViewInit() {}
  async ngOnInit() {
    if (this.options) {
      this.options.autoplay = this.options.autoplay || false;
    }
    if (this.slides) {
      this.swiper = await this.slides.getSwiper();
      console.log("ngOnInit", this.swiper);
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.items && changes.items.currentValue) {
      this.isShowImage = this.items.some(it => !!it.imageUrl);
    }
  }
  async onSlidesDidLoad() {
    this.onSlideWillChange();
  }
  onSlideTouchStart() {
    this.stopAutoPlay();
  }
  onSlideTouchEnd() {
    this.startAutoPlay();
  }
  private stopAutoPlay() {
    if (this.slides) {
      this.slides.stopAutoplay();
    }
  }
  private startAutoPlay() {
    if (this.options && this.options.autoplay) {
      if (this.slides) {
        this.slides.startAutoplay();
      }
    }
  }
  async onSlideWillChange() {
    console.log("this.swiper", this.swiper);
    if (!this.swiper) {
      this.swiper = await this.slides.getSwiper();
    }
    const idx = (this.swiper && this.swiper.realIndex) || 0;
    this.curIndex = idx + 1;
  }
  async onSlideDidChange() {}
}
