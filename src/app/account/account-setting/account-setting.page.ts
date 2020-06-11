import { Subscription } from "rxjs";
import { AppHelper } from "../../appHelper";
import { LoginService } from "../../services/login/login.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { NavController } from "@ionic/angular";
import { ThemeService } from "src/app/services/theme/theme.service";
import { TTSService } from "src/app/services/tts/tts.service";

@Component({
  selector: "app-setting",
  templateUrl: "./account-setting.page.html",
  styleUrls: ["./account-setting.page.scss"],
})
export class AccountSettingPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  appVersion: string = "3.0.1";
  isDarkMode: boolean;
  ttsEnabled = false;
  constructor(
    private loginService: LoginService,
    private router: Router,
    private navCtrl: NavController,
    private themeService: ThemeService,
    private ttsService: TTSService
  ) {
    this.ttsEnabled = ttsService.getEnabled();
  }
  back() {
    this.navCtrl.pop();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onTts() {
    console.log("tts enabled", this.ttsEnabled);
    this.ttsService.setEnabled(this.ttsEnabled);
    this.ttsService.speak(this.ttsEnabled ? "语音播报已开启" : "关闭语音播报");
  }
  ngOnInit() {
    this.getVersion();
    this.subscription = this.themeService.getModeSource().subscribe((m) => {
      this.isDarkMode = m == "dark";
    });
  }
  onToggleDarkMode(evt: CustomEvent) {
    this.isDarkMode = evt.detail.checked;
    this.themeService.cachePreferanceMode(this.isDarkMode ? "dark" : "light");
    this.themeService.setModeSource(this.isDarkMode ? "dark" : "light");
  }
  private async getVersion() {
    this.appVersion = AppHelper.isApp() ? await AppHelper.getAppVersion() : "";
  }
  logout() {
    this.loginService.logout();
  }
  accountSecurityPage() {
    this.router.navigate([AppHelper.getRoutePath("account-security")]);
  }
}
