import { Platform } from "@ionic/angular";
import { AppHelper } from "./../../appHelper";
import { IdentityService } from "./../identity/identity.service";
import { BehaviorSubject, Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { filter } from "rxjs/operators";
import { StorageService } from "../storage-service.service";
type Mode = "dark" | "light";
@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private mode: Mode;
  private modeSource: Subject<Mode>;
  constructor(
    private storage: StorageService,
    private statusBar: StatusBar,
    private plt: Platform
  ) {
    this.modeSource = new BehaviorSubject(this.mode || ("" as any));
    this.initMode();
    this.toggleDarkTheme(true)
  }
  private async initMode() {
    const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`);
    this.mode = await this.storage.get("preferance_mode");
    prefersDark.addListener((e) => {
      if (!this.mode) {
        this.setModeSource(e.matches ? "dark" : "light");
      }
    });
    this.mode =
      this.mode ||
      (prefersDark.matches
        ? "dark"
        : document.body.classList.contains("dark")
        ? "dark"
        : "light");
    this.setModeSource(this.mode);
  }
  cachePreferanceMode(mode: Mode) {
    this.storage.set("preferance_mode", mode);
  }
  getModeSource() {
    return this.modeSource.asObservable().pipe(filter((r) => !!r));
  }
  setModeSource(mode: Mode) {
    this.modeSource.next(mode);
    this.toggleDarkTheme(mode == "dark");
  }
  private toggleDarkTheme(shouldToogle: boolean) {
    document.body.classList.toggle("dark", shouldToogle);
    this.setAppStatusBar(shouldToogle);
  }
  private async setAppStatusBar(dark: boolean) {
    await this.plt.ready();
    if (AppHelper.isApp() && this.plt.is("ios")) {
      this.statusBar.styleDefault();
    }
    if (AppHelper.isApp() && this.plt.is("android")) {
      // if (window['hcp'] && window['hcp'].getStatusBarHeight) {
      //   window['hcp'].getStatusBarHeight().then(height => {
      //     if (height) {
      //       document.body.style.marginTop = height + "px";
      //     } else {
      //       document.body.classList.add("cordova-android");
      //     }
      //   })
      // } else {
      //   document.body.classList.add("cordova-android");
      // }
      this.statusBar.show();
      this.statusBar.overlaysWebView(false);
      requestAnimationFrame(() => {
        if (dark) {
          // this.statusBar.hide();
          this.statusBar.backgroundColorByHexString("#ff000000");
          this.statusBar.styleBlackOpaque();
          this.statusBar.styleLightContent();
        } else {
          this.statusBar.backgroundColorByHexString("#fff9f9f9");
          this.statusBar.styleDefault();
        }
      });
    }
  }
}
