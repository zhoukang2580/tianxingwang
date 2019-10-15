import { IdentityEntity } from "./../../services/identity/identity.entity";
import { AfterViewInit, OnDestroy } from "@angular/core";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";
import { Router } from "@angular/router";
import { IdentityService } from "./../../services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "./../../services/api/api.service";
import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "./../../appHelper";
import { Component, OnInit, Input } from "@angular/core";
import { Platform } from "@ionic/angular";
import { DomSanitizer } from "@angular/platform-browser";
import * as md5 from "md5";
import { WechatHelper } from "src/app/wechatHelper";
import { Subscription } from "rxjs";

@Component({
  selector: "app-scan-comp",
  templateUrl: "./scan.component.html",
  styleUrls: ["./scan.component.scss"]
})
export class ScanComponent implements OnInit, AfterViewInit, OnDestroy {
  identityEntity: IdentityEntity;
  identityEntitySub = Subscription.EMPTY;
  canShow = true;
  scanText = LanguageHelper.getJSSDKScanTextTip();
  // @HostBinding('class.showConfirm')

  constructor(
    private plt: Platform,
    private barcodeScanner: BarcodeScanner,
    private identityService: IdentityService,
    private router: Router
  ) {
    this.identityEntitySub = this.identityService
      .getIdentitySource()
      .subscribe(id => {
        this.identityEntity = id;
      });
  }
  async ngAfterViewInit() {
    WechatHelper.getJssdk().catch(_ => null);
  }
  ngOnDestroy() {
    this.identityEntitySub.unsubscribe();
  }
  ngOnInit() {
    this.canShow = AppHelper.isApp() || AppHelper.isWechatH5();
  }
  async onScan() {
    // console.log("onScan", JSON.stringify(this.jssdkUrlConfig, null, 2));

    if (
      !this.identityEntity ||
      !this.identityEntity.Id ||
      !this.identityEntity.Ticket
    ) {
      this.router.navigate([AppHelper.getRoutePath("login")]);
      return Promise.reject("");
    }
    if (AppHelper.isWechatH5()) {
      await this.wechatH5Scan();
    }
    if (AppHelper.isApp()) {
      this.appScan()
        .then(r => {
          this.scan(r);
        })
        .catch(e => {
          AppHelper.alert(e || LanguageHelper.getJSSDKScanErrorTip());
        });
    }
  }
  private async appScan() {
    await this.plt.ready();
    return this.barcodeScanner
      .scan({
        resultDisplayDuration: 0,
        showTorchButton: true,
        showFlipCameraButton: true
      })
      .then(r => r.text);
  }
  private async wechatH5Scan() {
    const ok = await WechatHelper.ready().catch(e => {
      console.log(e);
      return false;
    });
    if (!ok) {
      return;
    }
    WechatHelper.wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: res => {
        this.scan(res.resultStr);
        return false;
      },
      fail: err => {
        AppHelper.alert(err);
        return false;
      }
    });
  }
  private scan(r: any) {
    if (!r) {
      if (AppHelper.isApp()) {
        return;
      }
    }
    this.router.navigate([AppHelper.getRoutePath("scan"), { scanResult: r }]);
  }
}
