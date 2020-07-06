import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";
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
import { map, tap } from "rxjs/operators";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";

import {
  InAppBrowser,
  InAppBrowserObject,
  InAppBrowserOptions,
} from "@ionic-native/in-app-browser/ngx";
import { CallNumber } from "@ionic-native/call-number/ngx";
import { Clipboard } from "@ionic-native/clipboard/ngx";
import { WechatHelper } from "src/app/wechatHelper";

@Component({
  selector: "app-open-rental-car",
  templateUrl: "./open-rental-car.page.html",
  styleUrls: ["./open-rental-car.page.scss"],
})
export class OpenRentalCarPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private browser: InAppBrowserObject;
  isApp = AppHelper.isApp();
  url$: Observable<string>;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private iab: InAppBrowser,
    private clipboard: Clipboard,
    private callNumber: CallNumber
  ) {}
  ngOnDestroy() {
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
  private openInAppBrowser(url: string) {
    if (this.browser) {
      this.browser.close();
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    const color = "#2596D9";
    const options: InAppBrowserOptions = {
      usewkwebview: "yes",
      location: this.isIphoneX() ? "yes" : "no",
      toolbar: "yes",
      zoom: "no",
      footer: "no",
      // beforeload: "yes", // 设置后，beforeload事件才能触发
      closebuttoncaption: "关闭(CLOSE)",
      closebuttoncolor: "#2596D9",
      navigationbuttoncolor: "#2596D9",
      // toolbarcolor:"#2596D90f"
    };
    // url = `http://test.version.testskytrip.com/download/test.html`;
    this.browser = this.iab.create(encodeURI(url), "_blank", options);
    // this.subscriptions.push(this.browser.on("beforeload").subscribe((evt,callback)=>{
    //   console.log("beforeload");
    //   console.log(evt);
    //   console.log("beforeload",evt);
    //   console.log("beforeload",evt.message,evt.data,evt.code,evt.url);
    //   if(evt.url){
    //     // Load this URL in the inAppBrowser.
    //     callback(evt.url);
    //   }else{
    //     console.log("无法加载url");
    //   }
    // }))
    this.subscriptions.push(
      this.browser.on("loaderror").subscribe((evt) => {
        console.log("loaderror");
        console.log(evt);
        console.log("loaderror", evt);
        console.log("loaderror", evt.message, evt.data, evt.code, evt.url);
      })
    );
    this.subscriptions.push(
      this.browser.on("loadstart").subscribe(async (evt) => {
        // if (this.browser) {
        //   this.browser.show();
        // }
        console.log("loadstart");
        console.log(evt);
        console.log("loadstart", evt);
        console.log("loadstart", evt.message, evt.data, evt.code, evt.url);
        if (evt.url) {
          if (evt.url.toLowerCase().includes("sharetrips")) {
            this.clipboard.clear();
            this.clipboard.copy(evt.url);
            if (!(await AppHelper.isWXAppInstalled())) {
              AppHelper.toast("链接已经拷贝到剪切板", 1400, "middle");
            } else {
              await WechatHelper.shareWebpage({
                webTitle: "分享行程",
                webDescription: "行程分享",
                webpageUrl: evt.url,
              });
            }
            // this.clipboard.paste().then(
            //   (resolve: string) => {
            //     alert(resolve);
            //   },
            //   (reject: string) => {
            //     alert("Error: " + reject);
            //   }
            // );
          }
          const m = evt.url.match(/tel:(\d+)/i);
          if (m && m.length >= 2) {
            const phoneNumber = m[1];
            console.log("phoneNumber" + phoneNumber);
            if (phoneNumber) {
              // window.location.href=`tel:${phoneNumber}`;
              this.callNumber
                .callNumber(phoneNumber, true)
                .then((res) => console.log("Launched dialer!", res))
                .catch((err) => console.log("Error launching dialer", err));
            }
          }
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
        if (this.browser) {
          this.browser.close();
        }
        this.backBtn.popToPrePage();
      }, 100);
    });
  }
  ngOnInit() {
    if (AppHelper.isApp()) {
      this.subscriptions.push(
        this.route.queryParamMap.subscribe((q) => {
          if (q.get("url")) {
            this.openInAppBrowser(q.get("url"));
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
