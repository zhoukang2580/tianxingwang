import { AppHelper } from "../../appHelper";
import { LoginService } from "../../services/login/login.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-setting",
  templateUrl: "./account-setting.page.html",
  styleUrls: ["./account-setting.page.scss"]
})
export class AccountSettingPage implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit() {}
  logout() {
    this.loginService.logout();
  }
  accountSecurityPage() {
    this.router.navigate([AppHelper.getRoutePath("account-security")]);
  }
}
