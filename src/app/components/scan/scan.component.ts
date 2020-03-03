import { finalize } from 'rxjs/operators';
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { AfterViewInit, OnDestroy } from "@angular/core";
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
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

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
    private identityService: IdentityService,
    private router: Router,
    private qrScanner: QRScanner
  ) {
    this.identityEntitySub = this.identityService
      .getIdentitySource()
      .subscribe(id => {
        this.identityEntity = id;
      });
  }
  async ngAfterViewInit() {
    setTimeout(() => {
      WechatHelper.getJssdk().catch(_ => null);
    }, 2000);
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
    const permission: QRScannerStatus = await this.qrScanner.prepare();
    return new Promise<string>((resolve, reject) => {
      if (permission.authorized) {
        // camera permission was granted
        // start scanning
        const sub = this.qrScanner.scan()
          .pipe(finalize(() => {
            setTimeout(() => {
              sub.unsubscribe();
            }, 0);
          }))
          .subscribe(text => {
            this.qrScanner.hide(); // hide camera preview
            resolve(text);
          }, e => {
            reject(e)
          })
      } else if (permission.denied) {
        reject("您拒绝了使用相机");
        // camera permission was permanently denied
        // you must use QRScanner.openSettings() method to guide the user to the settings page
        // then they can grant the permission from there
      } else {
        reject("您拒绝了使用相机");
        // permission was denied, but not permanently. You can ask for permission again at a later time.
      }

    });
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
        // AppHelper.alert(err);
        console.error(err);
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
