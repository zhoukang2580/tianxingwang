import { Router } from "@angular/router";
import { Subscription, interval } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { AppHelper } from "src/app/appHelper";
import { QrScanService } from "src/app/services/qrScan/qrscan.service";

@Component({
  selector: "app-qrscan",
  templateUrl: "./qrscan.page.html",
  styleUrls: ["./qrscan.page.scss"]
})
export class QrScanPage implements OnInit, OnDestroy {
  private isAutoClose = false;
  private subscription = Subscription.EMPTY;
  isLighting = false;
  isMovingScanBar = false;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  constructor(
    private qrScanService: QrScanService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
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
    this.subscription = this.route.queryParamMap.subscribe(q => {
      this.isAutoClose = q.get("autoClose") == "true";
      this.scan();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.isMovingScanBar = false;
    this.clearBackground(false);
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
      this.qrScanService.resumePreview();
      const text = await this.qrScanService.scan();
      this.qrScanService.setScanResultSource(text);
      this.isMovingScanBar = false;
      this.qrScanService.hide();
      this.qrScanService.pausePreview();
      this.qrScanService.cancelScan().catch(() => 0);
      if (this.isAutoClose) {
        this.backbtn.backToPrePage();
        this.clearBackground(false);
        return;
      }
      this.router.navigate([AppHelper.getRoutePath("scan-result")], {
        queryParams: { scanResult: encodeURIComponent(text) }
      });
      this.clearBackground(false);
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}
