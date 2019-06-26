import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";

import { OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, finalize } from "rxjs/operators";
import { ApiService } from "src/app/services/api/api.service";
import { ConfigService } from "src/app/services/config/config.service";
import { NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
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
  subscription = Subscription.EMPTY;
  constructor(
    private router: Router,
    private identityService: IdentityService,
    private configService: ConfigService,
    private apiService: ApiService
  ) {}
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  ngOnInit() {
    this.Model = {
      Name: "",
      RealName: "",
      Mobile: "",
      HeadUrl: ""
    };
    this.subscription = this.identityService.getIdentity().subscribe(r => {
      this.identity = r;
    });
    this.load();
  }

  load() {
    const req = new RequestEntity();
    req.Method = "ApiMemberUrl-Home-Get";
    const deviceSubscription = this.apiService
      .getResponse<PageModel>(req)
      .pipe(
        map(r => r.Data),
        finalize(() => {
          if (deviceSubscription) {
            setTimeout(() => {
              deviceSubscription.unsubscribe();
            }, 1000);
          }
        })
      )
      .subscribe(
        r => {
          if (r) {
            this.Model = r;
            this.configService.get().then(r => {
              if (this.Model && !this.Model.HeadUrl) {
                this.Model.HeadUrl = r.DefaultImageUrl;
              }
            });
          }
        },
        () => {}
      );
  }
  credentialManagement() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  goToMyDetail() {
    this.router.navigate([AppHelper.getRoutePath("member-detail")]);
  }
}
