import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StaffService, IHrInvitation } from "../staff.service";
import { AppHelper } from "src/app/appHelper";
@Component({
  selector: "app-hr-invitation",
  templateUrl: "./hr-invitation.page.html",
  styleUrls: ["./hr-invitation.page.scss"]
})
export class HrInvitationPage implements OnInit {
  hrInvitationItem: IHrInvitation;
  constructor(
    private staffService: StaffService,
    private router: Router,
    route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe(q => {
      try {
        if (q.get("data")) {
          const query = JSON.parse(q.get("data"));
          const hrInvitationItem = {
            name: query.name,
            constCenter: {
              Id: query["costcenterid"],
              Name: query.costcentername
            },
            policy: {
              Id: query.policyid,
              Name: query.policyname
            },
            roleIds: query.roleids,
            roleNames: query.rolenames,
            hrName: query.hrname,
            organization: {
              Id: query.organizationid,
              Name: query.organizationname
            }
          };
          this.staffService.setHrInvitationSource(hrInvitationItem);
        }
      } catch (e) {
        AppHelper.alert(e);
      }
    });
  }

  ngOnInit() {
    this.init();
  }
  onAddInvitation() {
    this.staffService
      .invitationAdd()
      .then(s => {
        AppHelper.alert("申请成功！");
      })
      .catch(e => {
        AppHelper.alert(e);
      });
  }
  onSelectPolicy() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "policy" }
    });
  }
  onSelectCostCenter() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "costcenter" }
    });
  }
  onSelectOrganization() {
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "organization" }
    });
  }
  init() {
    this.staffService.getHrInvitationSource().subscribe(q => {
      this.hrInvitationItem = q;
    });
  }
}
