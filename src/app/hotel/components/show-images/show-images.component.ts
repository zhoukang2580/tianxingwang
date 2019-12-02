import { AppHelper } from './../../../appHelper';
import { TmcService } from 'src/app/tmc/tmc.service';
import { AgentEntity } from './../../../tmc/models/AgentEntity';
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
  agent: AgentEntity;
  zoom=false;
  @ViewChild("container") container: ElementRef<HTMLElement>;
  @ViewChild("thumbs") thumbsEle: ElementRef<HTMLElement>;
  @ViewChild("pagination") paginationEle: ElementRef<HTMLElement>;
  constructor(private configservice: ConfigService, private tmcService: TmcService, private modalCtrl: ModalController) { }
  ngAfterViewInit() {
    setTimeout(() => {
      const thumbsSwiper = new Swiper(this.thumbsEle.nativeElement, {
        slidesPerView: 5,
      });
      this.swiper = new Swiper(this.container.nativeElement, {
        loop: false,
        // slidesPerView: 5,
        effect:'fade',
        pagination: {
          el: this.paginationEle.nativeElement,
          type: "fraction"
        },
        preloadImages: false,
        lazy: true,
        zoom:this.zoom,
        // loadOnTransitionStart:true,
        thumbs: {
          swiper: thumbsSwiper
        }
      })
    }, 200);
  }
  async ngOnInit() {
    this.config = await this.configservice.getConfigAsync();
    this.agent = await this.tmcService.getAgent();
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
  onClose() {
    this.modalCtrl.dismiss();
  }
}
