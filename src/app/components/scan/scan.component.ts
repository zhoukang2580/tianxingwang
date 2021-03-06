import { IdentityEntity } from "./../../services/identity/identity.entity";
import { AfterViewInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { IdentityService } from "./../../services/identity/identity.service";
import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "./../../appHelper";
import { Component, OnInit, Input } from "@angular/core";
import { Platform } from "@ionic/angular";
import { WechatHelper } from "src/app/wechatHelper";
import { Subscription } from "rxjs";
import {
  IQrScannerStatus,
  QrScanService,
} from "src/app/services/qrScan/qrscan.service";
@Component({
  selector: "app-scan-comp",
  templateUrl: "./scan.component.html",
  styleUrls: ["./scan.component.scss"],
})
export class ScanComponent implements OnInit, AfterViewInit, OnDestroy {
  private identityEntity: IdentityEntity;
  private identityEntitySub = Subscription.EMPTY;
  private scanResultSub = Subscription.EMPTY;
  @Input() showText = false;
  @Input() tplRef;
  @Input() isAutoCloseScanPage = false;
  @Output() scanResult: EventEmitter<any>;
  canShow = true;
  scanText = LanguageHelper.getJSSDKScanTextTip();
  // @HostBinding('class.showConfirm')

  constructor(
    private plt: Platform,
    private identityService: IdentityService,
    private router: Router,
    private qrScanService: QrScanService
  ) {
    this.scanResult = new EventEmitter();
    this.identityEntitySub = this.identityService
      .getIdentitySource()
      .subscribe((id) => {
        this.identityEntity = id;
      });
  }
  ngAfterViewInit() {
    if (AppHelper.isWechatH5()) {
      WechatHelper.ready();
      setTimeout(async () => {
        await WechatHelper.getJssdk().catch((_) => null);
        // this.canShow = false;
        // this.canShow = !!WechatHelper.jssdkUrlConfig;
      }, 0);
    }
  }
  ngOnDestroy() {
    this.identityEntitySub.unsubscribe();
    this.scanResultSub.unsubscribe();
  }
  ngOnInit() {
    this.canShow = AppHelper.isApp() || AppHelper.isWechatH5();
    if (AppHelper.isWechatH5()) {
      WechatHelper.isReadyFinishObservable.subscribe((ok) => {
        this.canShow = ok;
      });
    }
    this.scanResultSub = this.qrScanService
      .getScanResultSource()
      .subscribe((txt) => {
        this.scanResult.emit(txt);
      });
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
      this.showScanResult(await this.wechatH5Scan());
    }
    if (AppHelper.isApp()) {
      this.appScan()
        .then((r) => {
          this.showScanResult(r);
        })
        .catch((e) => {
          AppHelper.alert(e || LanguageHelper.getJSSDKScanErrorTip());
        });
    }
  }
  private async appScan() {
    try {
      await this.plt.ready();
      let status: IQrScannerStatus = await this.qrScanService
        .prepare()
        .catch(() => null);
      if (!status) {
        status = await this.qrScanService.getStatus();
      }
      console.log("appScan status", status);
      if (status.authorized == "1") {
        this.router.navigate(["qrscan"], {
          queryParams: { autoClose: this.isAutoCloseScanPage },
        });
      } else {
        if (status.canOpenSettings == "1") {
          const ok = await AppHelper.alert(
            "?????????????????????????????????????????????",
            true,
            "??????",
            "??????"
          );
          if (ok) {
            await this.qrScanService.openSettings().catch((e) => {
              console.log("openSettings error", e);
            });
            return;
          }
        }
        throw new Error("???????????????????????????");
      }
    } catch (e) {
      console.log("appScan error", e);
      AppHelper.alert(e || "???????????????????????????");
    }
  }
  private async wechatH5Scan() {
    return WechatHelper.scan();
    // const ok = await WechatHelper.ready().catch(e => {
    //   console.log(e);
    //   return false;
    // });
    // if (!ok) {
    //   return "";
    // }
    // WechatHelper.wx.scanQRCode({
    //   needResult: 1, // ?????????0?????????????????????????????????1??????????????????????????????
    //   scanType: ["qrCode", "barCode"], // ????????????????????????????????????????????????????????????
    //   success: res => {
    //     this.qrScanService.setScanResultSource(res.resultStr);
    //     this.showScanResult(res.resultStr);
    //     return false;
    //   },
    //   fail: err => {
    //     // AppHelper.alert(err);
    //     console.error(err);
    //     return false;
    //   }
    // });
  }
  private showScanResult(r: any) {
    if (!r || this.isAutoCloseScanPage) {
      if (AppHelper.isApp()) {
        return;
      }
    }
    this.router.navigate([AppHelper.getRoutePath("scan-result")], {
      queryParams: { scanResult: encodeURIComponent(r) },
    });
  }
}
