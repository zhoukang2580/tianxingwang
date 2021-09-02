import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { Subscription } from "rxjs";
import { HrService } from "../hr.service";
import { CostcenterComponent } from "../components/costcenter/search-costcenter.component";
import { OrganizationComponent } from "../components/organization/organization.component";
@Component({
  selector: "app-hr-invitation",
  templateUrl: "./hr-invitation.page.html",
  styleUrls: ["./hr-invitation.page.scss"],
})
export class HrInvitationPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  hrInvitationItem: any;
  isLoading = false;
  constructor(
    private hrService: HrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subscription = route.queryParamMap.subscribe((query) => {
      this.init();
      console.log("query", query);
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    // http://test.app.testskytrip.com/Home/www/index.html?hrid=1&hrName=东美在线&App_Path=hr-invitation&costCenterId=100000018&costCenterName=第二成本中心&organizationId=100000013&organizationName=(A008)产品技术部&policyId=100000005&policyName=总监差旅标准&roleIds=2&roleNames=行政人事
  }
  private async showReLoginTip() {
    return AppHelper.alert("如后台已通过申请，请重新登录");
  }
  onAddInvitation() {
    if (!this.hrInvitationItem) {
      return;
    }
    if (!this.hrInvitationItem.gender) {
      AppHelper.toast("性别必填", 2000, "middle");
      return;
    }
    if (!this.hrInvitationItem.number) {
      AppHelper.toast("员工号必填", 2000, "middle");
      return;
    }
    this.isLoading = true;
    this.hrService
      .invitationAdd(this.hrInvitationItem)
      .then(async (s) => {
        if (s.Status) {
          AppHelper.alert("申请成功！");
          this.showReLoginTip();
          this.router.navigate([""]);
        } else {
          if (s.Code && s.Code.toLowerCase() == "exist") {
            await this.showReLoginTip();
            AppHelper.alert("您已提交申请").then(() => {
              this.router.navigate([""]);
            });
          } else if (s.Message) {
            AppHelper.alert(s.Message);
          }
        }
      })
      .catch((e) => {
        this.isLoading = false;
        AppHelper.alert(e);
      })
      .finally(() => {});
  }
  onSelectPolicy() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "policy", hrId: this.hrInvitationItem.hrId },
    });
  }
  onSelectCostCenter() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "costcenter", hrId: this.hrInvitationItem.hrId },
    });
  }
  onSelectOrganization() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "organization", hrId: this.hrInvitationItem.hrId },
    });
  }
  onSelectCountry() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "countries", hrId: this.hrInvitationItem.hrId },
    });
  }
  init() {
    try {
      let costCenter =
        this.hrService.hrInvitation && this.hrService.hrInvitation.costCenter;
      let country =
        this.hrService.hrInvitation && this.hrService.hrInvitation.country;
      let organization =
        this.hrService.hrInvitation && this.hrService.hrInvitation.organization;
      if (!costCenter || !costCenter.Id) {
        costCenter = {
          Id: this.route.snapshot.queryParams.costCenterId || "",
          Name: this.route.snapshot.queryParams.costCenterName,
        } as any;
      }
      if (!country || !country.Id) {
        country = {
          Id: this.route.snapshot.queryParams.countriesId || "",
          Name: this.route.snapshot.queryParams.countriesName,
        } as any;
      }
      if (!organization || !organization.Id) {
        organization = {
          Id: this.route.snapshot.queryParams.organizationId || "",
          Name: this.route.snapshot.queryParams.organizationName || "",
        } as any;
      }

      const hrInvitationItem: any = {
        hrId: this.route.snapshot.queryParams.hrid,
        name: this.route.snapshot.queryParams.name,
        positionNames: this.route.snapshot.queryParams.positionNames || "",
        positionIds: this.route.snapshot.queryParams.positionIds || "",
        costCenter: costCenter,
        country: country,
        policy: {
          Id: this.route.snapshot.queryParams.policyId || "",
          Name: this.route.snapshot.queryParams.policyName || "",
        },
        roleIds: this.route.snapshot.queryParams.roleIds || "",
        roleNames: this.route.snapshot.queryParams.roleNames || "",
        hrName: this.route.snapshot.queryParams.hrName || "",
        organization: organization,
        gender: this.route.snapshot.queryParams.gender,
        number: this.route.snapshot.queryParams.number,
        birthday: "",
      };
      this.hrInvitationItem = hrInvitationItem;
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}
