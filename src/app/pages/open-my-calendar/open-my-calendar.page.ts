import { Subscription } from "rxjs";
import { NavController } from "@ionic/angular";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";

@Component({
  selector: "app-open-my-calendar",
  templateUrl: "./open-my-calendar.page.html",
  styleUrls: ["./open-my-calendar.page.scss"]
})
export class OpenMyCalendarPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  private routeUrl: string;
  constructor(private route: ActivatedRoute, private navCtrl: NavController) {}

  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(d => {
      if (d.get("backRouteUrl")) {
        this.routeUrl = d.get("backRouteUrl");
      }
    });
  }
  onDateSelect(d: { date: string }) {
    this.navCtrl.navigateBack(this.routeUrl, {
      queryParams: { date: d && d.date }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
