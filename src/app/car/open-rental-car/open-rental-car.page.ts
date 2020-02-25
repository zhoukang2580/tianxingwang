import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { CarService } from "./../car.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { map } from "rxjs/operators";

@Component({
  selector: "app-open-rental-car",
  templateUrl: "./open-rental-car.page.html",
  styleUrls: ["./open-rental-car.page.scss"]
})
export class OpenRentalCarPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  url$: Observable<string>;
  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.url$ = this.carService
      .getOpenUrlSource()
      .pipe(
        map(it => this.domSanitizer.bypassSecurityTrustResourceUrl(it) as any)
      );
  }
}
