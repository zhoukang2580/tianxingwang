import { NgZone } from "@angular/core";
import { FileHelperService } from "src/app/services/file-helper.service";
import { Component, OnInit, HostBinding } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { Platform } from "@ionic/angular";
import { LogService } from "src/app/services/log/log.service";
import { ExceptionEntity } from "src/app/services/log/exception.entity";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";

@Component({
  selector: "app-update-comp",
  templateUrl: "./appupdate.component.html",
  styleUrls: ["./appupdate.component.scss"],
  providers: [SafariViewController],
})
export class AppUpdateComponent implements OnInit {
  updateInfo: {
    loaded: number;
    total: number;
    taskDesc?: string;
    progress?: string;
  };
  @HostBinding("class.forceUpdate") forceUpdate: boolean;
  isCanIgnore: boolean;
  private checkVersionDue = 5 * 1000;
  private timeoutId: any;
  constructor(
    private fileService: FileHelperService,
    private logService: LogService,
    private safariViewController: SafariViewController,
    private ngZone: NgZone,
    private plt: Platform
  ) {}
  async ngOnInit() {
    if (AppHelper.isApp()) {
      await this.appUpdate();
      this.startCheckVersion();
    }
    // this.appUpdate();
  }

  private startCheckVersion() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(async () => {
      try {
        const res = await this.fileService.checkIfVersionUpdated();
        this.forceUpdate = res.canUpdate;
        this.updateInfo = {} as any;
        this.updateInfo.taskDesc = "请您及时更新app";
        if (res.canUpdate) {
          await AppHelper.alert("请您及时更新app", true, "确定");
          await AppHelper.platform.ready();
          if (this.plt.is("ios")) {
            const url = encodeURI(
              `https://apps.apple.com/cn/app/${AppHelper.getAppStoreAppId()}`
            );
            this.safariViewController
              .show({ url, hidden: false })
              .subscribe((r) => {
                console.log("open url", url, r);
              });
          } else {
            if (res.updateUrl) {
              if (window["cordova"] && window["cordova"].InAppBrowser) {
                window.open(encodeURI(res.updateUrl), "_system");
              }else{
                window.open(encodeURI(res.updateUrl), "_blank");
              }
            }
          }
          this.startCheckVersion();
        }
      } catch (e) {
        console.error(e);
      }
    }, this.checkVersionDue);
  }
  /**
   *
   * @param silence 是否静默更新？
   */
  async hcpUpdate(silence: boolean = false) {
    try {
      const res = await this.fileService.checkHcpUpdate();
      if (res.isHcpCanUpdate) {
        this.isCanIgnore = res.ignore;
        const tip =
          res.updateDescriptions &&
          res.updateDescriptions.some((it) => it && !!it.length)
            ? res.updateDescriptions.join(";")
            : LanguageHelper.gethcpUpdateBaseDataTip();
        if (res.ignore && !silence) {
          // 如果静默安装，就不提示用户
          const ok = await AppHelper.alert(
            tip,
            true,
            LanguageHelper.getUpdateTip(),
            LanguageHelper.getIgnoreTip()
          );
          this.forceUpdate = ok;
        } else {
          this.forceUpdate = true;
        }
        if (silence) {
          this.forceUpdate = false;
        }
        const filePath = await this.fileService.hcpUpdate((evt) => {
          this.ngZone.run(() => {
            this.updateInfo = {
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: "正在初始化...",
              progress: `${((evt.loaded * 100) / evt.total).toFixed(2)}%`,
            };
          });
        });
        // alert("filePath"+filePath)
        if (this.forceUpdate && filePath && filePath.includes("index.html")) {
          await this.fileService.openNewVersion(filePath);
        }
        // await this.fileService.loadHcpPage();
        this.forceUpdate = false;
      }
    } catch (e) {
      this.sendError("热更失败", e);
      this.forceUpdate = false;
      if (!this.isCanIgnore) {
        AppHelper.alert(LanguageHelper.getHcpUpdateErrorTip());
      }
    }
  }
  /**
   * apk 主版本升级,完成后执行热更新
   */
  async appUpdate() {
    try {
      const res = await this.fileService.checkAppUpdate((evt) => {
        this.ngZone.run(() => {
          this.updateInfo = {
            total: evt.total,
            loaded: evt.loaded,
            taskDesc: "正在初始化..." || evt.taskDesc,
            progress: `${((evt.loaded * 100) / evt.total).toFixed(2)}%`,
          };
        });
      });
      this.isCanIgnore = res.ignore;
      // 如果主版本不更新，检查热更
      if (!res.isCanUpdate) {
        this.hcpUpdate();
        return;
      }
      if (res.ignore) {
        this.forceUpdate = false;
        const ok = await AppHelper.alert(
          LanguageHelper.getApkUpdateMessageTip(),
          true,
          LanguageHelper.getUpdateTip(),
          LanguageHelper.getIgnoreTip()
        );
        this.forceUpdate = ok;
      } else {
        this.forceUpdate = true;
      }
      // 如果强制更新 app
      if (this.forceUpdate) {
        if (this.plt.is("ios")) {
          this.iosUpdate();
          return;
        }
        const apkPath = await this.fileService.updateApk((evt) => {
          const progress = `${((evt.loaded * 100) / evt.total).toFixed(2)}%`;
          this.ngZone.run(() => {
            this.updateInfo = {
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: "正在更新，请稍后..." || evt.taskDesc,
              progress,
            };
          });
        });
        console.log(
          `AppUpdateComponent appUpdate apkPath=${apkPath} ${
            apkPath && apkPath.includes(".apk")
          }`
        );
        if (apkPath && apkPath.includes(".apk")) {
          const ok = await AppHelper.alert(
            LanguageHelper.getApkReadyToBeInstalledTip(),
            true
          );
          if (ok) {
            await this.fileService.openApk(apkPath);
          }
        }
        this.forceUpdate = false;
      }
    } catch (e) {
      this.forceUpdate = false;
      if (!this.isCanIgnore) {
        AppHelper.alert(e);
      }
      this.sendError("Android app 更新失败", e);
    }
  }
  async iosUpdate() {
    try {
      const ok = await AppHelper.alert(
        `ios 更新需要跳转到 App Store，现在跳转更新？`,
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.forceUpdate = true;
        const url = encodeURI(
          `https://apps.apple.com/cn/app/${AppHelper.getAppStoreAppId()}`
        );
        await AppHelper.platform.ready();
        this.safariViewController
          .show({ url, hidden: false })
          .subscribe((r) => {
            console.log("open url", url, r);
          });
        this.forceUpdate = false;
      } else {
        this.forceUpdate = false;
      }
      // TODO:ios 跳转页面更新 app
    } catch (e) {
      this.forceUpdate = false;
      this.sendError(`ios app 更新失败`, e);
    }
  }
  sendError(msg: string, e: any) {
    try {
      const ex = new ExceptionEntity();
      ex.Error = e instanceof Error ? e.name : e;
      ex.Message = `${msg}, ${
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : JSON.stringify(e)
      }`;
      ex.Method = "app update";
      this.logService.addException(ex);
    } catch (e) {
      console.error(e);
    }
  }
}
