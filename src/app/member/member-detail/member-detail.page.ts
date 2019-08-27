import { StaffEntity } from "./../../hr/staff.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ConfigService } from "src/app/services/config/config.service";
import { ApiService } from "src/app/services/api/api.service";
import { map } from "rxjs/operators";
import { CropAvatarPage } from "src/app/pages/crop-avatar/crop-avatar.page";
import { Subscription } from "rxjs";
type PageModel = {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
  StaffNumber: string;
  CostCenterName: string;
  CostCenterCode: string;
  OrganizationName: string;
  BookTypeName: string;
};
@Component({
  selector: "app-member-detail",
  templateUrl: "./member-detail.page.html",
  styleUrls: ["./member-detail.page.scss"]
})
export class MemberDetailPage implements OnInit, OnDestroy {
  Model: PageModel;
  identity: IdentityEntity;
  staff: any;
  defaultAvatar = AppHelper.getDefaultAvatar();
  identitySubscription = Subscription.EMPTY;
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private configService: ConfigService,
    private apiService: ApiService,
    private navCtrl: NavController
  ) {}
  back() {
    this.navCtrl.back();
  }
  async ngOnInit() {
    console.log("member detail ngOnInit");
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(identity => {
        this.identity = identity;
        if (!identity || !identity.Ticket) {
          this.Model = null;
          this.staff = null;
        }
      });
    await this.load();
    AppHelper.setCallback((name: string, data: any) => {
      console.log("helper callback");
      if (name == CropAvatarPage.UploadSuccessEvent && data && data.HeadUrl) {
        this.Model.HeadUrl = data.HeadUrl + "?v=" + Date.now();
      }
    });
  }

  async load() {
    const req = new RequestEntity();
    if (this.Model) {
      return;
    }
    req.Method = "ApiMemberUrl-Home-Get";
    const r = await this.apiService.getPromiseData<PageModel>(req);
    if (r) {
      this.Model = {
        ...this.Model,
        Name: r.Name,
        RealName: r.RealName,
        HeadUrl: r.HeadUrl || (await this.configService.get()).DefaultImageUrl
      } as any;
    }
    if (this.staff) {
      return;
    }
    const req1 = new RequestEntity();
    req1.Method = "HrApiUrl-Staff-Get";
    const staff = await this.apiService.getPromiseData<StaffEntity>(req);
    this.staff = staff;
    if (staff) {
      this.Model = {
        ...this.Model,
        ...staff,
        RealName: staff.Name || staff.Nickname
      };
    }
  }
  ngOnDestroy() {
    this.identitySubscription.unsubscribe();
  }
}
