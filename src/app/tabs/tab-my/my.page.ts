import { MessageService } from "./../../message/message.service";
import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";

import { OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { ConfigService } from "src/app/services/config/config.service";
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
  Model: PageModel;
  defaultAvatar = AppHelper.getDefaultAvatar();
  subscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  msgCount$: Observable<number>;
  constructor(
    private router: Router,
    private identityService: IdentityService,
    private configService: ConfigService,
    private apiService: ApiService,
    route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.identitySubscription = this.identityService
      .getIdentity()
      .subscribe(identity => {
        if (!identity || !identity.Ticket) {
          console.log("my page identity ", identity);
          this.Model = null;
        }
      });
    route.paramMap.subscribe(async _ => {
      this.load();
    });
  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  goTomessageList() {
    this.router.navigate([AppHelper.getRoutePath("message-list")]);
  }

  ngOnInit() {
    this.msgCount$ = this.messageService.getMsgCount();
    console.log("my ngOnInit");
    // this.Model = {
    //   Name: "",
    //   RealName: "",
    //   Mobile: "",
    //   HeadUrl: ""
    // };
  }

  async load() {
    console.log("my load this.model", this.Model);
    const req = new RequestEntity();
    if (this.Model) {
      return this.Model;
    }
    req.Method = "ApiMemberUrl-Home-Get";
    const r = await this.apiService.getResponseAsync<PageModel>(req);
    const config = await this.configService.get();
    console.log("my load ApiMemberUrl-Home-Get", r);
    this.Model = { ...this.Model, ...r };
    if (this.Model && !this.Model.HeadUrl) {
      this.Model.HeadUrl = config.DefaultImageUrl;
    }
  }
  credentialManagement() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.identitySubscription.unsubscribe();
  }
  goToMyDetail() {
    this.router.navigate([AppHelper.getRoutePath("member-detail")]);
  }
}
