import { MessageService } from "./../../message/message.service";
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
import { Subscription, Observable } from "rxjs";
interface PageModel {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
}
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
  msgCount$: Observable<number>;
  constructor(
    private router: Router,
    private identityService: IdentityService,
    private configService: ConfigService,
    private apiService: ApiService,
    route: ActivatedRoute,
    private messageService: MessageService
  ) {
    route.paramMap.subscribe(_ => {});
  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  goTomessageList() {
    this.router.navigate([AppHelper.getRoutePath("message-list")]);
  }

  ngOnInit() {
    this.msgCount$ = this.messageService.getMsgCount();
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

  async load() {
    const req = new RequestEntity();
    req.Method = "ApiMemberUrl-Home-Get";
    const r = await this.apiService.getResponseAsync<PageModel>(req);
    if (r) {
      this.Model = r;
      this.configService.get().then(r => {
        if (this.Model && !this.Model.HeadUrl) {
          this.Model.HeadUrl = r.DefaultImageUrl;
        }
      });
    }
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
