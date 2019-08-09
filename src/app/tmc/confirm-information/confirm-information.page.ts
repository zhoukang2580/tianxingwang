import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "./../../services/api/Request.entity";
import { ApiService } from "./../../services/api/api.service";
import { LanguageHelper } from "./../../languageHelper";
import { TmcService } from "./../tmc.service";
import { StaffService, StaffEntity } from "../../hr/staff.service";
import { Component, OnInit } from "@angular/core";

import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { MemberCredential } from "src/app/member/member.service";
import { NavController } from '@ionic/angular';

@Component({
  selector: "app-comfirm-info",
  templateUrl: "./confirm-information.page.html",
  styleUrls: ["./confirm-information.page.scss"]
})
export class ComfirmInformationPage implements OnInit {
  credentials: MemberCredential[];
  staff: StaffEntity;
  password: string;
  constructor(
    private staffService: StaffService,
    private apiService: ApiService,
    private navCtrl:NavController,
    private tmcService: TmcService,
    private router: Router,
    private route: ActivatedRoute,
    private identityService: IdentityService
  ) {
    route.paramMap.subscribe(async p => {
      this.staff = await this.staffService.getStaff();
      const identity = await this.identityService.getIdentityAsync();
      this.credentials = await this.tmcService.getCredentials(
        identity && identity.Id
      );
      console.log("ComfirmInformationPage", this.staff);
    });
  }
  back(){
    this.navCtr.back();
  }
  async ngOnInit() {}
  async confirmPassword() {
    if (!this.password) {
      AppHelper.alert(LanguageHelper.getEnterPasswordTip());
      return;
    }
    if (!this.staff) {
      this.staff = await this.staffService.getStaff(true);
    }
    const ok = await this.modifyPassword({
      OldPassword: (this.staff && this.staff.Password) || "",
      NewPassword: this.password,
      SurePassword: this.password
    });
    if (ok) {
      const r = await this.staffService.comfirmInfoModifyPassword();
      if (r) {
        this.staff = await this.staffService.getStaff(true);
        AppHelper.toast(
          LanguageHelper.getComfirmInfoModifyPasswordSuccessTip()
        );
      } else {
        AppHelper.toast(
          LanguageHelper.getComfirmInfoModifyPasswordFailureTip()
        );
      }
    }
  }
  private modifyPassword(passwordModel: {
    /// <summary>
    /// 老密码
    /// </summary>
    OldPassword: string;
    /// <summary>
    /// 新密码
    /// </summary>
    NewPassword: string;
    /// <summary>
    /// 确认密码
    /// </summary>
    SurePassword: string;
  }) {
    const req = new RequestEntity();
    req.Data = passwordModel;
    req.Method = `ApiPasswordUrl-Password-Modify`;
    req.IsShowLoading = true;
    return this.apiService
      .getPromiseData(req)
      .then(_ => {
        return true;
      })
      .catch(e => {
        AppHelper.alert(e);
        return false;
      });
  }
  async confirmCredentials() {
    try {
      const ok = await this.staffService.comfirmInfoModifyCredentials();
      if (ok) {
        this.staff = await this.staffService.getStaff(true);
        if (
          this.staff &&
          this.staff.IsConfirmInfo &&
          this.staff.IsModifyPassword
        ) {
          AppHelper.alert(
            LanguageHelper.getComfirmInfoModifyCredentialsSuccessTip(),
            true,
            LanguageHelper.getConfirmTip()
          ).then(confirm => {
            if (confirm) {
              this.router.navigate([""]); // 回到首页
            }
          });
        }
      } else {
        AppHelper.alert(
          LanguageHelper.getComfirmInfoModifyCredentialsFailureTip()
        );
      }
    } catch {}
  }
  maintainCredentials() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
    // if (this.credentials.length) {
    //   this.router.navigate([AppHelper.getRoutePath("")]);
    // } else {
    //   this.router.navigate([AppHelper.getRoutePath("member-credential-management")]);
    // }
  }
}
