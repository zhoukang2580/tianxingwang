import { environment } from 'src/environments/environment';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
const VConsole = window['VConsole'];
@Component({
  selector: 'app-developer-options',
  templateUrl: './developer-options.page.html',
  styleUrls: ['./developer-options.page.scss'],
})
export class DeveloperOptionsPage implements OnInit {
  private version: string;
  VConsole = VConsole;
  showLog = !environment.production;
  get vConsole() {
    return !!window['vConsole'];
  }
  get currentVersion() {
    if (this.version) {
      return this.version;
    }
    this.version = this.flieService.getLocalHcpVersion();
    return this.version;
  };
  constructor(private navCtrl: NavController, private flieService: FileHelperService) { }
  ngOnInit() {
  }
  onLogChange(evt: CustomEvent) {
    const isLog = evt.detail.checked;
    this.showLog = isLog;
    if (isLog) {
      console.log = console.info;
    } else {
      console.log = _ => 0;
    }
  }
  onVConsoleChange(evt: CustomEvent) {
    const isShowVConsole = evt.detail.checked;
    if (isShowVConsole) {
      if (window['vConsole']) {
        window['vConsole'].destroy();
        window['vConsole'] = null;
      }
      window['vConsole'] = new VConsole();
    } else {
      if (window['vConsole']) {
        window['vConsole'] = null;
        window['vConsole'].destroy();
      }
    }
  }
}
