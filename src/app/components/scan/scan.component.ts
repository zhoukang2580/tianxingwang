import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Router } from '@angular/router';
import { IdentityService } from './../../services/identity/identity.service';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { ApiService } from './../../services/api/api.service';
import { LanguageHelper } from 'src/app/languageHelper';
import { AppHelper } from './../../appHelper';
import { Component, OnInit, Input } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
interface JssdkResult {
  appid: string;// ""
  noncestr: string;// "40354f68401a44b697f1e746bfc90390"
  signature: string;// "39a2d6e18fe3a19110897d116755e588173b49a5"
  timestamp: string;// "636946736617144771"
}
const jsApiList = [
  'updateAppMessageShareData',
  'updateTimelineShareData',
  'onMenuShareTimeline',//（即将废弃）
  'onMenuShareAppMessage',//（即将废弃）
  'onMenuShareQQ',//（即将废弃）
  'onMenuShareWeibo',
  'onMenuShareQZone',
  'startRecord',
  'stopRecord',
  'onVoiceRecordEnd',
  'playVoice',
  'pauseVoice',
  'stopVoice',
  'onVoicePlayEnd',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'translateVoice',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard'];
@Component({
  selector: 'app-scan-comp',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
})
export class ScanComponent implements OnInit {
  wx = window['wx'];
  canShow = true;
  scanText = LanguageHelper.getJSSDKScanTextTip();
  // @HostBinding('class.showConfirm')
  isShowConfirm = false;
  result: string;
  @Input()
  confirmText: string = LanguageHelper.getConfirmTip();
  @Input()
  cancelText: string = LanguageHelper.getCancelTip();
  @Input()
  description: string;
  openIframe = false;// 是否用iframe打开
  showScanResultText = !false;// 是否显示扫码文本
  private _iframeSrc: any;
  get iframeSrc() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this._iframeSrc);
  }
  constructor(
    private apiService: ApiService,
    private plt: Platform,
    private sanitizer: DomSanitizer,
    private barcodeScanner: BarcodeScanner,
    private identityService: IdentityService,
    private router: Router) {
  }

  ngOnInit() {
    // this.canShow = AppHelper.isApp() || ((AppHelper.isWechatH5() || AppHelper.isWechatMini()));
    this.hideIframePage();
    this.hideResultTextPage();
    this.showConfirmPage();
  }
  showIframePage(src: string) {
    this._iframeSrc = src;
    this.openIframe = true;
  }
  hideIframePage() {
    this.openIframe = false;
    this._iframeSrc = null;
  }
  showResultTextPage(text: string) {
    this.result = text;
    this.showScanResultText = true;
  }
  hideResultTextPage() {
    this.showScanResultText = false;
  }
  showConfirmPage() {
    this.isShowConfirm = true;
  }
  hideConfirmPage() {
    this.isShowConfirm = false;
  }
  private async wxReady() {
    if (!this.wx) {
      console.log("jssdk加载失败，wx对象不存在");
      return Promise.reject(LanguageHelper.getJSSDKNotExistsTip());
    }
    let err;
    const info = await this.getJssdkInfo().catch(e => {
      // AppHelper.alert(e || LanguageHelper.getJSSDKScanErrorTip());
      err = e;
    });
    if (err || !info) {
      console.log("接口请求错误");
      return Promise.reject(err);
    }
    return new Promise<boolean>((resove, reject) => {
      this.wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: info.appid, // 必填，公众号的唯一标识
        timestamp: info.timestamp, // 必填，生成签名的时间戳
        nonceStr: info.noncestr, // 必填，生成签名的随机串
        signature: info.signature,// 必填，签名
        jsApiList: [
          // 'checkJsApi',// 判断当前版本是否支持分享指定JS接口
          'onMenuShareTimeline', // 分享到朋友圈
          'onMenuShareAppMessage', // 分享到微信好友
          'onMenuShareQQ', // 分享到QQ
          'onMenuShareWeibo', // 分享到微博
          'onMenuShareQZone',// 分享到空间
          "hideMenuItems", // 批量隐藏菜单
          "scanQRCode"
        ]// 必填，需要使用的JS接口列表
      });
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
      // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
      // 则须把相关接口放在ready函数中调用来确保正确执行。
      // 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      this.wx.ready(() => {
        resove(true);
      });
      this.wx.error((err) => {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，
        // 具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        reject(err);
      });
    });
  }
  private getJssdkInfo() {
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-wechat-jssdk";
    req.Data = {
      Url: encodeURIComponent(window.location.href.substring(0, window.location.href.indexOf("#")))
    };

    return new Promise<JssdkResult>((resolve, reject) => {
      const sub = this.apiService.getResponse<JssdkResult>(req).subscribe(rs => {
        if (!rs.Status || !rs.Data) {
          return reject(rs.Message || rs.Code);
        }
        resolve(rs.Data);
      }, e => {
        if (sub) {
          sub.unsubscribe();
        }
        reject(e);
      }, () => {
        if (sub) {
          sub.unsubscribe();
        }
      });
    });
  }
  async onScan() {
    const id = await this.identityService.getIdentity();
    if (!id || !id.Id || !id.Ticket) {
      this.router.navigate([AppHelper.getRoutePath('login')]);
      return Promise.reject("");
    }
    if (AppHelper.isWechatH5()) {
      this.wechatH5Scan().then(r => {
        // 
        this.scan(r);
      })
        .catch(err => {
          AppHelper.alert(err || LanguageHelper.getJSSDKScanErrorTip());
        });
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
    const ok = await this.wxReady().catch(e => false);
    if (!ok) {
      return Promise.reject(LanguageHelper.getJSSDKScanErrorTip());
    }
    return new Promise<string>((resolve, reject) => {
      this.wx.scanQRCode({
        needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: (res) => {
          const result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
          resolve(result);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });

  }


  onConfirm() {
    this.hideConfirmPage();
  }
  onCancel() {
    this.hideConfirmPage();
  }
  scan(r: any) {
    this.result = r;
  }
  handle() {

  }
}
