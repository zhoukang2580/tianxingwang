import { Subscription } from 'rxjs';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: "app-no-authorize",
  templateUrl: "./no-authorize.page.html",
  styleUrls: ["./no-authorize.page.scss"]
})
export class NoAuthorizePage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  isApp = AppHelper.isApp();
  isBackToLoginPage = false;
  constructor(private navCtrl: NavController,
    private identityService: IdentityService) { }
  onBackToLoginPage() {
    this.navCtrl.navigateRoot("login", { animated: true });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  exitApp() {
    if (navigator["app"] && navigator["app"].exitApp) {
      navigator["app"].exitApp();
    }
  }
  onBack() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.subscription = this.identityService.getStatus().subscribe(rev => {
      this.isBackToLoginPage = !rev;
    })
  }
}
