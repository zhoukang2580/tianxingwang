import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { ApiService } from "../../services/api/api.service";
import { NavController, Platform } from "@ionic/angular";
import { IdentityEntity } from "../../services/identity/identity.entity";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { IdentityService } from "src/app/services/identity/identity.service";
import { LanguageHelper } from "src/app/languageHelper";
import { Subscription } from "rxjs";

import { AppHelper } from "src/app/appHelper";
import { HttpClient } from "@angular/common/http";
import { map, switchMap, finalize } from "rxjs/operators";
import { RequestEntity } from "src/app/services/api/Request.entity";
import {
  InAppBrowser,
  InAppBrowserObject,
  InAppBrowserOptions
} from "@ionic-native/in-app-browser/ngx";
import { QrScanService } from "src/app/services/qrScan/qrscan.service";

@Component({
  selector: "app-scan-result",
  templateUrl: "./scan-result.page.html",
  styleUrls: ["./scan-result.page.scss"],
  providers: [InAppBrowser]
})
export class ScanResultPage implements OnInit, OnDestroy {
  private _iframeSrc: any;
  private subscription = Subscription.EMPTY;
  private scanResultSubscription = Subscription.EMPTY;
  private identitySubscription = Subscription.EMPTY;
  private browser: InAppBrowserObject;
  @ViewChild(BackButtonComponent) backButton: BackButtonComponent;
  confirmText: string = LanguageHelper.getConfirmTip();
  cancelText: string = LanguageHelper.getCancelTip();
  description: string;
  result: string;
  isShowConfirm = false;
  isShowIframe = false; // 是否用iframe打开
  isShowText = false; // 是否显示扫码文本
  identity: IdentityEntity;
  defaultImage = AppHelper.getDefaultAvatar();
  Model: {
    Name: string;
    RealName: string;
    Mobile: string;
    HeadUrl: string;
  };
  get iframeSrc() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this._iframeSrc);
  }
  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private identityService: IdentityService,
    private http: HttpClient,
    activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    qrScanService: QrScanService,
    private iab: InAppBrowser,
    private plt: Platform
  ) {
    this.subscription = activatedRoute.queryParamMap.subscribe(p => {
      this.scan(p.get("scanResult"));
    });
    if (AppHelper.isApp()) {
      this.scanResultSubscription = qrScanService
        .getScanResultSource()
        .subscribe(txt => {
          this.result = txt;
        });
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.identitySubscription.unsubscribe();
    this.scanResultSubscription.unsubscribe();
  }
  back() {
    this.backButton.backToPrePage();
  }
  ngOnInit() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(r => {
        this.identity = r;
      });
  }
  private showIframePage(src: string) {
    this._iframeSrc = src;
    this.isShowIframe = true;
  }
  private openInAppBrowser(url: string) {
    if (!AppHelper.isApp()) {
      return;
    }
    if (this.browser) {
      this.browser.close();
    }
    const color = "#2596D9";
    const options: InAppBrowserOptions = {
      usewkwebview: "yes",
      location: "no",
      toolbar: this.plt.is("ios") ? "yes" : "no",
      zoom: "no",
      footer: "no",
      closebuttoncaption: "关闭(CLOSE)",
      closebuttoncolor: "#2596D9",
      navigationbuttoncolor: "#2596D9"
      // toolbarcolor:"#2596D90f"
    };
    this.browser = this.iab.create(encodeURI(url), "_blank", options);
    const sub = this.browser.on("exit").subscribe(() => {
      setTimeout(() => {
        if (sub) {
          sub.unsubscribe();
        }
      }, 100);
      this.back();
    });
  }
  private hideIframePage() {
    this.isShowIframe = false;
    this._iframeSrc = null;
  }
  private showTextPage() {
    if (this.result) {
      this.isShowText = true;
    } else {
      this.onCancel();
    }
  }
  private hideResultTextPage() {
    this.isShowText = false;
  }
  private showConfirmPage() {
    this.isShowConfirm = true;
  }
  private hideConfirmPage() {
    this.isShowConfirm = false;
  }

  onConfirm() {
    this.handle();
  }
  onCancel() {
    this.close();
  }
  private scan(r: any) {
    this.result = r;
    if (this.checkLogin()) {
      this.load();
      this.showConfirmPage();
    } else {
      this.handle();
    }
  }
  private async load() {
    const req = new RequestEntity();
    req.Method = "ApiMemberUrl-Home-Get";
    this.Model = await this.apiService
      .getPromiseData<{
        Name: string;
        RealName: string;
        Mobile: string;
        HeadUrl: string;
      }>(req)
      .catch(_ => null);
  }
  private checkUrl() {
    return (
      this.result &&
      (this.result.toLowerCase().startsWith("http://") ||
        this.result.toLowerCase().startsWith("https://"))
    );
  }
  checkLogin() {
    return (
      this.checkUrl() &&
      this.result.toLowerCase().includes("/home/setidentity?key=")
    );
  }
  private handle() {
    if (this.checkLogin()) {
      if (this.identity) {
        this.apiService.showLoadingView({ msg: "正在授权登陆" });
        const subscribtion = this.http
          .get(
            this.result +
            "&ticket=" +
            this.identity.Ticket +
            "&datatype=json&x-requested-with=XMLHttpRequest"
          )
          .pipe(
            finalize(() => {
              setTimeout(() => {
                this.apiService.hideLoadingView();
              }, 200);
            })
          )
          .subscribe(
            async (s: any) => {
              this.identity.WebTicket = s.TicketId;
              this.identityService.setIdentity(this.identity);
              await AppHelper.toast(`登录成功!`, 1400, "middle").catch(_ => 0);
              this.close();
            },
            e => {
              AppHelper.alert(e || "登陆失败");
            },
            () => {
              setTimeout(() => {
                if (subscribtion) {
                  subscribtion.unsubscribe();
                }
              }, 10);
            }
          );
      }
    } else if (this.checkUrl()) {
      if (this.result && this.result.toLowerCase().includes("app_path")) {
        this.openAppPath(this.result);
        return;
      }
      if (AppHelper.isApp()) {
        return this.openInAppBrowser(this.result);
      }
      this.showIframePage(this.result);
    } else {
      this.showTextPage();
    }
  }
  private close() {
    this.hideConfirmPage();
    this.hideIframePage();
    this.hideResultTextPage();
    this.back();
  }
  private openAppPath(url: string) {
    const query = {};
    try {
      url = url.includes("?") ? url.substring(url.indexOf("?") + 1) : url;
      if (/[&|=]/.test(url)) {
        const arr = url.split("&");
        if (arr.length) {
          for (const item of arr) {
            if (item.includes("=")) {
              const [key, value] = item.split("=");
              if (key) {
                query[key] = decodeURIComponent(value);
                query[key.toLowerCase()] = decodeURIComponent(value);
              }
            }
          }
        }
      }
      const path = AppHelper.getValueFromQueryString("app_path", this.result);
      this.result = "";
      this.router.navigate([AppHelper.getRoutePath(path)], {
        queryParamsHandling: "merge",
        queryParams: {
          ...query
        }
      });
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}
