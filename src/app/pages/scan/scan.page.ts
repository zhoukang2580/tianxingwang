import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { LanguageHelper } from 'src/app/languageHelper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit, OnDestroy {
  confirmText: string = LanguageHelper.getConfirmTip();
  cancelText: string = LanguageHelper.getCancelTip();
  description: string;
  result: string;
  isShowConfirm = false;
  isShowIframe = false;// 是否用iframe打开
  isShowText = !false;// 是否显示扫码文本
  private _iframeSrc: any;
  subscription = Subscription.EMPTY;
  get iframeSrc() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this._iframeSrc);
  }
  constructor(private sanitizer: DomSanitizer, private identityService: IdentityService, activatedRoute: ActivatedRoute) {
    this.subscription = activatedRoute.paramMap.subscribe(p => {
      this.result = p.get("scanResult");
      this.handle();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    // this.canShow = AppHelper.isApp() || ((AppHelper.isWechatH5() || AppHelper.isWechatMini()));
    this.close();
    setTimeout(() => {
      this.handle();
    }, 100);
  }
  showIframePage(src: string) {
    this._iframeSrc = src;
    alert(this._iframeSrc);
    setTimeout(() => {

      this.isShowIframe = true;
    }, 1000);
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
    this.hideConfirmPage();
  }
  onCancel() {
    this.hideConfirmPage();
    this.hideIframePage();
    this.hideResultTextPage();
  }
  scan(r: any) {
    this.result = r;

    if (this.result && this.result.toLowerCase() && this.result.includes("/home/setidentity?key=")) {
      this.showConfirmPage();
    }
    else {
      this.handle();
    }
  }
  handle() {

    if (this.result && (this.result.toLowerCase().startsWith("http://") || this.result.toLowerCase().startsWith("https://"))) {

      if (this.result.toLowerCase().includes("/home/setidentity?key=")) {

        this.identityService.getIdentity().then(r => {
          this.result = this.result + "&ticket=" + r.Ticket;
          this.showIframePage(this.result);
        }).catch(e => {

        });
      }
      else {
        this.showIframePage(this.result);
      }
    }
    else {
      this.showTextPage();
    }
  }
  close() {
    this.hideConfirmPage();
    this.hideIframePage();
    this.hideResultTextPage();
  }
}
