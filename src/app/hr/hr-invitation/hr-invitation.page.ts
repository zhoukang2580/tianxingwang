import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StaffService, IHrInvitation } from "../staff.service";
import { AppHelper } from "src/app/appHelper";
import { CountryEntity } from 'src/app/tmc/models/CountryEntity';
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
    private  route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe(query => {
      
    });
  }

  ngOnInit() {
    this.init();
   
    // this.router.navigate(["hr-invitation"],{queryParams:{hrid:'163',hrName:"上海东美在线旅行社有限公司",costCenterId:'6300000001',costCenterName:'一般政策',organizationId:'6300000005',policyId:'6300000001',roleIds:'24,25',roleNames:'超级秘书,新秘书'}});

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
  onSelectCountry(){
    this.router.navigate(["hr-invitation-search"], {
      queryParams: { type: "countries" }
    });
  }
  init() {
    this.staffService.getHrInvitationSource().subscribe(q => {
      this.hrInvitationItem = q;
    });
    try {
        
      // if (q.get("data")) {
        // const query = JSON.parse(q.get("data"));
      
        const hrInvitationItem :IHrInvitation= {
          hrId: this.route.snapshot.queryParams.hrid,
          name:  this.route.snapshot.queryParams.name,
          constCenter: {
            Id: this.route.snapshot.queryParams.costCenterId,
            Name: this.route.snapshot.queryParams.costCenterName
          },
          country:{
            Id:this.route.snapshot.queryParams.countriesId,
            Name:this.route.snapshot.queryParams.countriesName
          } as CountryEntity,
          policy: {
            Id: this.route.snapshot.queryParams.policyId,
            Name:this.route.snapshot.queryParams.policyName,
          },
          roleIds: this.route.snapshot.queryParams.roleIds,
          roleNames: this.route.snapshot.queryParams.roleNames,
          hrName: this.route.snapshot.queryParams.hrName,
          organization: {
            Id: this.route.snapshot.queryParams.organizationId,
            Name: this.route.snapshot.queryParams.organizationName
          },
          gender:this.route.snapshot.queryParams.gender,
          number:this.route.snapshot.queryParams.number
        };
        this.staffService.setHrInvitationSource(hrInvitationItem);
      // }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}
