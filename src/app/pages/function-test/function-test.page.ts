import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { Platform, IonApp } from '@ionic/angular';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { App } from 'src/app/app.component';
import { LanguageHelper } from 'src/app/languageHelper';
import { AppVersion } from '@ionic-native/app-version/ngx';
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
  curVersion:string;
  app: App;
  showHcp: boolean = false;
  color:string;
  colors=["primary","secondary","tertiary","warning","mediun","dark","light","danger"];
  constructor(private fileService: FileHelperService,
    private router: Router,
    private plt: Platform) {
    this.plt.ready().then(async() => {
      this.hcp = window['hcp'];
      this.app = navigator['app'];
      this.curVersion=fileService.getLocalHcpVersion();
    });
  }
  showModal() {
    // this.router.navigate([AppHelper.getRoutePath('scan')]);
    this.showHcp = !this.showHcp;
  }
  async testHcp() {

  }
  ngOnInit() {
    this.color=this.colors[Math.floor(Math.random()*this.colors.length)];
  }

}
