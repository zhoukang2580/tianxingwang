import { NgZone } from '@angular/core';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { Platform } from '@ionic/angular';

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
  isCanIgnore: boolean = true;
  isAndroidUpdating: boolean = true;// 是否正更新android apk
  constructor(private fileService: FileHelperService, private ngZone: NgZone, private plt: Platform) { }
  async ngOnInit() {
    this.appUpdate();
  }
  /**
   * 
   * @param silence 是否静默更新？
   */
  async hcpUpdate(silence: boolean = false) {
    try {
      this.isAndroidUpdating = false;
      const res = await this.fileService.checkHcpUpdate();
      if (res.isHcpCanUpdate) {
        this.isCanIgnore = res.ignore;
        if (res.ignore&&!silence) {// 如果静默安装，就不提示用户
          const ok = await AppHelper.alert(LanguageHelper.gethcpUpdateBaseDataTip(),
            true,
            LanguageHelper.getUpdateTip(),
            LanguageHelper.getIgnoreTip());
          this.forceUpdate = ok;
        } else {
          this.forceUpdate = true;
        }
        if(silence){
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
      console.log(`热更新失败，${JSON.stringify(e, null, 2)}`);
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
    if (this.plt.is("ios")) {
      this.iosUpdate();
      return false;
    }
    let silence;
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
      if (res.ignore) {
        const ok = await AppHelper.alert(LanguageHelper.getApkUpdateMessageTip(), true, LanguageHelper.getUpdateTip(), LanguageHelper.getIgnoreTip());
        if (!ok) {
          silence=true;// 用户选择静默安装
          // 静默安装
          this.hcpUpdate(true);
        } else {
          this.forceUpdate = true;
        }
      } else {
        this.forceUpdate = true;
      }
      this.isAndroidUpdating = true;
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
      if (apkPath && apkPath.includes(".apk")) {
        await this.fileService.openApk(apkPath);
      } else {
        this.hcpUpdate(silence);
      }
      this.forceUpdate = false;
    } catch (e) {
      this.forceUpdate = false;
      AppHelper.alert(e);
      this.hcpUpdate(silence);
    }
  }
  iosUpdate() {
    //TODO:
  }
}
