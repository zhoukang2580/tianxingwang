import { AppHelper } from "../../appHelper";
import { LoginService } from "../../services/login/login.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-setting",
  templateUrl: "./account-setting.page.html",
  styleUrls: ["./account-setting.page.scss"]
})
export class AccountSettingPage implements OnInit {
  appVersion: string = "3.0.1";
  constructor(
    private loginService: LoginService,
    private router: Router,
    private navCtrl: NavController
  ) {}
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    this.getVersion();
  }
  private async getVersion() {
    this.appVersion = AppHelper.isApp()
      ? AppHelper.getHcpVersion() || (await AppHelper.getAppVersion())
      : "";
  }
  logout() {
    this.loginService.logout();
  }
  accountSecurityPage() {
    this.router.navigate([AppHelper.getRoutePath("account-security")]);
  }
}
