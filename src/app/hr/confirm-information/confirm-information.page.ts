import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "../../services/api/Request.entity";
import { ApiService } from "../../services/api/api.service";
import { LanguageHelper } from "../../languageHelper";
import { HrService, StaffEntity } from "../hr.service";
import { Component, OnInit, OnDestroy } from "@angular/core";

import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { MemberCredential } from "src/app/member/member.service";
import { NavController } from "@ionic/angular";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { LoginService } from "src/app/services/login/login.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-comfirm-info",
  templateUrl: "./confirm-information.page.html",
  styleUrls: ["./confirm-information.page.scss"],
})
export class ConfirmInformationPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  credentials: MemberCredential[];
  staff: StaffEntity;
  password: string;
  identity: IdentityEntity;
  accountName = AppHelper.getStorage("loginname");
  constructor(
    private staffService: HrService,
    private apiService: ApiService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private identityService: IdentityService
  ) {
    this.subscription = route.queryParamMap.subscribe(async (p) => {
      this.staff = await this.staffService.getStaff(true);
      const staff = this.staff;
      this.identity = await this.identityService.getIdentityAsync();
      this.credentials = await this.getCredentials(
        this.identity && this.identity.Id
      );
      if (
        staff &&
        staff.IsConfirmInfo != undefined &&
        staff.IsModifyPassword != undefined
      ) {
        if (staff.IsConfirmInfo && staff.IsModifyPassword) {
          if (
            this.identity &&
            this.identity.Numbers &&
            this.identity.Numbers.AgentId
          ) {
            this.navCtrl.navigateRoot("");
            return;
          }
          if (!this.credentials || this.credentials.length == 0) {
            await this.checkIfHasCredentials();
          } else {
            this.navCtrl.navigateRoot("");
          }
          return true;
        }
        return false;
      }
    });
  }
  async getCredentials(accountId: string): Promise<MemberCredential[]> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId,
    };
    return this.apiService
      .getPromiseData<{ Credentials: MemberCredential[] }>(req)
      .then((r) => r.Credentials)
      .catch((_) => []);
  }
  async back() {
    this.router.navigate([""]);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
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
      SurePassword: this.password,
    })
      .then(() => true)
      .catch((e) => {
        AppHelper.alert(e);
        return false;
      });
    if (!ok) {
      return;
    }
    const r = await this.staffService.comfirmInfoModifyPassword();
    if (r) {
      this.staff = await this.staffService.getStaff(true);
      AppHelper.toast(LanguageHelper.getComfirmInfoModifyPasswordSuccessTip());
    } else {
      AppHelper.toast(LanguageHelper.getComfirmInfoModifyPasswordFailureTip());
    }
    await this.checkIfHasCredentials();
  }
  private async checkIfHasCredentials() {
    const identity = await this.identityService.getIdentityAsync();
    if (identity) {
      if (identity && identity.Numbers && identity.Numbers.AgentId) {
        this.router.navigate([AppHelper.getRoutePath("")]);
        return;
      }
      const cs = await this.getCredentials(identity && identity.Id);
      if (!cs || cs.length == 0) {
        const ok = await AppHelper.alert(
          "请维护证件",
          true,
          LanguageHelper.getConfirmTip()
        );
        if (ok) {
          this.maintainCredentials();
        } else {
          await this.checkIfHasCredentials();
        }
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
      .then((_) => {
        return true;
      })
      .catch((e) => {
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
          ).then((confirm) => {
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
    this.router.navigate(
      [AppHelper.getRoutePath("member-credential-management")],
      {
        queryParams: { fromConformCredentials: true, addNew: true },
      }
    );
    // if (this.credentials.length) {
    //   this.router.navigate([AppHelper.getRoutePath("")]);
    // } else {
    //   this.router.navigate([AppHelper.getRoutePath("member-credential-list")]);
    // }
  }
}
