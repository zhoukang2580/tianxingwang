import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { CarService } from "./../car.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { map, tap } from "rxjs/operators";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";

@Component({
  selector: "app-open-rental-car",
  templateUrl: "./open-rental-car.page.html",
  styleUrls: ["./open-rental-car.page.scss"]
})
export class OpenRentalCarPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  url$: Observable<string>;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  async back() {
    const ok = await AppHelper.alert(
      "是否退出当前租车页面？",
      true,
      LanguageHelper.getYesTip(),
      LanguageHelper.getNegativeTip()
    );
    if (ok) {
      this.backBtn.backToPrePage();
    }
  }
  ngOnInit() {
    this.url$ = this.carService.getOpenUrlSource().pipe(
      tap(url => {
        if (url) {
          if (document.body.classList.contains("")) {
          }
        }
      }),
      map(it => this.domSanitizer.bypassSecurityTrustResourceUrl(it) as any)
    );
  }
}
