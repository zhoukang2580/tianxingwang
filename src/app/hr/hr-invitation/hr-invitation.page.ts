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
    // this.router.navigate(["hr-invitation"], {
    //   queryParams: {
    //     hrid: "163",
    //     hrName: "上海东美在线旅行社有限公司",
    //     costCenterId: "6300000001",
    //     costCenterName: "一般政策",
    //     organizationId: "6300000005",
    //     policyId: "6300000001",
    //     roleIds: "24,25",
    //     roleNames: "超级秘书,新秘书",
    //   },
    // });
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
      const hrInvitationItem: any = {
        hrId: this.route.snapshot.queryParams.hrid,
        name: this.route.snapshot.queryParams.name,
        positionNames: this.route.snapshot.queryParams.positionNames || "",
        positionIds: this.route.snapshot.queryParams.positionIds || "",
        costCenter: {
          Id: this.route.snapshot.queryParams.costCenterId || "",
          Name: this.route.snapshot.queryParams.costCenterName,
        },
        country: {
          Id: this.route.snapshot.queryParams.countriesId || "",
          Name: this.route.snapshot.queryParams.countriesName,
        },
        policy: {
          Id: this.route.snapshot.queryParams.policyId || "",
          Name: this.route.snapshot.queryParams.policyName || "",
        },
        roleIds: this.route.snapshot.queryParams.roleIds || "",
        roleNames: this.route.snapshot.queryParams.roleNames || "",
        hrName: this.route.snapshot.queryParams.hrName || "",
        organization: {
          Id: this.route.snapshot.queryParams.organizationId || "",
          Name: this.route.snapshot.queryParams.organizationName || "",
        },
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
