import { IdentityEntity } from "./../../services/identity/identity.entity";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { IdentityService } from "src/app/services/identity/identity.service";
import { LanguageHelper } from "src/app/languageHelper";
import { Subscription } from "rxjs";

import { AppHelper } from "src/app/appHelper";
import { HttpClient } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: "app-scan",
  templateUrl: "./scan.page.html",
  styleUrls: ["./scan.page.scss"]
})
export class ScanPage implements OnInit, OnDestroy {
  confirmText: string = LanguageHelper.getConfirmTip();
  cancelText: string = LanguageHelper.getCancelTip();
  description: string;
  result: string;
  isShowConfirm = false;
  isShowIframe = false; // 是否用iframe打开
  isShowText = false; // 是否显示扫码文本
  identity: IdentityEntity;
  private _iframeSrc: any;
  subscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  get iframeSrc() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this._iframeSrc);
  }
  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private identityService: IdentityService,
    private http: HttpClient,
    activatedRoute: ActivatedRoute
  ) {
    this.subscription = activatedRoute.paramMap.subscribe(p => {
      this.scan(p.get("scanResult"));
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.identitySubscription.unsubscribe();
  }
  ngOnInit() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(r => {
        this.identity = r;
      });
  }
  showIframePage(src: string) {
    this._iframeSrc = src;
    this.isShowIframe = true;
  }
  hideIframePage() {
    this.isShowIframe = false;
    this._iframeSrc = null;
  }
  showTextPage() {
    this.isShowText = true;
  }
  hideResultTextPage() {
    this.isShowText = false;
  }
  showConfirmPage() {
    this.isShowConfirm = true;
  }
  hideConfirmPage() {
    this.isShowConfirm = false;
  }

  onConfirm() {
    this.handle();
  }
  onCancel() {
    this.close();
  }
  scan(r: any) {
    this.result = r;

    if (this.checkLogin()) {
      this.showConfirmPage();
    } else {
      this.handle();
    }
  }
  checkUrl() {
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
  checkInvitation() {
    return (
      this.checkUrl() &&
      this.result.toLowerCase().includes("/www/index.html?path=hr-invitation")
    );
  }
  handle() {
    if (this.checkLogin()) {
      if (this.identity) {
        const subscribtion = this.http
          .get(
            this.result + "&ticket=" + this.identity.Ticket + "&datatype=json"
          )
          .subscribe(
            (s: any) => {
              this.identity.WebTicket = s.TicketId;
              this.close();
            },
            e => {
              AppHelper.alert(e);
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
    } else if (this.checkInvitation()) {
      this.router.navigate([AppHelper.getRoutePath("hr-invitation")]);
    } else if (this.checkUrl()) {
      this.showIframePage(this.result);
    } else {
      this.showTextPage();
    }
  }
  close() {
    this.hideConfirmPage();
    this.hideIframePage();
    this.hideResultTextPage();
    window.history.back();
  }
}
