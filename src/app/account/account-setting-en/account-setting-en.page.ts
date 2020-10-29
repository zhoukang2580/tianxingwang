import { Subscription } from "rxjs";
import { AppHelper } from "../../appHelper";
import { LoginService } from "../../services/login/login.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ActionSheetController, NavController } from "@ionic/angular";
import { ThemeService } from "src/app/services/theme/theme.service";
import { TTSService } from "src/app/services/tts/tts.service";
import { CONFIG } from "src/app/config";
import { AccountSettingPage } from '../account-setting/account-setting.page';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: "app-setting-en",
  templateUrl: "./account-setting-en.page.html",
  styleUrls: ["./account-setting-en.page.scss"],
})
export class AccountSettingEnPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  appVersion: string = "3.0.1";
  isDarkMode: boolean;
  ttsEnabled = false;
  isShowTTsOption = true;
  constructor(
    private loginService: LoginService,
    private router: Router,
    private navCtrl: NavController,
    private themeService: ThemeService,
    private ttsService: TTSService,
    private actionSheetCtrl: ActionSheetController,
    private langService: LangService
  ) {
    this.ttsEnabled = ttsService.getEnabled();
    if (CONFIG["accountSetting"]) {
      this.isShowTTsOption = CONFIG["accountSetting"].isShowTTS;
    }
  }
  back() {
    this.navCtrl.pop();
  }
  private reloadPage() {
    this.router
      .navigate([AppHelper.getRoutePath(this.router.url)], { replaceUrl: true })
      .then(() => {
        this.langService.translate();
      });
  }
  async onLanguageSettings() {
    const style = AppHelper.getStyle();
    const ash = await this.actionSheetCtrl.create({
      cssClass: "language",
      buttons: [
        {
          text: "English",
          cssClass: "notranslate",
          role: style == "en" ? "selected" : "",
          handler: () => {
            this.langService.setLang("en");
            this.reloadPage();
          },
        },
        {
          text: "中文",
          cssClass: "notranslate",
          role: !style ? "selected" : "",
          handler: () => {
            this.langService.setLang("");
            this.reloadPage();
          },
        },
        {
          text: "取消",
          role: "destructive",
          handler: () => {
            ash.dismiss();
          },
        },
      ],
    });
    ash.present();
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
