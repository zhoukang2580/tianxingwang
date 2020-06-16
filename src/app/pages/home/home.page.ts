import { Component, OnInit } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import { QrScanService } from "src/app/services/qrScan/qrscan.service";
import { Subject } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { CONFIG } from "src/app/config";
import { ApiService } from "src/app/services/api/api.service";
import { WechatHelper } from "src/app/wechatHelper";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  identity: IdentityEntity;
  scanresult: string;
  homeUrl: any;
  isWechatMini = AppHelper.isWechatMini();
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private scanService: QrScanService,
    private domSanitize: DomSanitizer,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.identityService.getIdentityAsync().then((identity) => {
      this.identity = identity;
    });
    this.homeUrl = this.domSanitize.bypassSecurityTrustResourceUrl(
      `${AppHelper.getApiUrl()}`.replace("app.", "m.")
    );
  }
  onGo() {
    this.router.navigate([""]);
    // const token =
    //   (this.apiService.apiConfig && this.apiService.apiConfig.Token) || "";
    // const key = AppHelper.uuid();
    // const url = "/pages/login/index?key=" + key + "&token=" + token;
    // WechatHelper.wx.miniProgram.navigateTo({ url: url });
    // WechatHelper.checkStep(key, this.apiService, (val) => {
    // });
  }
  onSetting() {
    this.router.navigate(["account-setting"]);
  }
  onScanResult(txt: string) {
    this.scanresult = txt;
    if (txt && txt.toLowerCase().includes("app_path")) {
      this.scanService.setScanResultSource("");
      const path = AppHelper.getValueFromQueryString("app_path", txt);
      console.log("txt " + txt);
      // tslint:disable-next-line: max-line-length
      // http://test.app.testskytrip.com/Home/www/index.html?hrid=163&hrName=上海东美在线旅行社有限公司&App_Path=hr-invitation&costCenterId=6300000001&costCenterName=财务部&organizationId=6300000007&organizationName=(A007)综合业务部&policyId=6300000001&policyName=一般政策&roleIds=25&roleNames=新秘书
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
      const query = {};
      Object.keys(params).forEach((k) => {
        query[k] = AppHelper.getValueFromQueryString(k, txt);
      });
      setTimeout(() => {
        this.router.navigate([AppHelper.getRoutePath(path)], {
          queryParams: query,
        });
      }, 100);
    } else {
      if (txt) {
        this.router.navigate([
          AppHelper.getRoutePath("scan-result"),
          { scanResult: txt },
        ]);
      }
    }
  }
}
