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
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
@Component({
  selector: "app-open-rental-car",
  templateUrl: "./open-rental-car.page.html",
  styleUrls: ["./open-rental-car.page.scss"],
})
export class OpenRentalCarPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private browser: InAppBrowserObject;
  private openSystemBrowser: InAppBrowserObject;
  private shareWebUrl$ = new BehaviorSubject(null);
  private isSafariAvailable = false;
  private entryUrl: string;
  isApp = AppHelper.isApp();
  url$: Observable<string>;
  payUrl: string;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private iab: InAppBrowser,
    private clipboard: Clipboard,
    private safariViewController: SafariViewController
  ) {}
  ngOnDestroy() {
    console.log("open-rental-car ondestroy");
    this.payUrl = "";
    try {
      if (this.browser) {
        this.browser.hide();
        this.browser.close();
      }
    } catch (e) {
      console.error(e);
    }
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
    if (!this.isSafariAvailable) {
      const ok = await AppHelper.alert(
        "是否退出当前页面？",
        true,
        LanguageHelper.getYesTip(),
        LanguageHelper.getNegativeTip()
      );
      if (ok) {
        this.closeBrowser();
        this.backBtn.popToPrePage();
      }
    } else {
      this.closeBrowser();
      this.backBtn.popToPrePage();
    }
  }
  private closeBrowser() {
    if (this.browser) {
      this.browser.close();
    }
    if (this.openSystemBrowser) {
      this.openSystemBrowser.close();
    }
  }
  private shareWebPage(url: string) {
    if (url) {
      WechatHelper.shareWebpage({
        webTitle: "分享行程",
        webDescription: "行程分享",
        webpageUrl: url,
      });
    }
  }
  private async openInSafari(uri: string) {
    const ok = await this.safariViewController.isAvailable().catch(() => false);
    if (ok) {
      const sub = this.safariViewController
        .show({
          url: uri,
          hidden: false,
          animated: true,
          transition: "curl",
          enterReaderModeIfAvailable: true,
          tintColor: "#2596D9",
        })
        .pipe(
          finalize(() =>
            setTimeout(() => {
              sub.unsubscribe();
            }, 200)
          )
        )
        .subscribe(
          (result) => {
            if (result.event === "opened") {
              if (this.browser) {
                this.browser.hide();
              }
              console.log("Opened");
            } else if (result.event === "loaded") {
              console.log("Loaded");
            } else if (result.event === "closed") {
              if (this.browser) {
                this.browser.show();
              } else {
                this.back();
              }
              console.log("Closed");
            }
          },
          (e) => {
            this.openInAppBrowser(uri);
            console.error(e);
          }
        );
    }
    // else {
    //   this.openInAppBrowser(uri);
    // }
  }
  private async openInAppBrowser(url: string) {
    if (this.browser) {
      this.browser.close();
      this.subscriptions.forEach((s) => s.unsubscribe());
    }
    const color = "#2596D9";
    this.isSafariAvailable = await this.safariViewController.isAvailable();
    const options: InAppBrowserOptions = {
      usewkwebview: "yes",
      location: "no",
      toolbar: "yes",
      zoom: "no",
      footer: "no",
      beforeload: "yes", // 设置后，beforeload事件才能触发
      closebuttoncaption: "关闭(CLOSE)",
      closebuttoncolor: "#2596D9",
      navigationbuttoncolor: "#2596D9",
      // toolbarcolor:"#2596D90f"
    };
    // url = `http://test.version.testskytrip.com/download/test.html`;
    if (
      url.startsWith("weixin") ||
      url.startsWith("alipays") ||
      this.checkIfAliWechatPay(url)
    ) {
      this.openWechatOrAliApp(url);
    } else {
      if (this.isSafariAvailable) {
        this.subscriptions.push(
          this.safariViewController.show({ url, hidden: true }).subscribe()
        );
      }
      this.browser = this.iab.create(encodeURI(url), "_blank", options);
      this.addListeners();
    }
  }
  private addListeners() {
    if (this.browser) {
      this.subscriptions.push(
        this.browser.on("beforeload").subscribe(async (evt) => {
          console.log("beforeload", evt.message, evt.data, evt.code, evt.url);
          this.isSafariAvailable = await this.safariViewController
            .isAvailable()
            .catch(() => false);
          if (this.isSafariAvailable) {
            this.subscriptions.push(
              this.safariViewController
                .show({ url: evt.url, hidden: true })
                .subscribe()
            );
          }
          if (evt.url) {
            const toUrl = evt.url.toLowerCase();
            if (
              toUrl.startsWith("weixin") ||
              toUrl.startsWith("wechat") ||
              toUrl.startsWith("alipays") ||
              this.checkIfAliWechatPay(toUrl)
            ) {
              // 微信或者支付宝支付
              this.openWechatOrAliApp(toUrl);
              return;
            }
            if (toUrl.includes("sharetrips")) {
              AppHelper.isWXAppInstalled().then(async (installed) => {
                if (installed) {
                  this.shareWebPage(evt.url);
                } else {
                  this.clipboard.clear();
                  await this.clipboard.copy(evt.url);
                  this.browser.hide();
                  await AppHelper.toast(
                    "行程链接已拷贝到剪切板",
                    1400,
                    "middle"
                  );
                  this.browser.show();
                }
              });
            } else {
              if (!toUrl.includes("tel:")) {
                // Load this URL in the inAppBrowser.
                this.browser._loadAfterBeforeload(evt.url);
              } else {
                this.callNumber(evt.url);
              }
            }
          } else {
            console.log("无法加载url");
          }
        })
      );
      this.subscriptions.push(
        this.browser.on("loaderror").subscribe((evt) => {
          console.log("loaderror");
          console.log(evt);
          console.log("loaderror", evt);
          console.log("loaderror", evt.message, evt.data, evt.code, evt.url);
        })
      );
      this.subscriptions.push(
        this.browser.on("loadstart").subscribe((evt) => {
          // if (this.browser) {
          //   this.browser.show();
          // }
          console.log("loadstart");
          console.log(evt);
          console.log("loadstart", evt);
          console.log("loadstart", evt.message, evt.data, evt.code, evt.url);
          if (evt.url) {
            this.callNumber(evt.url);
          }
        })
      );
      this.subscriptions.push(
        this.browser.on("loadstop").subscribe((evt) => {
          console.log("loadstop");
          console.log(evt);
          console.log("loadstop", evt);
          console.log("loadstop", evt.message, evt.data, evt.code, evt.url);
        })
      );
      this.subscriptions.push(
        this.browser.on("message").subscribe((evt) => {
          console.log("message");
          console.log(evt);
          console.log("message", evt);
          console.log("message", evt.message, evt.data, evt.code, evt.url);
        })
      );
      const sub = this.browser.on("exit").subscribe(() => {
        setTimeout(() => {
          if (sub) {
            sub.unsubscribe();
          }
          this.closeBrowser();
          this.backBtn.popToPrePage();
        }, 100);
      });
    }
  }
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
  private async openWechatOrAliApp(uri: string) {
    this.payUrl = uri;
    // https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx0515512304565038c0d556b61957171400&package=1739803123&redirect_url=https%3A%2F%2Fopen.es.xiaojukeji.com%2Fwebapp%2FfeESWebapp%2FpaymentCompleted&redirect_url=https%3A%2F%2Fopen.es.xiaojukeji.com%2Fwebapp%2FfeESWebapp%2FpaymentCompleted
    if (uri.includes("mclient.alipay.com")) {
      // ios 打开支付宝支付
      // if (this.browser) {
      // https://mclient.alipay.com/home/exterfaceassign.htm?_input_charset=utf-8&subject=%e6%bb%b4%e6%bb%b4%e5%bf%ab%e8%bd%a6-%e4%b9%94%e5%b8%88%e5%82%85&sign=bviqyjizkf1n%2f95zp2e24dluzqy1q%2blz8l3dsidfry3ei5%2ffat84z8nxlk8ksxoqiq6ztjirerzeauqxu19xudm1j1ui1iex%2bj%2fvood9fb%2btd5rlze42%2b0dxrb0trkbkonozq0efz%2b471oxmh2cotnrohlh%2foh54fr39pa4akfo%3d&body=%e6%bb%b4%e6%bb%b4%e5%bf%ab%e8%bd%a6-%e4%b9%94%e5%b8%88%e5%82%85&notify_url=http%3a%2f%2fpay.diditaxi.com.cn%2fshield%2falipay%2fnotifypay&alipay_exterface_invoke_assign_model=cashier&alipay_exterface_invoke_assign_target=mapi_direct_trade.htm&payment_type=1&out_trade_no=233_202008056832823201616503&partner=2088021541607785&alipay_exterface_invoke_assign_sign=_p841%2f_srlaa%2b%2ba4b_y_ht_w_fh_e7lv%2fx_m8_b_x_up_bx_g_d_mz_c_x_j3bhpz_uo%2b1w4_a%3d%3d&service=alipay.wap.create.direct.pay.by.user&total_fee=3.0&return_url=https%3a%2f%2fopen.es.xiaojukeji.com%2fwebapp%2ffeeswebapp%2fpaymentcompleted&sign_type=rsa&seller_id=2088021541607785&alipay_exterface_invoke_assign_client_ip=117.136.8.145
      // await AppHelper.alipayH5PayWebUrl(uri);
      // setTimeout(() => {
      // }, 5000);
      // this.browser._loadAfterBeforeload(uri);
      // }
    }
    if (uri.startsWith("weixin")) {
      if (!(await AppHelper.isWXAppInstalled())) {
        AppHelper.alert("尚未安装微信，请继续使用h5完成支付");
        return;
      }
    }
    if (uri.startsWith("alipays")) {
      if (!(await AppHelper.isAliPayAppInstalled())) {
        AppHelper.alert("尚未安装支付宝，请继续使用h5完成支付");
        return;
      }
    }
    const ok = await this.safariViewController
      .isAvailable()
      .catch((e) => false);
    if (ok) {
      this.subscriptions.push(
        this.safariViewController
          .show({ url: this.entryUrl, hidden: true })
          .subscribe(
            (evt) => {
              if (evt.event == "loaded") {
                this.openInSafari(uri);
              }
            },
            () => {
              this.openInSafari(uri);
            }
          )
      );
    } else {
      this.openInSystemBrowser(uri);
    }
  }
  private async openInSystemBrowser(uri: string) {
    if (this.openSystemBrowser) {
      this.openSystemBrowser.close();
    }
    const encodedUri = encodeURI(uri);
    console.log("要打开的uri", uri);
    console.log("打开的uri地址 encoded", encodeURI(uri));
    // window.opener = 'https://open.es.xiaojukeji.com';
    if (this.browser) {
      this.browser.executeScript({ code: `alert(document.referrer)` });
    }

    window.open(uri, "_system");

    // this.openSystemBrowser = this.iab.create(uri);

    // this.openSystemBrowser.hide();
    // window.open(uri,"_blank");
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
  private browserExecuteJs(js: string) {
    if (this.browser) {
      const browser = this.iab.create("", "_system");
      browser.hide();
      browser.executeScript({ code: js });
    }
  }
  ngOnInit() {
    this.subscriptions.push(
      this.shareWebUrl$.subscribe((url) => {
        this.shareWebPage(url);
      })
    );
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((q) => {
        if (this.openSystemBrowser) {
          this.openSystemBrowser.close();
        }
        if (this.payUrl) {
          window.open(this.payUrl);
          this.payUrl = "";
        }
      })
    );
    if (AppHelper.isApp()) {
      this.subscriptions.push(
        this.route.queryParamMap.subscribe(async (q) => {
          this.isSafariAvailable = await this.safariViewController
            .isAvailable()
            .catch((e) => false);
          this.entryUrl = q.get("url");
          if (q.get("url")) {
            if (this.isSafariAvailable) {
              this.openInSafari(q.get("url"));
            } else {
              this.openInAppBrowser(q.get("url"));
            }
          } else if (
            AppHelper.getQueryParamers()["path"] &&
            AppHelper.getQueryParamers()["path"].includes("rental-car")
          ) {
            const url = AppHelper.getQueryParamers()["url"];
            if (url) {
              if (this.isSafariAvailable) {
                this.openInSafari(url);
              } else {
                this.openInAppBrowser(url);
              }
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
