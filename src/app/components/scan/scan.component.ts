import { AfterViewInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Router } from '@angular/router';
import { IdentityService } from './../../services/identity/identity.service';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { ApiService } from './../../services/api/api.service';
import { LanguageHelper } from 'src/app/languageHelper';
import { AppHelper } from './../../appHelper';
import { Component, OnInit, Input } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import * as md5 from 'md5';
import { wechatHelper } from 'src/app/wechatHelper';

@Component({
  selector: 'app-scan-comp',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
})
export class ScanComponent implements OnInit, AfterViewInit {

  canShow = true;
  scanText = LanguageHelper.getJSSDKScanTextTip();
  // @HostBinding('class.showConfirm')

  constructor(
    private plt: Platform,
    private barcodeScanner: BarcodeScanner,
    private identityService: IdentityService,
    private router: Router) {
  }
  async ngAfterViewInit() {
    wechatHelper.getJssdk();
  }
  ngOnInit() {
    this.canShow = AppHelper.isApp() || AppHelper.isWechatH5();
  }
  async onScan() {
    // console.log("onScan", JSON.stringify(this.jssdkUrlConfig, null, 2));
    const id = await this.identityService.getIdentity();
    if (!id || !id.Id || !id.Ticket) {
      this.router.navigate([AppHelper.getRoutePath('login')]);
      return Promise.reject("");
    }
    if (AppHelper.isWechatH5()) {
      await this.wechatH5Scan();
    }
    if (AppHelper.isApp()) {
      this.appScan().then(r => {
        this.scan(r);
      }).catch(e => {
        AppHelper.alert(e || LanguageHelper.getJSSDKScanErrorTip());
      });
    }
  }
  private async appScan() {
    await this.plt.ready();
    return this.barcodeScanner.scan().then(r => r.text);
  }
  private async wechatH5Scan() {
    const ok = await wechatHelper.ready().catch(e => {
      console.log(e);
      return false;
    });
    if (!ok) {
      return;
    }
    wechatHelper.wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: (res) => {
        this.scan(res.resultStr);
        return false;
      },
      fail: (err) => {
        AppHelper.alert(err);
        return false;
      }
    });

  }
  private scan(r: any) {
    this.router.navigate([AppHelper.getRoutePath('scan'), { scanResult: r }]);
  }
 

 
}
