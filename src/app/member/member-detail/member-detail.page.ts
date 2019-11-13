import { MemberService } from "./../member.service";
import { StaffEntity, StaffService } from "./../../hr/staff.service";
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
  memberDetails: PageModel;
  identity: IdentityEntity;
  staff: StaffEntity;
  defaultAvatar = AppHelper.getDefaultAvatar();
  identitySubscription = Subscription.EMPTY;
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private apiService: ApiService,
    private navCtrl: NavController,
    private staffService: StaffService,
    private memberService: MemberService
  ) {}
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(async _ => {
      await this.load();
    });
    console.log("member detail ngOnInit");
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(identity => {
        this.identity = identity;
        if (!identity || !identity.Ticket) {
          this.memberDetails = null;
          this.staff = null;
        }
      });
    // AppHelper.setCallback((name: string, data: any) => {
    //   console.log("helper callback");
    //   if (name == CropAvatarPage.UploadSuccessEvent && data && data.HeadUrl) {
    //     this.memberDetails.HeadUrl = data.HeadUrl + "?v=" + Date.now();
    //   }
    // });
  }

  async load() {
    // if (this.memberDetails) {
    //   return;
    // }
    const r = await this.memberService.getMemberDetails().catch(_ => null);
    if (r) {
      this.memberDetails = {
        ...this.memberDetails,
        Name: r.Name,
        RealName: r.RealName,
        HeadUrl: r.HeadUrl || (await this.configService.get()).DefaultImageUrl
      } as any;
    }
    if (this.staff) {
      return;
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
    this.identitySubscription.unsubscribe();
  }
}
