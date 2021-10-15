import {
  LoadingController,
  NavController,
  Platform,
  IonContent,
} from "@ionic/angular";
import { BehaviorSubject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  Renderer2,
  NgZone,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {
  InAppBrowserObject,
  InAppBrowser,
  InAppBrowserOptions,
} from "@ionic-native/in-app-browser/ngx";
import { AppHelper } from "src/app/appHelper";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { FileHelperService } from "src/app/services/file-helper.service";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { ImgControlComponent } from "src/app/components/img-control/img-control.component";
import { Keyboard } from "@ionic-native/keyboard/ngx";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { DownloadFileComponent } from "../download-file/download-file.component";

@Component({
  selector: "app-open-url",
  templateUrl: "./open-url.component.html",
  styleUrls: ["./open-url.component.scss"],
  providers: [InAppBrowser],
})
export class OpenUrlComponent
  implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate
{
  title: string;
  // url$: Subject<any>;
  url: any;
  isHideTitle = false;
  isShowFabButton = false;
  isOpenActionSheet = false;
  vertical = "top";
  horizontal = "start";
  isOpenAsModal = false;
  isIos = false;
  private isOpenInAppBrowser = false;
  private isback = false;
  private goPath = "";
  private goPathQueryParams: any;
  private browser: InAppBrowserObject;
  private subscription = Subscription.EMPTY;
  private backSource: BehaviorSubject<boolean>;
  private config: ConfigEntity;
  private orgOpenUrl;
  private static isDestroyed = false;
  downloadItems: {
    url: string;
    name: string;
    fileName: string;
    progress?: string;
    filePath?: string;
    isCompleted?: boolean;
  }[] = [];
  @ViewChild(BackButtonComponent) backButton: BackButtonComponent;
  @ViewChild(IonContent, { static: true }) cnt: IonContent;
  @ViewChild("iframe", { static: true }) iframe: ElementRef<HTMLIFrameElement>;
  constructor(
    activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private iab: InAppBrowser,
    private plt: Platform,
    private configService: ConfigService,
    private router: Router,
    private fileService: FileHelperService,
    private ngZone: NgZone,
    private keyboard: Keyboard
  ) {
    // this.url$ = new BehaviorSubject(null);
    this.backSource = new BehaviorSubject(false);
    this.isIos = this.plt.is("ios");
    this.subscription = activatedRoute.queryParamMap.subscribe((p) => {
      this.keyboard.hideFormAccessoryBar(false);
      OpenUrlComponent.isDestroyed = false;
      if (p.get("vertical")) {
        this.vertical = p.get("vertical");
      }
      if (p.get("horizontal")) {
        this.horizontal = p.get("horizontal");
      }
      const url = this.getUrl(p.get("url"));
      this.orgOpenUrl = url;
      this.goPath = p.get("goPath");
      this.goPathQueryParams = p.get("goPathQueryParams") || "";
      console.log("open url page ", p);
      // if (isIframe) {
      //   this.isIframeOpen = isIframe == "true";
      // }
      this.configService.getConfigAsync().then((c) => {
        this.config = c;
      });
      if (p.get("isOpenInAppBrowser")) {
        this.isOpenInAppBrowser = p.get("isOpenInAppBrowser") == "true";
        if (this.isOpenInAppBrowser) {
          // this.isIframeOpen = false;
          this.openInAppBrowser(url);
        } else {
          this.openInIframe(url);
        }
      } else {
        this.openInIframe(url);
      }
      if (p.get("title")) {
        this.title = p.get("title");
      }
      const h = p.get("isHideTitle");
      this.isShowFabButton = p.get("isShowFabButton") == "true";
      this.isHideTitle = h == "true";
    });
  }
  private getUrl(url: string) {
    url = decodeURIComponent(url);
    if (url) {
      if (!url.includes("opentype=iframe")) {
        if (url.includes("?")) {
          url = `${url}&opentype=iframe`;
        } else {
          url = `${url}?opentype=iframe`;
        }
      }
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
    return url;
  }
  onToggleActionSheet() {
    this.isOpenActionSheet = !this.isOpenActionSheet;
  }
  private openInIframe(url: string) {
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.getUrl(url)
    );
  }
  onMockBack() {
    // this.backButton.back();
    this.checkIfCanBack();
  }
  private async openInAppBrowser(url: string) {
    if (this.browser) {
      this.browser.close();
    }
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
      setTimeout(() => {
        this.backButton.popToPrePage();
      }, 200);
    });
  }
  canDeactivate() {
    console.log(
      `canDeactivate isOpenAsModal=${this.isOpenAsModal}, isback=${this.isback}`
    );
    if (this.isOpenActionSheet) {
      this.onToggleActionSheet();
      return false;
    }
    if (this.isOpenAsModal) {
      return this.closeModal();
    }
    if (this.isback || OpenUrlComponent.isDestroyed) {
      return true;
    }
    this.checkIfCanBack();
    return this.isback;
  }
  async onReload() {
    if (!this.isOpenAsModal) {
      await AppHelper.dismissModalLayers();
    }
    this.onToggleActionSheet();
    // this.openInIframe(this.appenVersion(this.orgOpenUrl));
    this.reloadPage();
  }
  private reloadPage() {
    console.log("reloadpage", this.appenVersion(this.orgOpenUrl));
    setTimeout(() => {
      if (window["__OpenPageUrlObj"]) {
        window["__OpenPageUrlObj"].isDorefreshList = false;
      }
      this.openInIframe(this.appenVersion(this.orgOpenUrl));
    }, 200);
  }
  private appenVersion(url: string) {
    if (url) {
      if (!url.includes("v_v=")) {
        if (url.includes("?")) {
          url = `${url}&v_v=${Date.now()}`;
        } else {
          url = `${url}?v_v=${Date.now()}`;
        }
      }
    }
    return url;
  }
  private closeModal() {
    return AppHelper.modalController
      .getTop()
      .then((m) => {
        if (m) {
          m.dismiss();
        }
        return true;
      })
      .catch(() => true);
  }
  private checkIfCanBack() {
    console.log(
      "checkIfCanBack",
      `this.isDestroyed=${OpenUrlComponent.isDestroyed},this.isback=${this.isback}`
    );
    this.iframe.nativeElement.contentWindow.postMessage({ type: "back" }, "*");
  }
  onMockDownload() {
    // this.downloadFile(
    //   `http://test.version.testskytrip.com/download/test.pdf`,
    //   `testfile${Math.floor(Math.random() * 1000)}.pdf`
    // );
    this.downloadFile(
      `http://test.doc23.beeant.com/files/documents/2021/03/10/10/23/27/b7c113396cd74ea7935306f4804e8be6_doc23.docx?timestamp=1615414869.73674&contenttype=application/octet-stream&sign=5471fe55ed2483c5309deb00c62522b2`,
      `testfile${Math.floor(Math.random() * 1000)}.docx`
    );
  }
  private getFileNameWithExt(url: string, name: string) {
    url = decodeURIComponent(url);
    let ext;
    try {
      if (!name.includes(".")) {
        if (url) {
          ext = url.split("?")[0].split("/").pop().split(".").pop();
        }
      } else {
        ext = name.split(".").pop();
      }
    } catch (e) {
      console.error(e);
    }
    name = name.split(".")[0];
    return `${name}.${ext}`;
  }
  private downloadFile(url: string, name: string) {
    // if (!AppHelper.isApp()) {
    //   return;
    // }
    name = this.getFileNameWithExt(url, name);
    if (!this.downloadItems.find((t) => t.url == url)) {
      const obj = {
        url,
        name: name,
        fileName: name,
        progress: "0",
        progressPercent: "0",
        filePath: "0",
        isCompleted: false,
      };
      this.ngZone.run(() => {
        this.downloadItems.push(obj);
      });
      this.fileService
        .downloadFile(url, name, (r) => {
          const p = r.loaded / r.total;
          // console.log(`文件${name}的进度`, p);
          obj.progress = p.toFixed(2);
          obj.progressPercent = `${(p * 100).toFixed(2)}%`;
          obj.isCompleted = p >= 0.99;
        })
        .then((r) => {
          if (r.hcpUpdateComplete) {
            obj.progress = "1";
            obj.progressPercent = `100%`;
            console.log(r);
            obj.isCompleted = true;
            obj.filePath = r.nativePath;
          }
        });
    }
    this.onShowDonwloadItems();
  }
  async openImage(src) {
    const m = await AppHelper.modalController.create({
      component: ImgControlComponent,
      componentProps: {
        imageUrls: [
          {
            imageUrl: src,
          },
        ],
        isViewImage: true,
        loadingImage: this.config && this.config.PrerenderImageUrl,
        defaultImage: this.config && this.config.DefaultImageUrl,
      },
    });
    m.present();
  }
  private isImage(url: string) {
    return /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)/i.test(url);
  }
  private async openModal(url, isBlank) {
    if (AppHelper.isApp() && isBlank) {
      AppHelper.jump(this.router, url, {
        isOpenInAppBrowser: true,
      });
      return;
    }
    return AppHelper.modalController.create({
      component: OpenUrlComponent,
      componentProps: {
        isOpenAsModal: true,
        url: this.domSanitizer.bypassSecurityTrustResourceUrl(this.getUrl(url)),
      },
    });
  }
  ngAfterViewInit() {}
  onBack() {
    if (this.isOpenAsModal) {
      this.closeModal();
      return;
    }
    if (this.backButton) {
      this.isback = true;
      this.backButton.popToPrePage();
    }
  }
  async onShowDonwloadItems() {
    const m = await AppHelper.modalController.create({
      component: DownloadFileComponent,
      componentProps: {
        downloadItems: this.downloadItems,
      },
    });
    m.present();
  }
  ngOnInit() {
    if(this.url){
      this.orgOpenUrl=decodeURIComponent(this.url);
    }
    if (this.url && !`${this.url}`.includes("safe")) {
      this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.getUrl(this.url)
      );
    }
  }
  private postMessage(d: { type: string; data?: any; origin?: any }) {
    // console.log("window['openurliframe'].contentWindow",window['openurliframe'])
    if (this.iframe.nativeElement && this.iframe.nativeElement.contentWindow) {
      this.iframe.nativeElement.contentWindow.postMessage(
        {
          type: d.type,
          data: d.data,
        },
        d.origin
      );
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
