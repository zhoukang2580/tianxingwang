import { AuthorizeService } from "./../services/authorize/authorize.service";
import {
  Directive,
  Input,
  ViewContainerRef,
  TemplateRef,
  OnChanges,
  SimpleChanges,
  ElementRef
} from "@angular/core";

@Directive({
  selector: "[appAuthority]"
})
export class AuthorizeDirective implements OnChanges {
  @Input() appAuthority: string;
  constructor(
    private authorizeService: AuthorizeService,
    private viewContainerRef: ViewContainerRef,
    private tempRef: TemplateRef<any>,
    private el: ElementRef<HTMLElement>
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes.appAuthority && changes.appAuthority.currentValue) {
      this.changeView();
    }
  }
  private async changeView() {
    try {
      const authorizes = await this.authorizeService.getAuthorizes();
      if (authorizes && authorizes.length) {
        const isShow = !!authorizes.find(it => it == this.appAuthority);
        if (isShow) {
          this.showHide(false);
        } else {
          this.el.nativeElement.style.display = "none";
          this.showHide(false);
        }
      } else {
        this.showHide(false);
      }
    } catch (e) {}
  }
  private showHide(isShow = false) {
    if (isShow) {
      // this.viewContainerRef.createEmbeddedView(this.tempRef);
      this.el.nativeElement.style.display = "initial";
    } else {
      // this.viewContainerRef.clear();
      this.el.nativeElement.style.display = "none";
    }
  }
}
