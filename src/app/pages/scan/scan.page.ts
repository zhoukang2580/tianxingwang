import { ApiService } from './../../services/api/api.service';
import { NavController } from '@ionic/angular';
import { IdentityEntity } from "./../../services/identity/identity.entity";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { IdentityService } from "src/app/services/identity/identity.service";
import { LanguageHelper } from "src/app/languageHelper";
import { Subscription } from "rxjs";

import { AppHelper } from "src/app/appHelper";
import { HttpClient } from "@angular/common/http";
import { map, switchMap, finalize } from "rxjs/operators";
import { RequestEntity } from 'src/app/services/api/Request.entity';

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
  defaultImage = AppHelper.getDefaultAvatar();
  Model: {
    Name: string;
    RealName: string;
    Mobile: string;
    HeadUrl: string;
  }
  get iframeSrc() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this._iframeSrc);
  }
  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private identityService: IdentityService,
    private http: HttpClient,
    activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private apiService: ApiService
  ) {
    this.subscription = activatedRoute.paramMap.subscribe(p => {
      this.scan(p.get("scanResult"));
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.identitySubscription.unsubscribe();
  }
  back() {
    this.navCtrl.pop();
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
  private hideIframePage() {
    this.isShowIframe = false;
    this._iframeSrc = null;
  }
  private showTextPage() {
    this.isShowText = true;
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
    this.Model = await this.apiService.getPromiseData<{
      Name: string;
      RealName: string;
      Mobile: string;
      HeadUrl: string;
    }>(req).catch(_ => null);
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
  private checkInvitation() {
    return (
      this.checkUrl() &&
      this.result.toLowerCase().includes("/www/index.html?path=hr-invitation")
    );
  }
  private handle() {
    if (this.checkLogin()) {
      if (this.identity) {
        this.apiService.showLoadingView();
        const subscribtion = this.http
          .get(
            this.result + "&ticket=" + this.identity.Ticket + "&datatype=json&x-requested-with=XMLHttpRequest"
          )
          .pipe(finalize(() => {
            setTimeout(() => {
              this.apiService.showLoadingView();
            }, 200);
          }))
          .subscribe(
            async (s: any) => {
              this.identity.WebTicket = s.TicketId;
              this.identityService.setIdentity(this.identity);
              await AppHelper.toast(`登录成功!`, 1400, 'middle');
              setTimeout(() => {
                this.close();
              }, 1400);
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
  private close() {
    this.hideConfirmPage();
    this.hideIframePage();
    this.hideResultTextPage();
    this.back();
  }
}
