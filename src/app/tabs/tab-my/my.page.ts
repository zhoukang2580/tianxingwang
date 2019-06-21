import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";

import { OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map } from "rxjs/operators";
import { ApiService } from "src/app/services/api/api.service";
import { ConfigService } from "src/app/services/config/config.service";
import { NavController } from "@ionic/angular";
type PageModel = {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
};
@Component({
  selector: "app-my",
  templateUrl: "my.page.html",
  styleUrls: ["my.page.scss"]
})
export class MyPage implements OnDestroy, OnInit {
  identity: IdentityEntity;
  Model: PageModel;
  defaultAvatar = AppHelper.getDefaultAvatar();
  constructor(
    private router: Router,
    private identityService: IdentityService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private configService: ConfigService,
    private apiService: ApiService
  ) {}
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  async ngOnInit() {
    this.Model = {
      Name: "",
      RealName: "",
      Mobile: "",
      HeadUrl: ""
    };
    this.identity = await this.identityService.getIdentity();
    this.load();
  }

  load() {
    const req = new RequestEntity();
    req.Method = "ApiMemberUrl-Home-Get";
    let deviceSubscription = this.apiService
      .getResponse<PageModel>(req)
      .pipe(map(r => r.Data))
      .subscribe(
        r => {
          this.Model = r;
          this.configService.get().then(r => {
            if (this.Model && !this.Model.HeadUrl) {
              this.Model.HeadUrl = r.DefaultImageUrl;
            }
          });
        },
        () => {
          if (deviceSubscription) {
            deviceSubscription.unsubscribe();
          }
        }
      );
  }
  credentialManagement() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
  }
  ngOnDestroy() {}
  goToMyDetail() {
    this.router.navigate([AppHelper.getRoutePath("member-detail")]);
  }
}
