import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { IonSlides } from "@ionic/angular";
interface IItem {
  id: string;
  text: string;
  imageUrl: string;
  desc: string;
}
@Component({
  selector: "app-slides",
  templateUrl: "./slides.component.html",
  styleUrls: ["./slides.component.scss"]
})
export class SlidesComponent implements OnInit, OnChanges {
  private swiper;
  @ViewChildren("img") imgs: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild(IonSlides) slides: IonSlides;
  @Input() items: IItem[];
  @Input() direction = "horizontal";
  @Input() options;
  @Input() logoUrl;
  @Input() defaultImage = "assets/loading.gif";
  @Input() bgColorBlack = false;
  isShowImage = false;
  curIndex: number;

  constructor() {}

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.items && changes.items.currentValue) {
      this.isShowImage = this.items.some(it => !!it.imageUrl);
    }
  }
  async onSlidesDidLoad() {
    if (this.slides) {
      this.swiper = await this.slides.getSwiper();
    }
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
    // console.log(this.swiper);
    // if(this.swiper&&this.swiper.autoplay&&this.swiper.autoplay.stop){
    //   this.swiper.autoplay.stop();
    // }
  }
  private startAutoPlay() {
    if (this.options && this.options.autoplay) {
      if (this.slides) {
        this.slides.startAutoplay();
      }
    }
  }
  async onSlideWillChange() {
    console.log("this.swiper  this.slides", this.swiper, this.slides);
    if (!this.swiper) {
      this.swiper = await this.slides.getSwiper();
    }
    console.log("this.swiper ", this.swiper);
    const idx = (this.swiper && this.swiper.realIndex) || 0;
    this.curIndex = idx + 1;
  }
  async onSlideDidChange() {}
}
