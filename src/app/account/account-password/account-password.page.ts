import { ActivatedRoute } from "@angular/router";
import { AppHelper } from "./../../appHelper";
import { LoginService } from "./../../services/login/login.service";
import { AlertController, NavController } from "@ionic/angular";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { Router } from "@angular/router";

import { tap } from "rxjs/operators";
import { Subscription, Observable } from "rxjs";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { LanguageHelper } from "src/app/languageHelper";
class PasswordModel {
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
}

@Component({
  selector: "app-account-password",
  templateUrl: "./account-password.page.html",
  styleUrls: ["./account-password.page.scss"]
})
export class AccountPasswordPage implements OnInit, OnDestroy {
  identityEntity: IdentityEntity;
  passwordModel: PasswordModel;
  confirmNewPassword: string;
  modifyPasswordSubscription = Subscription.EMPTY;
  identitySubscription = Subscription.EMPTY;
  loading$: Observable<boolean>;
  constructor(
    identityService: IdentityService,
    private router: Router,
    private apiService: ApiService,
    private navCtrl:NavController
  ) {
    this.identitySubscription = identityService.getIdentity().subscribe(id => {
      this.identityEntity = id;
    });
    this.loading$ = this.apiService.getLoading();
    console.log("account-password constructor");
    this.passwordModel = new PasswordModel();
  }
  back(){
    this.navCtrl.back();
  }
  forgetPassword() {
    this.router.navigate([
      AppHelper.getRoutePath("password-check"),
      { Id: this.identityEntity.Id }
    ]);
  }
  done() {
    if (!this.passwordModel.NewPassword) {
      AppHelper.alert(LanguageHelper.NewPasswordNullTip);
      return;
    }
    if (this.passwordModel.NewPassword !== this.passwordModel.SurePassword) {
      AppHelper.alert(LanguageHelper.TwicePasswordNotEqualTip);
      return;
    }
    this.modifyPasswordSubscription.unsubscribe();
    this.modifyPasswordSubscription = this.modifyPassword(this.passwordModel)
      .pipe(tap(a => console.log(a)))
      .subscribe(
        res => {
          if (res.Status) {
            AppHelper.alert("密码修改成功");
          } else {
            AppHelper.alert(res.Message);
          }
        },
        e => AppHelper.alert(e)
      );
  }
  ngOnInit() {}
  ngOnDestroy(): void {
    this.identitySubscription.unsubscribe();
    this.modifyPasswordSubscription.unsubscribe();
  }

  modifyPassword(passwordModel: PasswordModel) {
    const req = new RequestEntity();
    req.Data = JSON.stringify(passwordModel);
    req.Method = `ApiPasswordUrl-Password-Modify`;
    return this.apiService.getResponse(req);
  }
}
