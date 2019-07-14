import { RequestEntity } from "./../../services/api/Request.entity";
import { ApiService } from "./../../services/api/api.service";
import { LanguageHelper } from "./../../languageHelper";
import { TmcService } from "./../tmc.service";
import { HrService, StaffEntity } from "../../hr/staff.service";
import { Component, OnInit } from "@angular/core";

import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import {  MemberCredentials } from 'src/app/member/member.service';

@Component({
  selector: "app-comfirm-info",
  templateUrl: "./confirm-information.page.html",
  styleUrls: ["./confirm-information.page.scss"]
})
export class ComfirmInformationPage implements OnInit {
  credentials: MemberCredentials[];
  staff: StaffEntity;
  password: string;
  constructor(
    private hrService: HrService,
    private apiService: ApiService,
    private tmcService: TmcService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    route.paramMap.subscribe(async p => {
      this.staff = await this.hrService.getStaff();
      this.credentials = await this.tmcService.getCredentials();
      console.log("ComfirmInformationPage", this.staff);
    });
  }

  async ngOnInit() {}
  async confirmPassword() {
    if (!this.password) {
      AppHelper.alert(LanguageHelper.getEnterPasswordTip());
      return;
    }
    if (!this.staff) {
      this.staff = await this.hrService.getStaff(true);
    }
    const ok = await this.modifyPassword({
      OldPassword: (this.staff && this.staff.Password) || "",
      NewPassword: this.password,
      SurePassword: this.password
    });
    if (ok) {
      const r = await this.hrService.comfirmInfoModifyPassword();
      if (r) {
        this.staff = await this.hrService.getStaff(true);
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
      .getResponseAsync(req)
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
      const ok = await this.hrService.comfirmInfoModifyCredentials();
      if (ok) {
        this.staff = await this.hrService.getStaff(true);
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
