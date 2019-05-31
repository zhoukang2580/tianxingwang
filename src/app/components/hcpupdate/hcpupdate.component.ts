import { NgZone } from '@angular/core';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { App } from 'src/app/app.component';

@Component({
  selector: 'app-hcpupdate-comp',
  templateUrl: './hcpupdate.component.html',
  styleUrls: ['./hcpupdate.component.scss'],
})
export class HcpupdateComponent implements OnInit {
  hcpUpdateInfo: {
    loaded: number;
    total: number;
    taskDesc?: string;
    progress?: string;
  };
  app: App;
  @HostBinding('class.forceUpdate')
  forceUpdate: boolean;
  isCanIgnore: boolean = true;
  constructor(private fileService: FileHelperService, private ngZone: NgZone) { }
  async ngOnInit() {
    this.hcpUpdate();
  }
  async hcpUpdate() {
    try {
      const res = await this.fileService.checkHcpUpdate();
      if (res.isHcpCanUpdate) {
        this.isCanIgnore = res.ignore;
        if (res.ignore) {
          const ok = await AppHelper.alert(LanguageHelper.gethcpUpdateBaseDataTip(),
            true,
            LanguageHelper.getUpdateTip(),
            LanguageHelper.getIgnoreTip());
          this.forceUpdate = ok;
        } else {
          this.forceUpdate = true;
        }
        const filePath = await this.fileService.hcpUpdate(evt => {
          this.ngZone.run(() => {
            this.hcpUpdateInfo = {
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
}
