import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { LoadingController, NavController } from "@ionic/angular";
import { Subject, BehaviorSubject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  QueryList,
  ElementRef,
  ViewChildren,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { InAppBrowserObject, InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: "app-open-url",
  templateUrl: "./open-url.page.html",
  styleUrls: ["./open-url.page.scss"],
  providers: [InAppBrowser]
})
export class OpenUrlPage implements OnInit, AfterViewInit {
  title: string;
  url$: Subject<any>;
  isHideTitle = false;
  isShowFabButton = false;
  isIframeOpen = true;
  private isOpenInAppBrowser = false;
  private browser: InAppBrowserObject;

  @ViewChild(BackButtonComponent) backButton: BackButtonComponent;
  @ViewChildren("iframe") iframes: QueryList<ElementRef<HTMLIFrameElement>>;
  constructor(
    activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private iab: InAppBrowser
  ) {
    this.url$ = new BehaviorSubject(null);
    activatedRoute.queryParamMap.subscribe(p => {
      console.log("open url page ", p);
      const isIframe = p.get("isIframeOpen");
      if (isIframe) {
        this.isIframeOpen = isIframe == "true";
      }
      if (p.get("url")) {
        this.url$.next(
          this.domSanitizer.bypassSecurityTrustResourceUrl(p.get("url"))
        );
      }
      if (p.get("isOpenInAppBrowser")) {
        this.isOpenInAppBrowser = p.get("isOpenInAppBrowser") == 'true';
        if (this.isOpenInAppBrowser) {
          this.isIframeOpen = false;
          this.openInAppBrowser(p.get("url"));
        }
      }
      if (p.get("title")) {
        this.title = p.get("title");
      }
      const h = p.get("isHideTitle");
      this.isShowFabButton = p.get("isShowFabButton") == "true";
      this.isHideTitle = h == "true";

    });
  }
  private openInAppBrowser(url: string) {
    if (this.browser) {
      this.browser.close();
    }
    const options:InAppBrowserOptions={
      usewkwebview:"yes",
      location:'no',
      toolbar:"yes",
      zoom:"no",
      footer:"yes"
    }
    this.browser = this.iab.create(encodeURI(url), "_blank",options);
    const sub = this.browser.on("exit").subscribe(() => {
      setTimeout(() => {
        if(sub){
          sub.unsubscribe();
        }
      }, 100);
      this.backButton.backToPrePage();
    })
  }
  ngAfterViewInit() {
    if (this.iframes) {
      this.iframes.changes.subscribe(async _ => {
        const iframe = this.iframes.first;
        if (iframe) {
          const l = await this.loadingCtrl.create({ message: "请稍后..." });
          l.backdropDismiss = true;
          l.present();
          iframe.nativeElement.onload = _ => {
            l.dismiss();
          };
        }
      });
    }
  }
  onBack(evt: CustomEvent) {
    if (this.backButton) {
      this.backButton.backToPrePage();
    }
  }
  ngOnInit() { }
}
