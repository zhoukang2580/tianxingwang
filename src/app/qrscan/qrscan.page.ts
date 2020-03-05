import { BackButtonComponent } from "./../components/back-button/back-button.component";
import { Router } from "@angular/router";
import { Subscription, interval } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { QrScanService } from "./../services/qrScan/qrscan.service";
import { Component, OnInit } from "@angular/core";
import { AppHelper } from "../appHelper";

@Component({
  selector: "app-qrscan",
  templateUrl: "./qrscan.page.html",
  styleUrls: ["./qrscan.page.scss"]
})
export class QrScanPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  isLighting = false;
  isMovingScanBar = false;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  constructor(
    private qrScanService: QrScanService,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.qrScanService.hide();
    this.clearBackground(false);
    this.backbtn.backToPrePage();
  }
  onEnableLight(isOn: boolean) {
    this.isLighting = isOn;
    if (isOn) {
      this.qrScanService.enableLight();
    } else {
      this.qrScanService.disableLight();
    }
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(() => {
      this.scan();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.isMovingScanBar = false;
    this.clearBackground(false);
    this.qrScanService.pausePreview();
  }
  private clearBackground(isShow: boolean) {
    if (isShow) {
      if (!document.body.classList.contains("qr-scanning")) {
        document.body.classList.add("qr-scanning");
      }
    } else {
      document.body.classList.remove("qr-scanning");
    }
    this.qrScanService.pausePreview();
  }

  private async scan() {
    this.isMovingScanBar = true;
    try {
      this.clearBackground(true);
      this.qrScanService.show();
      const text = await this.qrScanService.scan();
      this.isMovingScanBar = false;
      this.qrScanService.hide();
      this.router.navigate([
        AppHelper.getRoutePath("scan"),
        { scanResult: text }
      ]);
      this.clearBackground(false);
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}
