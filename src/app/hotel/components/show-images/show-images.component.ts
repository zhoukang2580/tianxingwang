import { ModalController } from '@ionic/angular';
import { ConfigService } from './../../../services/config/config.service';
import { ConfigEntity } from './../../../services/config/config.entity';
import { ElementRef } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';

@Component({
  selector: 'app-show-images',
  templateUrl: './show-images.component.html',
  styleUrls: ['./show-images.component.scss'],
})
export class ShowImagesComponent implements OnInit, AfterViewInit {
  images: { url: string; active: boolean; idx: number }[];
  swiper: Swiper;
  config: ConfigEntity;
  @ViewChild("container") container: ElementRef<HTMLElement>;
  @ViewChild("thumbs") thumbsEle: ElementRef<HTMLElement>;
  constructor(private configservice: ConfigService,private modalCtrl:ModalController) { }
  ngAfterViewInit() {
    setTimeout(() => {
     const thumbsSwiper = new Swiper(this.thumbsEle.nativeElement, {
        slidesPerView: 5,
      });
      this.swiper = new Swiper(this.container.nativeElement, {
        loop: true,
        // slidesPerView: 5,
        preloadImages: false,
        lazy:true,
        // zoom:true,
        // loadOnTransitionStart:true,
        thumbs: {
          swiper: thumbsSwiper
        }
      })
    }, 200);
  }
  async ngOnInit() {
    this.config = await this.configservice.getConfigAsync();
  }
  slidToPage(idx: number) {
    if (this.images) {
      this.images = this.images.map(it => {
        it.active = it.idx == idx;
        return it;
      })
    }
    if (this.swiper) {
      this.swiper.slideToLoop(idx, 100, false);
    }
  }
  onClose(){
    this.modalCtrl.dismiss();
  }
}
