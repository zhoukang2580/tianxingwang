import { BackButtonComponent } from './../components/back-button/back-button.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { OnDestroy, ViewChild } from '@angular/core';
import { QrScanService } from './../services/qrScan/qrscan.service';
import { Component, OnInit } from '@angular/core';
import { AppHelper } from '../appHelper';

@Component({
  selector: 'app-qrscan',
  templateUrl: './qrscan.page.html',
  styleUrls: ['./qrscan.page.scss'],
})
export class QrScanPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  constructor(private qrScanService: QrScanService,
    private router: Router,
    private route: ActivatedRoute) { }
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.qrScanService.cancelScan();
    this.qrScanService.hide();
    this.setClass(false);
    this.backbtn.backToPrePage();
  }
  onEnableLight(isOn: boolean) {
    if (isOn) {
      this.qrScanService.enableLight();
    } else {
      this.qrScanService.disableLight();
    }
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(() => {
      this.scan();
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.setClass(false)
  }
  private setClass(isShow: boolean) {
    if (isShow) {
      if (!document.body.classList.contains("qr-scanning")) {
        document.body.classList.add("qr-scanning")
      }
    } else {
      document.body.classList.remove("qr-scanning")
    }
  }
  private async scan() {
    try {
      this.setClass(true);
      this.qrScanService.show();
      const status = await this.qrScanService.getStatus();
      if (status.scanning == '1') {
        await this.qrScanService.cancelScan();
      }
      const text = await this.qrScanService.scan()
      this.qrScanService.hide();
      this.router.navigate([AppHelper.getRoutePath("scan"), { scanResult: text }]);
      this.setClass(false);

    } catch (e) {
      AppHelper.alert(e)
    }
  }
}
