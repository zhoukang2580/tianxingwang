import { Platform } from '@ionic/angular';
import { AppHelper } from './../../appHelper';
import { IdentityService } from './../identity/identity.service';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
type Mode = "dark" | "light";
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private mode: Mode;
  private modeSource: Subject<Mode>;
  constructor(private storage: Storage, private statusBar: StatusBar, private plt: Platform) {
    const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`);
    prefersDark.addListener(e => this.setModeSource(e.matches ? "dark" : "light"));
    this.mode = prefersDark.matches ? "dark" : this.storage.get("preferance_mode") || document.body.classList.contains("dark") ? 'dark' : "light";
    this.modeSource = new BehaviorSubject(this.mode);
  }
  getModeSource() {
    return this.modeSource.asObservable();
  }
  setModeSource(mode: Mode) {
    this.toggleDarkTheme(mode == 'dark');
  }
  private toggleDarkTheme(shouldToogle: boolean) {
    document.body.classList.toggle("dark", shouldToogle);
    if (AppHelper.isApp() && this.plt.is("android")) {
      if (!shouldToogle) {
        this.statusBar.styleDefault()
      } else {
        this.statusBar.styleLightContent();
      }
    }
  }
}
