import { Component, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { Platform, IonApp } from '@ionic/angular';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { App } from 'src/app/app.component';
type Hcp = {
  openHcpPage: (url: string) => Promise<any>;
};

@Component({
  selector: 'app-function-test',
  templateUrl: './function-test.page.html',
  styleUrls: ['./function-test.page.scss'],
})
export class FunctionTestPage implements OnInit {
  info: any = {};
  hcp: Hcp;
  app: App;
  constructor(private fileService: FileHelperService,
    private plt: Platform) {
    this.plt.ready().then(() => {
      this.hcp = window['hcp'];
      this.app = navigator['app'];
    });
  }
  showModal() {
    AppHelper.showConfirmPage("确定", "取消")
      .then(data => {
        console.log(data);
      });
  }
  testHcp() {
    this.fileService.checkHcpUpdate(r => {
      this.info.msg = r.taskDesc;
      this.info.progress = Math.floor(r.loaded / (r.total || 1) * 100).toFixed(2) + "%";
    }, `assets/${this.fileService.updateZipFileName}`)
      .then(nativeURL => {
        AppHelper.alert('数据加载完成，重新打开以生效？' + nativeURL, true).then(ok => {
          if (ok) {
            this.hcp.openHcpPage(nativeURL).then(res => {
              console.log(res);
            }).catch(e => {
              AppHelper.alert(e);
            });
            // this.app.clearHistory();
            // this.app.loadUrl(nativeURL);
            // this.app.exitApp();
          }
        });
      })
      .catch(e => {
        this.info = {};
        AppHelper.alert(e);
        console.log(JSON.stringify(e, null, 2));
      });
  }
  ngOnInit() {
  }

}
