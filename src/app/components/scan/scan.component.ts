import { finalize } from 'rxjs/operators';
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { AfterViewInit, OnDestroy, InjectionToken, Injector, Inject } from "@angular/core";
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
export const QRSCANNER_TOKEN = new InjectionToken<IQRScanner>('QRScanner_Token', {
  providedIn: 'root',
  factory: () => ({
    prepare: ()=>new Promise<IQrScannerStatus>((resolve, reject) => {
      qrScanner.prepare(resolve, reject);
    }),
    cancelScan: ()=>new Promise<void>((resolve, reject) => {
      qrScanner.cancelScan(resolve, reject)
    }),
    destroy: ()=>new Promise<void>((resolve, reject) => {
      qrScanner.destroy(resolve, reject)
    }),
    enableLight: ()=>new Promise<void>((resolve, reject) => {
      qrScanner.enableLight(resolve, reject)
    }),
    disableLight: ()=>new Promise<void>((resolve, reject) => {
      qrScanner.disableLight(resolve, reject)
    }),
    scan:()=> new Promise<string>((resolve, reject) => {
      qrScanner.scan(resolve,reject)
    }),
    hide: ()=>new Promise<IQrScannerStatus>((resolve, reject) => {
      qrScanner.hide(resolve,reject)
    }),
    pausePreview:()=> new Promise<IQrScannerStatus>((resolve, reject) => {
      qrScanner.pausePreview(resolve,reject)
    }),
    show:()=> new Promise<IQrScannerStatus>((resolve, reject) => {
      qrScanner.show(resolve,reject)
    }),
    getStatus: ()=>new Promise<IQrScannerStatus>((resolve, reject) => {
      qrScanner.getStatus(resolve,reject)
    }),
    openSettings: ()=>new Promise<IQrScannerStatus>((resolve, reject) => {
      qrScanner.openSettings(resolve,reject)
    }),
  })
});
const qrScanner = window['qrScanner'];
@Component({
  selector: "app-scan-comp",
  templateUrl: "./scan.component.html",
  styleUrls: ["./scan.component.scss"],
  providers: []
})
export class ScanComponent implements OnInit, AfterViewInit, OnDestroy {
  identityEntity: IdentityEntity;
  identityEntitySub = Subscription.EMPTY;
  canShow = true;
  scanText = LanguageHelper.getJSSDKScanTextTip();
  // @HostBinding('class.showConfirm')

  constructor(
    @Inject(QRSCANNER_TOKEN) private qrScanner: IQRScanner,
    private plt: Platform,
    private identityService: IdentityService,
    private router: Router,
  ) {
    this.identityEntitySub = this.identityService
      .getIdentitySource()
      .subscribe(id => {
        this.identityEntity = id;
      });
    plt.ready().then(() => {
      this.qrScanner = window['qrScanner'];
    })
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
    const status=await this.qrScanner.prepare();
    if(status.authorized=='1'){
      const text=await this.qrScanner.scan();
      this.qrScanner.hide();
      return text;
    }else{
      throw new Error("您拒绝使用相机功能");
    }
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
export interface IQRScanner {
  prepare:()=> Promise<IQrScannerStatus>;
  cancelScan: ()=>Promise<void>;
  destroy:()=> Promise<void>;
  enableLight: ()=>Promise<void>;
  disableLight: ()=>Promise<void>;
  scan: ()=>Promise<string>;
  hide: ()=>Promise<IQrScannerStatus>;
  pausePreview:()=> Promise<IQrScannerStatus>;
  show: ()=>Promise<IQrScannerStatus>;
  getStatus:()=> Promise<IQrScannerStatus>;
  openSettings: ()=>Promise<IQrScannerStatus>;
}
export type ZeroOne = "0" | "1";
export interface IQrScannerStatus {
  authorized: ZeroOne;
  denied: ZeroOne;
  restricted: ZeroOne;
  prepared: ZeroOne;
  scanning: ZeroOne;
  previewing: ZeroOne;
  showing: ZeroOne;
  lightEnabled: ZeroOne;
  canOpenSettings: ZeroOne;
  canEnableLight: ZeroOne;
  canChangeCamera: ZeroOne;
  currentCamera: ZeroOne;
}
