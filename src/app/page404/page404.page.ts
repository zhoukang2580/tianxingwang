import { FileHelperService } from './../services/file-helper.service';
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { Route } from "@angular/router";
import { AppHelper } from '../appHelper';
import { Platform } from '@ionic/angular';
type Hcp = {
  openHcpPage: (url: string) => Promise<any>;
}
@Component({
  selector: "app-page404",
  templateUrl: "./page404.page.html",
  styleUrls: ["./page404.page.scss"]
})
export class Page404Page implements OnInit {
  curRoute: { url: string } = { url: null };
  info: any = {};
  hcp: Hcp;
  constructor(private route: ActivatedRoute, private router: Router, private fileService: FileHelperService, private plt: Platform) {
    this.plt.ready().then(() => {
      this.hcp = window['hcp'];
    })
  }

  ngOnInit() {
    this.fileService.checkHcpUpdate(r => {
      this.info.msg = r.taskDesc;
      this.info.progress = Math.floor(r.loaded / (r.total || 1) * 100).toFixed(2) + "%";
    })
      .then(nativeURL => {
        AppHelper.alert('是否打开新版本？' + nativeURL, true).then(ok => {
          if (ok) {
            window['hcp'] && window['hcp'].openHcpPage(nativeURL).then(res => {
              console.log(res);
            }).catch(e => {
              AppHelper.alert(e);
            });
          }
        });
      })
      .catch(e => {
        AppHelper.alert(e);
        console.log(JSON.stringify(e, null, 2));
      })
    console.log((this.curRoute.url = this.router.routerState.snapshot.url));
  }
}
