import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';
const PhotoSwipe = window['PhotoSwipe'];
const PhotoSwipeUI_Default = window['PhotoSwipeUI_Default'];
@Component({
  selector: 'app-browse-images',
  templateUrl: './browse-images.component.html',
  styleUrls: ['./browse-images.component.scss'],
})
export class BrowseImagesComponent implements OnInit, AfterViewInit {
  @ViewChild('pswp') pswpEle: ElementRef<HTMLElement>;
  images: { originUrl: string; thumbnailUrl: string; }[];
  src = ``
  constructor(private sanitizer: DomSanitizer, private navCtrl: NavController) { }

  ngOnInit() {
    this.images = [
      {
        originUrl: 'assets/images/airplane-l.jpg',
        thumbnailUrl: "assets/images/airplane-l.jpg"
      },
      {
        originUrl: 'assets/images/airplane-l.jpg',
        thumbnailUrl: "assets/images/airplane-l.jpg"
      },
      {
        originUrl: 'assets/images/airplane-l.jpg',
        thumbnailUrl: "assets/images/airplane-l.jpg"
      }
    ]
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.src) as any;
  }
  setSwipeBackEnabled(value: boolean) {
    // this.navCtrl.swipeBackEnabled = value
  }
  ngAfterViewInit() {
    const image = document.createElement("img");
    image.src = 'assets/images/airplane-l.jpg';
    setTimeout(() => {
      var pswpElement = document.querySelectorAll('.pswp')[0];
      // build items array
      var items = [
        {
          src: 'assets/images/airplane-l.jpg',
          w: image.width,
          h: image.height
        },
        {
          src: 'assets/images/airplane-l.jpg',
          w: image.width,
          h: image.height
        }
      ];

      // define options (if needed)
      var options = {
        // optionName: 'option value'
        // for example:
        index: 0, // start at first slide
        escKey: false,
        pinchToClose: false,
        closeOnVerticalDrag : false,
      };

      // Initializes and opens PhotoSwipe
      var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
      gallery.init();
    }, 1000);
  }

}
