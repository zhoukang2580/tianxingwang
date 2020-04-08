import { Component, OnInit } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  identity: IdentityEntity;
  scanresult: string;
  constructor(
    private identityService: IdentityService,
    private router: Router
  ) {}

  ngOnInit() {
    this.identityService.getIdentityAsync().then((identity) => {
      this.identity = identity;
    });
  }
  onSetting() {
    this.router.navigate(["account-setting"]);
  }
  onScanResult(txt: string) {
    this.scanresult = txt;
    if (txt && txt.toLowerCase().includes("app_path")) {
      const path = AppHelper.getValueFromQueryString("app_path", txt);
      console.log("txt " + txt);
      // tslint:disable-next-line: max-line-length
      // http://test.app.testskytrip.com/Home/www/index.html?hrid=1&hrName=东美在线&App_Path=hr-invitation&organizationId=100000013&costCenterName=(A008)产品技术部&policyId=100000005&costCenterName=测试政策&roleIds=2&roleNames=行政人事
      const params = {
        hrid: "",
        hrName: "",
        App_Path: "",
        costCenterId: "",
        costCenterName: "",
        organizationId: "",
        policyId: "",
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
