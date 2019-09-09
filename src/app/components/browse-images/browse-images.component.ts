import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NavController, Platform } from "@ionic/angular";
const PhotoSwipe = window["PhotoSwipe"];
const PhotoSwipeUI_Default = window["PhotoSwipeUI_Default"];
@Component({
  selector: "app-browse-images",
  templateUrl: "./browse-images.component.html",
  styleUrls: ["./browse-images.component.scss"]
})
export class BrowseImagesComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild("pswp") pswpEle: ElementRef<HTMLElement>;
  @Input() images: string[] = [];
  @Output() close: EventEmitter<any>;
  private image: HTMLImageElement;
  gallery: any;
  constructor(
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
    private plt: Platform
  ) {
    this.image = document.createElement("img");
    this.close = new EventEmitter();
  }
  ngOnChanges(changes: SimpleChanges) {}
  onClose() {
    if (this.gallery) {
      this.gallery.close();
    }
    this.close.emit();
  }
  ngOnInit() {}
  private async init() {
    const items = this.images.map(it => {
      this.image.src = it;
      const w_h =
        it.substring(
          it.indexOf("Mobile") + "mobile".length,
          it.lastIndexOf("/")
        ) || "";
      console.log(w_h);
      const arr = w_h.split("_") || [];
      return {
        src: it,
        w: arr[0] || this.plt.width(),
        h: arr[1] || this.plt.height() / 2
      };
    });
    console.log("items", items);

    const pswpElement = this.pswpEle.nativeElement;
    // build items array

    // define options (if needed)
    const options = {
      // optionName: 'option value'
      // for example:
      index: 0, // start at first slide
      escKey: false,
      pinchToClose: false,
      closeOnVerticalDrag: false
    };

    // Initializes and opens PhotoSwipe
    console.log(PhotoSwipeUI_Default, pswpElement);
    this.gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      items,
      options
    );
    this.gallery.init();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.init();
    }, 1000);
  }
}
