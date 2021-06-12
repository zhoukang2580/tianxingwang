import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import {
  LoadingController,
  NavController,
  Platform,
  IonContent,
} from "@ionic/angular";
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
  NgZone,
  EventEmitter,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {
  InAppBrowserObject,
  InAppBrowser,
  InAppBrowserOptions,
} from "@ionic-native/in-app-browser/ngx";
import { AppHelper } from "src/app/appHelper";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { map, tap } from "rxjs/operators";
import { FileHelperService } from "src/app/services/file-helper.service";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { SwiperSlidesComponent } from "src/app/components/swiper-slides/swiper-slides.component";
import { DownloadFileComponent } from "../components/download-file/download-file.component";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { ImgControlComponent } from "src/app/components/img-control/img-control.component";
import { Keyboard } from "@ionic-native/keyboard/ngx";
import { OpenUrlComponent } from "../components/open-url-comp/open-url.component";

@Component({
  selector: "app-open-url",
  templateUrl: "./open-url.page.html",
  styleUrls: ["./open-url.page.scss"],
  providers: [InAppBrowser],
})
export class OpenUrlPage
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
  private subscriptions: Subscription[] = [];
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
  @ViewChild("iframe", { static: true }) iframe: ElementRef<HTMLIFrameElement>;
  constructor(
    activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private iab: InAppBrowser,
    private plt: Platform,
    private configService: ConfigService,
    private router: Router,
    private render: Renderer2,
    private fileService: FileHelperService,
    private ngZone: NgZone,
    private keyboard: Keyboard
  ) {
    // this.url$ = new BehaviorSubject(null);
    this.backSource = new BehaviorSubject(false);
    this.isIos = this.plt.is("ios");
    const subscription = activatedRoute.queryParamMap.subscribe((p) => {
      this.keyboard.hideFormAccessoryBar(false);
      OpenUrlPage.isDestroyed = false;
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
      const isIframe = p.get("isIframeOpen");
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
    this.subscriptions.push(subscription);
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
    if (this.isback || OpenUrlPage.isDestroyed) {
      return true;
    }
    this.checkIfCanBack();
    return this.isback;
  }
  async onReload() {
    await AppHelper.dismissModalLayers();
    this.onToggleActionSheet();
    // this.openInIframe(this.appenVersion(this.orgOpenUrl));
    this.reloadPage();
  }
  private reloadPage() {
    console.log("reloadpage", this.appenVersion(this.orgOpenUrl));
    setTimeout(() => {
      if(window["__OpenPageUrlObj"]){
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
      `this.isDestroyed=${OpenUrlPage.isDestroyed},this.isback=${this.isback}`
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
      this.downloadItems.push(obj);
      this.fileService
        .downloadFile(url, name, (r) => {
          this.ngZone.run(()=>{
            const p = r.loaded / r.total;
            // console.log(`文件${name}的进度`, p);
            obj.progress = p.toFixed(2);
            obj.progressPercent = `${(p * 100).toFixed(2)}%`;
            obj.isCompleted = p >= 0.99;
          })
        })
        .then((r) => {
          this.ngZone.run(()=>{
            if (r.hcpUpdateComplete) {
              obj.progress = "1";
              obj.progressPercent = `100%`;
              console.log(r);
              obj.isCompleted = true;
              obj.filePath = r.nativePath;
            }
          })
        });
    }
    this.onShowDonwloadItems();
  }
  private onmessage(evt: MessageEvent) {
    console.log(
      "onmessage",
      evt.data,
      "this.isDestroyed " + OpenUrlPage.isDestroyed
    );
    if (evt.data && evt.data.type) {
      if (evt.data.type == "back") {
        if (this.goPath) {
          this.router.navigate([this.goPath], {
            queryParams: {
              goPathQueryParams: this.goPathQueryParams,
            },
          });
        } else {
          this.isback = evt.data.isBack;
          this.backSource.next(this.isback);
          if (this.isback) {
            if (!OpenUrlPage.isDestroyed) {
              OpenUrlPage.isDestroyed = true;
              this.backButton.popToPrePage();
            }
          }
        }
      } else if (evt.data.type == "openmodal") {
        if (this.isImage(evt.data.url)) {
          this.openImage(evt.data.url);
        } else {
          const isBlank = evt.data.isBlank;
          this.openModal(evt.data.url, isBlank).then(async (m) => {
            if (m) {
              m.present();
              await m.onDidDismiss();
              try {
                if (
                  window["__OpenPageUrlObj"] &&
                  window["__OpenPageUrlObj"].isDorefreshList
                ) {
                  window["__OpenPageUrlObj"].isDorefreshList=false;
                  this.postMessage({
                    type: "doRefreshListFromApp",
                    origin: evt.origin,
                  });
                  // this.reloadPage();
                }
              } catch (e) {
                console.error(e);
              }
            }
          });
        }
      } else if (evt.data.type == "download") {
        // if (this.isImage(evt.data.url)) {
        //   this.openImage(evt.data.url);
        //   return;
        // }
        this.downloadFile(evt.data.url, evt.data.name || evt.data.fileName);
      } else if ((evt.data.type || "").toLowerCase() == "dorefreshlist") {
        window["__OpenPageUrlObj"] = { isDorefreshList: true };
      }
    }
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
        url: this.getUrl(url),
      },
    });
  }
  ngAfterViewInit() {}
  private showLoading() {
    setTimeout(async () => {
      if (this.iframe) {
        const iframe = this.iframe;
        if (iframe) {
          let isDismiss = false;
          const l = await this.loadingCtrl.create({ message: "请稍候" });
          l.backdropDismiss = true;
          l.present();
          iframe.nativeElement.onload = () => {
            console.log("iframe load");
            if (isDismiss) {
              return;
            }
            isDismiss = true;
            l.dismiss();
          };
          iframe.nativeElement.onerror = (e) => {
            console.error("iframe load error");
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
          }, 2 * 1000);
        }
      }
    }, 200);
  }
  onBack(evt?: CustomEvent) {
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
    this.subscriptions.push(
      AppHelper.getWindowMsgSource().subscribe((evt) => {
        this.onmessage(evt);
      })
    );
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
