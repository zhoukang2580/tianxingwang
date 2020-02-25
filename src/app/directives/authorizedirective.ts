import { AuthorizeService } from "./../services/authorize/authorize.service";
import {
  Directive,
  Input,
  ViewContainerRef,
  TemplateRef,
  OnChanges,
  SimpleChanges
} from "@angular/core";

@Directive({
  selector: "[appAuthority]"
})
export class AuthorizeDirective implements OnChanges {
  @Input() appAuthority: string;
  constructor(
    private authorizeService: AuthorizeService,
    private viewContainerRef: ViewContainerRef,
    private tempRef: TemplateRef<any>
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
        if (authorizes.find(it => it == this.appAuthority)) {
          this.viewContainerRef.createEmbeddedView(this.tempRef);
        } else {
          this.viewContainerRef.clear();
        }
      }
    } catch (e) {}
  }
}
