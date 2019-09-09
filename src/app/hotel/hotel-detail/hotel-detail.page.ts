import { HotelEntity } from "./../models/HotelEntity";
import { AppHelper } from "./../../appHelper";
import { HotelService } from "./../hotel.service";
import { HotelResultEntity } from "./../models/HotelResultEntity";
import { HotelDayPriceEntity } from "./../models/HotelDayPriceEntity";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { DomController, IonContent } from "@ionic/angular";

@Component({
  selector: "app-hotel-detail",
  templateUrl: "./hotel-detail.page.html",
  styleUrls: ["./hotel-detail.page.scss"]
})
export class HotelDetailPage implements OnInit, AfterViewInit {
  private item: HotelDayPriceEntity;
  private scrollEle: HTMLElement;
  private bgPicHeight = 0;
  private headerHeight = 0;
  hotelDetailSub = Subscription.EMPTY;
  hotel: HotelEntity;
  @ViewChild("header") headerEle: ElementRef<HTMLElement>;
  @ViewChild("bgPic") bgPicEle: ElementRef<HTMLElement>;
  @ViewChild(IonContent) ionCnt: IonContent;
  showImages = false;
  constructor(
    route: ActivatedRoute,
    private hotelService: HotelService,
    private router: Router,
    private domCtrl: DomController,
    private render: Renderer2
  ) {
    route.queryParamMap.subscribe(q => {
      if (q.get("data")) {
        this.item = JSON.parse(q.get("data"));
      }
    });
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
  }
  ngOnInit() {
    this.hotelDetailSub = this.hotelService
      .getHotelDetail(this.item)
      .pipe(
        map(res => res && res.Data),
        tap(r => {
          console.log(r);
        })
      )
      .subscribe(hotel => {
        if (hotel) {
          this.hotel = hotel.Hotel;
          if (this.bgPicEle) {
            this.render.setStyle(
              this.bgPicEle.nativeElement,
              "background-image",
              `url(${this.hotel.FileName})`
            );
          }
        }
      });
  }
  getImageUrls() {
    return (
      this.hotel &&
      this.hotel.HotelImages &&
      this.hotel.HotelImages.map(it => it.FileName)
    );
  }
  getStars(hotel: HotelEntity) {
    if (hotel && hotel.Category) {
      hotel.Category = `${hotel.Category}`;
      if (+hotel.Category >= 5) {
        return new Array(5).fill(1);
      }
      if (hotel.Category.includes(".")) {
        const a = hotel.Category.split(".");
        return new Array(+a[0]).fill(1).concat([0.5]);
      }
      return new Array(+hotel.Category).fill(1);
    }
    return [];
  }
  doRefresh() {}
  async ngAfterViewInit() {
    if (this.ionCnt) {
      this.scrollEle = await this.ionCnt.getScrollElement();
    }
    setTimeout(() => {
      this.initEle();
    }, 1000);
  }
  private initEle() {
    if (this.bgPicEle && this.bgPicEle.nativeElement) {
      this.bgPicHeight = this.bgPicEle.nativeElement.clientHeight;
      if (this.scrollEle && this.bgPicHeight) {
        this.render.setStyle(
          this.scrollEle,
          "min-height",
          `calc(100vh + ${this.bgPicHeight}px)`
        );
      }
    }
    if (this.headerEle && this.headerEle.nativeElement) {
      this.headerHeight = this.headerEle.nativeElement.clientHeight;
    }
    if (this.scrollEle) {
      this.scrollEle.onscroll = () => {
        let bottom = 0;
        this.domCtrl.read(_ => {
          let opacity = 0;
          const bottomRect =
            this.bgPicEle &&
            this.bgPicEle.nativeElement &&
            this.bgPicEle.nativeElement.getBoundingClientRect();
          if (bottomRect) {
            bottom = bottomRect.bottom;
          }
          if (bottom <= this.headerHeight * 6) {
            if (bottom >= this.headerHeight * 1.3) {
              opacity = +(bottom / (this.headerHeight * 6)).toFixed(1);
              opacity = Math.min(1 - opacity, 1);
              // console.log(opacity);
            } else {
              opacity = 1;
            }
          } else {
            opacity = 0;
          }
          this.domCtrl.write(_ => {
            this.render.setStyle(
              this.headerEle.nativeElement,
              "opacity",
              opacity < 0.2 ? 0 : opacity
            );
          });
        });
      };
    }
  }
}
