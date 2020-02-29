import { OnDestroy } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ElementRef, Output } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
@Component({
  selector: 'app-swiper-slide-content',
  templateUrl: './swiper-slide-content.component.html',
  styleUrls: ['./swiper-slide-content.component.scss'],
})
export class SwiperSlideContentComponent implements OnInit, AfterViewInit, OnDestroy {
  private swiper: any;
  @Output() onSlideChange: EventEmitter<number>;
  @ViewChild('container', { static: true }) container: ElementRef<HTMLElement>
  constructor() {
    this.onSlideChange = new EventEmitter();
  }
  onSlideTo(idx: number) {
    if (this.swiper) {
      this.swiper.slideTo(idx);
    }
  }
  ngOnInit() { }
  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper = new Swiper(this.container.nativeElement, {})
      if (this.swiper) {
        this.swiper.on('slideChange', () => {
          this.onSlideChange.emit(this.swiper.realIndex);
        })
      }
    }, 1000);
  }
  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }

}
