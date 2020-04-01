import { Component, OnInit } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit {
  identity: IdentityEntity;
  constructor(
    private identityService: IdentityService,
    private router: Router
  ) {}

  ngOnInit() {
    this.identityService.getIdentityAsync().then(identity => {
      this.identity = identity;
    });
  }
  onScanResult(txt: string) {
    if (txt && txt.toLowerCase().includes("app_path")) {
      const path = AppHelper.getValueFromQueryString("app_path", txt);
      console.log("path", path);
      const params = {
        hrid: "",
        hrName: "",
        App_Path: "",
        costCenterId: "",
        costCenterName: "",
        organizationId: "",
        policyId: ""
      };
      const query = {};
      Object.keys(params).forEach(k => {
        query[k] = AppHelper.getValueFromQueryString(k, txt);
      });
      this.router.navigate([AppHelper.getRoutePath(path)], {
        queryParams: query
      });
    } else {
      if (txt) {
        this.router.navigate([
          AppHelper.getRoutePath("scan-result"),
          { scanResult: txt }
        ]);
      }
    }
  }
}
