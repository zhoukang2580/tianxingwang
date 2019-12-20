import { NgZone } from '@angular/core';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { Platform } from '@ionic/angular';
import { LogService } from 'src/app/services/log/log.service';
import { ExceptionEntity } from 'src/app/services/log/exception.entity';

@Component({
  selector: 'app-update-comp',
  templateUrl: './appupdate.component.html',
  styleUrls: ['./appupdate.component.scss'],
})
export class AppUpdateComponent implements OnInit {
  updateInfo: {
    loaded: number;
    total: number;
    taskDesc?: string;
    progress?: string;
  };
  @HostBinding('class.forceUpdate')
  forceUpdate: boolean;
  isCanIgnore: boolean;
  constructor(private fileService: FileHelperService,
    private logService: LogService,
    private ngZone: NgZone, private plt: Platform) { }
  async ngOnInit() {
    if(AppHelper.isApp()){
      this.appUpdate();
    }
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
        if (res.ignore && !silence) {// 如果静默安装，就不提示用户
          const ok = await AppHelper.alert(LanguageHelper.gethcpUpdateBaseDataTip(),
            true,
            LanguageHelper.getUpdateTip(),
            LanguageHelper.getIgnoreTip());
          this.forceUpdate = ok;
        } else {
          this.forceUpdate = true;
        }
        if (silence) {
          this.forceUpdate = false;
        }
        const filePath = await this.fileService.hcpUpdate(evt => {
          this.ngZone.run(() => {
            this.updateInfo = {
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: evt.taskDesc,
              progress: `${(evt.loaded * 100 / evt.total).toFixed(2)}%`
            };
          });
        });
        if (this.forceUpdate && filePath.includes("index.html")) {
          await this.fileService.openNewVersion(filePath);
        }
        this.forceUpdate = false;
      }
    } catch (e) {
      this.sendError('热更失败', e);
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
      const res = await this.fileService.checkAppUpdate(evt => {
        this.ngZone.run(() => {
          this.updateInfo = {
            total: evt.total,
            loaded: evt.loaded,
            taskDesc: evt.taskDesc,
            progress: `${(evt.loaded * 100 / evt.total).toFixed(2)}%`
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
          true, LanguageHelper.getUpdateTip(), LanguageHelper.getIgnoreTip());
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
        const apkPath = await this.fileService.updateApk(evt => {
          const progress = `${(evt.loaded * 100 / evt.total).toFixed(2)}%`;
          this.ngZone.run(() => {
            this.updateInfo = {
              total: evt.total,
              loaded: evt.loaded,
              taskDesc: evt.taskDesc,
              progress
            };
          });
        });
        console.log(`AppUpdateComponent appUpdate apkPath=${apkPath} ${apkPath && apkPath.includes(".apk")}`);
        if (apkPath && apkPath.includes(".apk")) {
          const ok = await AppHelper.alert(LanguageHelper.getApkReadyToBeInstalledTip(), true);
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
     const ok =  await AppHelper.alert(`ios 更新需要跳转到 App Store，现在跳转更新？`, true,LanguageHelper.getConfirmTip(),LanguageHelper.getCancelTip());
     if(ok){
       this.forceUpdate=true;
       window.location.href=encodeURIComponent(`https://apps.apple.com/cn/app/东美在线/id1347643172`);
     }else{
       this.forceUpdate=false;
     }
      //TODO:ios 跳转页面更新 app
    } catch (e) {
      this.forceUpdate = false;
      this.sendError(`ios app 更新失败`, e);
    }
  }
  sendError(msg: string, e: any) {
    try {
      const ex = new ExceptionEntity();
      ex.Error = e instanceof Error ? e.name : e;
      ex.Message = `${msg}, ${e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e)}`;
      ex.Method = "app update";
      this.logService.sendException(ex);
    } catch (e) {
      console.error(e);
    }

  }
}
