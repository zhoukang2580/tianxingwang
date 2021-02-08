import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { LoadingController, NavController, Platform } from "@ionic/angular";
import { Subject, BehaviorSubject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  QueryList,
  ElementRef,
  ViewChildren,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  Renderer2,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {
  InAppBrowserObject,
  InAppBrowser,
  InAppBrowserOptions,
} from "@ionic-native/in-app-browser/ngx";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-open-url",
  templateUrl: "./open-url.page.html",
  styleUrls: ["./open-url.page.scss"],
  providers: [InAppBrowser],
})
export class OpenUrlPage implements OnInit, AfterViewInit, OnDestroy {
  title: string;
  url$: Subject<any>;
  isHideTitle = false;
  isShowFabButton = false;
  isIframeOpen = true;
  vertical = "top";
  horizontal = "start";
  private isOpenInAppBrowser = false;
  private isback = false;
  private goPath = "";
  private goPathQueryParams: any;
  private browser: InAppBrowserObject;
  private subscription = Subscription.EMPTY;
  @ViewChild(BackButtonComponent) backButton: BackButtonComponent;
  @ViewChildren("iframe") iframes: QueryList<ElementRef<HTMLIFrameElement>>;
  constructor(
    activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private iab: InAppBrowser,
    private plt: Platform,
    private router: Router,
    private render: Renderer2
  ) {
    this.url$ = new BehaviorSubject(null);
    this.subscription = activatedRoute.queryParamMap.subscribe((p) => {
      if (p.get("vertical")) {
        this.vertical = p.get("vertical");
      }
      if (p.get("horizontal")) {
        this.horizontal = p.get("horizontal");
      }
      let url = decodeURIComponent(p.get("url"));
      if (url) {
        if (this.plt.is("ios") && !url.includes("isIos")) {
          if (url.includes("?")) {
            url += `&isIos=${true}`;
          } else {
            url += "?isIos=true";
          }
        }
        if (!url.includes("lang")) {
          if (url.includes("?")) {
            url += `&lang=${AppHelper.getLanguage()}`;
          } else {
            url += `?lang=${AppHelper.getLanguage()}`;
          }
        }
      }
      this.goPath = p.get("goPath");
      this.goPathQueryParams = p.get("goPathQueryParams") || "";

      console.log("open url page ", p);
      const isIframe = p.get("isIframeOpen");
      if (isIframe) {
        this.isIframeOpen = isIframe == "true";
      }
      if (url) {
        this.url$.next(this.domSanitizer.bypassSecurityTrustResourceUrl(url));
      }
      if (p.get("isOpenInAppBrowser")) {
        this.isOpenInAppBrowser = p.get("isOpenInAppBrowser") == "true";
        if (this.isOpenInAppBrowser) {
          this.isIframeOpen = false;
          this.openInAppBrowser(url);
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
  onTouchMove(el: HTMLElement, evt: TouchEvent) {
    try {
      if (el) {
        const t = evt.touches[0];
        const h = el.clientHeight / 2;
        const w = el.clientWidth / 2;
        this.render.setStyle(
          el,
          "transform",
          `translate3d(${t.pageX - w}px,${t.pageY - h}px,0)`
        );
      }
      // console.log("evt", evt);
    } catch (e) {
      console.error(e);
    }
  }
  private async openInAppBrowser(url: string) {
    if (this.browser) {
      this.browser.close();
    }
    const color = "#2596D9";
    const options: InAppBrowserOptions = {
      usewkwebview: "yes",
      location: "no",
      toolbar: "yes",
      zoom: "no",
      footer: "no",
      closebuttoncaption: "关闭(CLOSE)",
      closebuttoncolor: "#2596D9",
      navigationbuttoncolor: "#2596D9",
      // toolbarcolor:"#2596D90f"
    };
    this.browser = this.iab.create(encodeURI(url), "_blank", options);
    const sub = this.browser.on("exit").subscribe(() => {
      console.log("browser exit");
      setTimeout(() => {
        if (sub) {
          sub.unsubscribe();
        }
      }, 100);
      this.backButton.popToPrePage();
    });
    this.backButton.popToPrePage();
  }
  private onMessage(evt: MessageEvent) {
    if (evt.data && evt.data.message) {
      if (evt.data.message == "back") {
        if (this.goPath) {
          this.router.navigate([this.goPath], {
            queryParams: {
              goPathQueryParams: this.goPathQueryParams,
            },
          });
        } else {
          if (!this.isback) {
            this.onBack();
          }
        }
      }
    }
  }

  ngAfterViewInit() {
    window.addEventListener("message", this.onMessage.bind(this));
    setTimeout(async () => {
      if (this.iframes) {
        const iframe = this.iframes.first;
        if (iframe) {
          let isDismiss = false;
          const l = await this.loadingCtrl.create({ message: "请稍候" });
          l.backdropDismiss = true;
          l.present();
          iframe.nativeElement.onload = () => {
            if (isDismiss) {
              return;
            }
            isDismiss = true;
            l.dismiss();
          };
          iframe.nativeElement.onerror = () => {
            if (isDismiss) {
              return;
            }
            isDismiss = true;
            l.dismiss();
          };
          setTimeout(() => {
            if (!isDismiss) {
              isDismiss = true;
              l.dismiss();
            }
          }, 2000);
        }
      }
    }, 200);
  }
  onBack(evt?: CustomEvent) {
    if (this.backButton) {
      this.isback = true;
      this.backButton.popToPrePage();
    }
  }
  ngOnInit() {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
    window.removeEventListener("message", this.onMessage.bind(this));
  }
}
