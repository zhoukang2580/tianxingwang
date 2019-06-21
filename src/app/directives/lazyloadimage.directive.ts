import { DomSanitizer } from "@angular/platform-browser";
import {
  Directive,
  Input,
  ElementRef,
  OnChanges,
  OnDestroy,
  NgZone,
  SimpleChanges,
  OnInit,
  Renderer2
} from "@angular/core";
import { AppHelper } from "../appHelper";

@Directive({
  selector: "[appLazyloadimage]"
})
export class LazyloadimageDirective implements OnChanges, OnDestroy, OnInit {
  @Input() lazyloadImage;
  @Input() defaultImage = AppHelper.getDefaultAvatar();
  @Input() errorImage = AppHelper.getDefaultAvatar();
  @Input() loadingImage = AppHelper.getDefaultLoadingImage();
  constructor(
    private el: ElementRef<HTMLImageElement> // private render: Renderer2
  ) {}
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    // console.log("ngOnChanges", changes);
    this.setLoadImage();
  }
  setLoadImage() {
    const image = document.createElement("img");
    this.el.nativeElement.src = this.loadingImage;
    image.onerror = _ => {
      setTimeout(() => {
        this.el.nativeElement.src = this.errorImage;
      }, 1000);
      // console.log("onerror", this.el.nativeElement);
    };
    image.onload = _ => {
      // console.log("onload");
      this.el.nativeElement.src = image.src;
    };
    image.src = this.lazyloadImage;
  }
  ngOnDestroy() {}
}
