import { AuthorizeService } from "../services/authorize/authorize.service";
import {
  Directive,
  Input,
  ViewContainerRef,
  TemplateRef,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterContentChecked,
  AfterViewChecked
} from "@angular/core";

@Directive({
  selector: "[appAuthority]"
})
export class AuthorizeDirective implements OnChanges {
  @Input() appAuthority: string;
  private lastTime = 0;
  private initialDisplayStyle;
  constructor(
    private authorizeService: AuthorizeService,
    // private viewContainerRef: ViewContainerRef,
    // private tempRef: TemplateRef<any>,
    private el: ElementRef<HTMLElement>
  ) {
    this.initialDisplayStyle = this.el.nativeElement.style.display;
  }
  // ngAfterViewChecked() {
  //   const now = Date.now();
  //   if (now - this.lastTime < 200) {
  //     return;
  //   }
  //   console.log("ngAfterViewChecked appAuthority", this.appAuthority);
  //   this.lastTime = now;
  //   if (this.appAuthority) {
  //     this.changeView();
  //   }
  // }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.appAuthority && changes.appAuthority.currentValue) {
      this.changeView();
    }
  }
  private async changeView() {
    try {
      const authorizes = await this.authorizeService
        .getAuthorizes()
        .catch(() => null);
      if (authorizes) {
        const isShow = !!authorizes[this.appAuthority];
        this.showHide(isShow);
      } else {
        this.showHide(false);
      }
    } catch (e) {
      console.error("authorizes ", e);
    }
  }
  private showHide(isShow = false) {
    // console.log(this.appAuthority, isShow);
    if (isShow) {
      // this.viewContainerRef.createEmbeddedView(this.tempRef);
      // console.log(
      //   "initialDisplayStyle",
      //   this.initialDisplayStyle,
      //   this.el.nativeElement.style.display
      // );
      this.el.nativeElement.style.display = this.initialDisplayStyle || "";
    } else {
      // this.viewContainerRef.clear();
      this.el.nativeElement.style.display = "none";
    }
  }
}
