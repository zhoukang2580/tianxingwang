import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { QrScanService } from "src/app/services/qrScan/qrscan.service";
import { Subject, Subscription } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { CONFIG } from "src/app/config";
import { ApiService } from "src/app/services/api/api.service";
import { WechatHelper } from "src/app/wechatHelper";
import Swiper from "swiper";
import { ConfigService } from 'src/app/services/config/config.service';
import { ConfigEntity } from 'src/app/services/config/config.entity';
@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {
  identity: IdentityEntity;
  scanresult: string;
  homeUrl: any;
  isWechatMini = AppHelper.isWechatMini();
  @ViewChild("container", { static: true }) containerEl: ElementRef<
    HTMLElement
  >;
  private subscriptions: Subscription[] = [];
  private timeId: any;
  private count = 10;
  private swiper: any;
  private options: any;
  private isLoginByUser = false;
  isScanning = false;
  isLoadingBanners = false;
  banners: { ImageUrl: string; Title?: string; Id?: string }[];
  config: ConfigEntity;
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private scanService: QrScanService,
    private domSanitize: DomSanitizer,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) { }
  private goHome() {
    if (!this.identity || !this.identity.Ticket) {
      if (this.isLoginByUser) {
        return this.router.navigate([AppHelper.getRoutePath("login")]);
      }
    }
    this.router.navigate([AppHelper.getRoutePath("tabs/tmc-home")]);
  }
  ngAfterViewInit() {
    this.updateSwiper();
  }
  private async hasTicket() {
    this.identity = await this.identityService.getIdentityAsync();
    return this.identity && !!this.identity.Ticket;
  }
  private async loadBanners() {
    if (!this.banners || this.banners.length == 0) {
      if (this.isLoadingBanners) {
        return;
      }
      this.isLoadingBanners = true;
      
      
    }
  }
  private updateSwiper() {
    if (this.swiper) {
      setTimeout(() => {
        this.swiper.update();
        this.startAutoPlay();
      }, 200);
    }
  }
  private startAutoPlay() {
    if (this.swiper && this.swiper.autoplay && this.swiper.autoplay.start) {
      this.swiper.autoplay.start();
    }
  }
  private destroySwiper() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
  private check() {
    if (this.timeId) {
      clearTimeout(this.timeId);
    }
    this.timeId = setTimeout(async () => {
      if (!this.identity) {
        this.identity = await this.identityService
          .getIdentityAsync()
          .catch(() => null);
      }
      if (this.identity && this.identity.Ticket) {
        clearTimeout(this.timeId);
        this.goHome();
      } else {
        if (--this.count > 0) {
          this.check();
        } else {
          this.goHome();
        }
      }
    }, 200);
  }
  ngOnInit() {
    this.configService.getConfigAsync().then(c => {
      this.config = c;
    });
    this.loadBanners();
    this.initSwiper();
    if (AppHelper.isWechatMini()) {
      this.check();
    }
    this.subscriptions.push(
      this.identityService.getIdentitySource().subscribe((identity) => {
        this.identity = identity;
      })
    );
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async (q) => {
        this.isLoginByUser = false;
        if (AppHelper.isWechatMini()) {
          this.check();
        }
      })
    );
    this.homeUrl = this.domSanitize.bypassSecurityTrustResourceUrl(
      `${AppHelper.getApiUrl()}`.replace("app.", "m.")
    );
  }
  async onGo() {
    if (!this.identity) {
      this.identity = await this.identityService
        .getIdentityAsync()
        .catch(() => null);
    }
    if (!this.identity || !this.identity.Ticket) {
      AppHelper.alert(
        "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????,????????????????????????????????????????????????????????????"
      );
    }
    this.goHome();
    // const token =
    //   (this.apiService.apiConfig && this.apiService.apiConfig.Token) || "";
    // const key = AppHelper.uuid();
    // const url = "/pages/login/index?key=" + key + "&token=" + token;
    // WechatHelper.wx.miniProgram.navigateTo({ url: url });
    // WechatHelper.checkStep(key, this.apiService, (val) => {
    // });
  }
  async goToPage() {
    if (!this.identity) {
      this.identity = await this.identityService
        .getIdentityAsync()
        .catch(() => null);
    }
    if (!this.identity || !this.identity.Ticket) {
      await AppHelper.alert(
        "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
      );
    }
  }
  onSetting() {
    this.router.navigate(["account-setting"]);
  }
  async onLogin() {
    const ok = await AppHelper.alert(
      "??????????????????????????????",
      true,
      "????????????",
      "????????????"
    );
    if (!ok) {
      return;
    }
    this.isLoginByUser = true;
    this.onGo();
  }
  private initSwiper() {
    this.options = {
      loop: true,
      autoplay: {
        delay: 3000,
      },
      speed: 1000,
      direction: "vertical",
      freeMode: true,
      isShowText: true,
    };
    if (this.containerEl && this.containerEl.nativeElement) {
      this.swiper = new Swiper(this.containerEl.nativeElement, {
        loop: true,
        // autoplay:true,//?????????????????????
        autoplay: {
          delay: 3000,
          stopOnLastSlide: false,
          disableOnInteraction: true,
        },
      });
      this.swiper.on("touchEnd", () => {
        this.onTouchEnd();
      });
    }
  }
  private onTouchEnd() {
    // console.log("touchEnd");
    setTimeout(() => {
      this.startAutoPlay();
    }, 1000);
  }
  ngOnDestroy() {
    this.destroySwiper();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  async onScanResult(txt: string) {
    try {
      this.isScanning = true;
      // await this.scanService.scan();
      console.log("onScanResult", txt);
      this.scanresult = txt;
      if (txt && txt.toLowerCase().includes("app_path")) {
        this.scanService.setScanResultSource("");
        const path = AppHelper.getValueFromQueryString("app_path", txt);
        console.log("txt " + txt);
        // tslint:disable-next-line: max-line-length
        // http://test.app.testskytrip.com/Home/www/index.html?hrid=163&hrName=???????????????????????????????????????&App_Path=hr-invitation&costCenterId=6300000001&costCenterName=?????????&organizationId=6300000007&organizationName=(A007)???????????????&policyId=6300000001&policyName=????????????&roleIds=25&roleNames=?????????
        const params = {
          hrid: "",
          hrName: "",
          App_Path: "",
          costCenterId: "",
          costCenterName: "",
          organizationId: "",
          organizationName: "",
          policyId: "",
          policyName: "",
          roleIds: "",
          roleNames: "",
        };
        const query = { autoClose: true };
        Object.keys(params).forEach((k) => {
          query[k] = AppHelper.getValueFromQueryString(k, txt);
        });
        setTimeout(() => {
          this.router.navigate([AppHelper.getRoutePath(path)], {
            queryParams: query,
          });
        }, 100);
      } else {
        if (txt && txt.length) {
          this.router.navigate([
            AppHelper.getRoutePath("scan-result"),
            { scanResult: txt },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
