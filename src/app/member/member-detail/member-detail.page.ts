import { ConfigEntity } from "./../../services/config/config.entity";
import { MemberService } from "./../member.service";
import { StaffEntity, HrService } from "../../hr/hr.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { Router, ActivatedRoute } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ConfigService } from "src/app/services/config/config.service";
import { ApiService } from "src/app/services/api/api.service";
import { map } from "rxjs/operators";
import { CropAvatarPage } from "src/app/pages/crop-avatar/crop-avatar.page";
import { Subscription, Observable } from "rxjs";
import { PageModel } from "../member.service";

@Component({
  selector: "app-member-detail",
  templateUrl: "./member-detail.page.html",
  styleUrls: ["./member-detail.page.scss"]
})
export class MemberDetailPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  memberDetails: PageModel;
  identity: IdentityEntity;
  config: ConfigEntity;
  staff: StaffEntity;
  defaultAvatar = AppHelper.getDefaultAvatar();
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private apiService: ApiService,
    private navCtrl: NavController,
    private staffService: HrService,
    private memberService: MemberService
  ) {}
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async _ => {
        console.log(
          "member detail ngOnInit",
          this.memberDetails && this.memberDetails.HeadUrl
        );
        this.config = await this.configService.getConfigAsync();
        this.load();
        AppHelper.setRouteData(AppHelper.getRouteData());
      })
    );
    this.subscriptions.push(
      this.identityService.getIdentitySource().subscribe(identity => {
        this.identity = identity;
        this.memberDetails = null;
        this.staff = null;
      })
    );
  }
  private addVersionToUrl(url: string) {
    if (url) {
      url = url.includes("?")
        ? url.substr(0, url.indexOf("?")) + `?v=${Date.now()}`
        : `${url}?v=${Date.now()}`;
    }
    return url;
  }
  async load(forceLoad = false) {
    if (this.memberDetails && !forceLoad) {
      if (this.memberDetails.HeadUrl) {
        this.memberDetails.HeadUrl = this.addVersionToUrl(
          this.memberDetails.HeadUrl
        );
      }
      return this.memberDetails;
    }
    const r = await this.memberService.getMember().catch(_ => null);
    if (r) {
      this.memberDetails = {
        ...this.memberDetails,
        Name: r.Name,
        RealName: r.RealName,
        HeadUrl: this.addVersionToUrl(r.HeadUrl)
      } as any;
    }
    this.staff = await this.staffService.getStaff();
    if (this.staff) {
      this.memberDetails = {
        ...this.memberDetails,
        ...this.staff,
        Name: this.memberDetails && this.memberDetails.Name,
        RealName:
          (this.memberDetails && this.memberDetails.RealName) ||
          this.staff.Nickname
      };
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
