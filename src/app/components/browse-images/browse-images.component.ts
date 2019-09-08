import { Component, OnInit, AfterViewInit } from '@angular/core';
import Swiper from 'swiper';
@Component({
  selector: 'app-browse-images',
  templateUrl: './browse-images.component.html',
  styleUrls: ['./browse-images.component.scss'],
})
export class BrowseImagesComponent implements OnInit, AfterViewInit {
  images: string[];
  constructor() { }

  ngOnInit() {
    if (this.images && this.images.length) {

    }
  }
  ngAfterViewInit(): void {
    const mySwiper = new Swiper('.swiper-container', { /* ... */ });
  }

}
