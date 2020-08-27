import { DomSanitizer } from "@angular/platform-browser";
import { Observable, BehaviorSubject } from "rxjs";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { CarService } from "./../car.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { map, tap, finalize } from "rxjs/operators";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import {
  InAppBrowser,
  InAppBrowserObject,
  InAppBrowserOptions,
} from "@ionic-native/in-app-browser/ngx";
import { Clipboard } from "@ionic-native/clipboard/ngx";
import { WechatHelper } from "src/app/wechatHelper";

@Component({
  selector: "app-open-rental-car",
  templateUrl: "./open-rental-car.page.html",
  styleUrls: ["./open-rental-car.page.scss"],
})
export class OpenRentalCarPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private shareWebUrl$ = new BehaviorSubject(null);
  isApp = AppHelper.isApp();
  url$: Observable<string>;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private iab: InAppBrowser,
    private clipboard: Clipboard
  ) {}
  ngOnDestroy() {
    console.log("open-rental-car ondestroy");
    // try {
    //   if (this.browser) {
    //     this.browser.hide();
    //     this.browser.close();
    //   }
    // } catch (e) {
    //   console.error(e);
    // }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  private isIphoneX() {
    // 刘海屏
    return (
      /iphone/gi.test(navigator.userAgent) &&
      screen.height == 812 &&
      screen.width == 375
    );
  }
  async back() {
    const ok = await AppHelper.alert(
      "是否退出当前页面？",
      true,
      LanguageHelper.getYesTip(),
      LanguageHelper.getNegativeTip()
    );
    if (ok) {
      this.backBtn.popToPrePage();
    }
  }
  private getQueryParams(url: string) {
    const obj = {};
    if (url) {
      if (url.includes("?")) {
        const tmp = url.substr(url.indexOf("?") + 1);
        const arr = tmp.split("&");
        arr.forEach((kv) => {
          const it = kv.split("=");
          obj[it[0]] = it[1];
        });
      }
    }
    return obj;
  }
  // private closeBrowser() {
  //   if (this.browser) {
  //     this.browser.close();
  //   }
  //   if (this.openSystemBrowser) {
  //     this.openSystemBrowser.close();
  //   }
  // }
  private shareWebPage(url: string) {
    if (url) {
      WechatHelper.shareWebpage({
        webTitle: "分享行程",
        webDescription: "行程分享",
        webpageUrl: url,
      });
    }
  }
  // private async openInAppBrowser(url: string) {
  //   if (AppHelper.platform.is("android")) {
  //     this.openInMyBrowser(url);
  //     return;
  //   }
  //   // if (this.browser) {
  //   //   this.browser.close();
  //   //   this.subscriptions.forEach((s) => s.unsubscribe());
  //   // }
  //   const color = "#2596D9";
  //   const options: InAppBrowserOptions = {
  //     usewkwebview: "yes",
  //     location: "no",
  //     toolbar: "yes",
  //     zoom: "no",
  //     footer: "no",
  //     beforeload: "yes", // 设置后，beforeload事件才能触发
  //     closebuttoncaption: "关闭(CLOSE)",
  //     closebuttoncolor: "#2596D9",
  //     navigationbuttoncolor: "#2596D9",
  //     // toolbarcolor:"#2596D90f"
  //   };
  //   // if (AppHelper.platform.is("ios")) {
  //   //   options.beforeload = "yes";
  //   // }
  //   // url = `http://test.version.testskytrip.com/download/test.html`;
  //   if (
  //     url.startsWith("weixin") ||
  //     url.startsWith("alipays") ||
  //     this.checkIfAliWechatPay(url)
  //   ) {
  //     this.openWechatOrAliApp(url);
  //   } else {
  //     // this.browser = this.iab.create(encodeURI(url), "_blank", options);
  //     // this.addListeners();
  //   }
  // }
  private async openInMyBrowser(url: string) {
    try {
      // if (this.browser) {
      //   this.browser.hide();
      // }
      const res = await AppHelper.payH5Url(url).catch(async (e) => {
        console.log("aliPay error", e);
        await AppHelper.alert(e);
        return null;
      });
      console.log("payres", res);
      if (res) {
        await AppHelper.alert(res);
        await AppHelper.alert(
          res.payResultCode == "9000" ? "支付完成" : res.payResultCode
        );
      } else {
        if (this.backBtn) {
          this.backBtn.popToPrePage();
        }
      }
      // if (this.browser) {
      //   this.browser.show();
      // }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  // private addListeners() {
  //   if (this.browser) {
  //     this.subscriptions.push(
  //       this.browser.on("beforeload").subscribe(async (evt) => {
  //         console.log("beforeload", evt.message, evt.data, evt.code, evt.url);
  //         if (evt.url) {
  //           const toUrl = evt.url.toLowerCase();
  //           if (
  //             toUrl.startsWith("weixin") ||
  //             toUrl.startsWith("wechat") ||
  //             toUrl.startsWith("alipays") ||
  //             this.checkIfAliWechatPay(toUrl)
  //           ) {
  //             // 微信或者支付宝支付
  //             this.openWechatOrAliApp(toUrl);
  //             return;
  //           }
  //           if (toUrl.includes("sharetrips")) {
  //             AppHelper.isWXAppInstalled().then(async (installed) => {
  //               if (installed) {
  //                 this.shareWebPage(evt.url);
  //               } else {
  //                 this.clipboard.clear();
  //                 await this.clipboard.copy(evt.url);
  //                 this.browser.hide();
  //                 await AppHelper.toast(
  //                   "行程链接已拷贝到剪切板",
  //                   1400,
  //                   "middle"
  //                 );
  //                 this.browser.show();
  //               }
  //             });
  //           } else {
  //             if (!toUrl.includes("tel:")) {
  //               // Load this URL in the inAppBrowser.
  //               this.browser._loadAfterBeforeload(evt.url);
  //             } else {
  //               this.callNumber(evt.url);
  //             }
  //           }
  //         } else {
  //           console.log("无法加载url");
  //         }
  //       })
  //     );
  //     this.subscriptions.push(
  //       this.browser.on("loaderror").subscribe((evt) => {
  //         console.log("loaderror");
  //         console.log(evt);
  //         console.log("loaderror", evt);
  //         console.log("loaderror", evt.message, evt.data, evt.code, evt.url);
  //       })
  //     );
  //     this.subscriptions.push(
  //       this.browser.on("loadstart").subscribe((evt) => {
  //         // if (this.browser) {
  //         //   this.browser.show();
  //         // }
  //         const toUrl = evt.url;
  //         if (AppHelper.platform.is("android")) {
  //           if (toUrl.includes("sharetrips")) {
  //             AppHelper.isWXAppInstalled().then(async (installed) => {
  //               if (installed) {
  //                 this.shareWebPage(evt.url);
  //               } else {
  //                 this.clipboard.clear();
  //                 await this.clipboard.copy(evt.url);
  //                 this.browser.hide();
  //                 await AppHelper.toast(
  //                   "行程链接已拷贝到剪切板",
  //                   2000,
  //                   "middle"
  //                 );
  //                 this.browser.show();
  //               }
  //             });
  //           }
  //         }
  //         console.log("loadstart");
  //         console.log(evt);
  //         console.log("loadstart", evt);
  //         console.log("loadstart", evt.message, evt.data, evt.code, evt.url);
  //         if (evt.url) {
  //           this.callNumber(evt.url);
  //         }
  //       })
  //     );
  //     this.subscriptions.push(
  //       this.browser.on("loadstop").subscribe((evt) => {
  //         console.log("loadstop");
  //         console.log(evt);
  //         console.log("loadstop", evt);
  //         console.log("loadstop", evt.message, evt.data, evt.code, evt.url);
  //       })
  //     );
  //     this.subscriptions.push(
  //       this.browser.on("message").subscribe((evt) => {
  //         console.log("message");
  //         console.log(evt);
  //         console.log("message", evt);
  //         console.log("message", evt.message, evt.data, evt.code, evt.url);
  //       })
  //     );
  //     const sub = this.browser.on("exit").subscribe(() => {
  //       setTimeout(() => {
  //         if (sub) {
  //           sub.unsubscribe();
  //         }
  //         this.closeBrowser();
  //         this.backBtn.popToPrePage();
  //       }, 100);
  //     });
  //   }
  // }
  private checkIfAliWechatPay(uri: string) {
    if (uri.includes("mclient.alipay.com") || uri.includes("wx.tenpay.com")) {
      // ios 打开支付宝支付
      return true;
    }
    if (
      uri.startsWith("alipays") ||
      uri.startsWith("weixin") ||
      uri.startsWith("wechat")
    ) {
      return true;
    }
    return false;
  }
  private async callNumber(url: string) {
    const m = url && url.match(/tel:(\d+)/i);
    if (m && m.length >= 2) {
      const phoneNumber = m[1];
      console.log("phoneNumber" + phoneNumber);
      if (phoneNumber) {
        await AppHelper.platform.ready();
        const callNumber = window["call"];
        // window.location.href=`tel:${phoneNumber}`;
        if (callNumber) {
          callNumber
            .callNumber(phoneNumber, true)
            .then((res) => console.log("Launched dialer!", res))
            .catch((err) => console.log("Error launching dialer", err));
        }
      }
    }
  }
  ngOnInit() {
    this.subscriptions.push(
      this.shareWebUrl$.subscribe((url) => {
        this.shareWebPage(url);
      })
    );
    if (AppHelper.isApp()) {
      this.subscriptions.push(
        this.route.queryParamMap.subscribe((q) => {
          if (q.get("url")) {
            this.openInMyBrowser(q.get("url"));
          } else if (
            AppHelper.getQueryParamers()["path"] &&
            AppHelper.getQueryParamers()["path"].includes("rental-car")
          ) {
            const url = AppHelper.getQueryParamers()["url"];
            if (url) {
              this.openInMyBrowser(url);
            }
          }
        })
      );
    } else {
      this.url$ = this.carService
        .getOpenUrlSource()
        .pipe(
          map(
            (it) => this.domSanitizer.bypassSecurityTrustResourceUrl(it) as any
          )
        );
    }
  }
}
