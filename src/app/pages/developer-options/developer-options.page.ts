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
  private vConsole: any;
  private version: string;
  VConsole = VConsole;
  get currentVersion() {
    if (this.version) {
      return this.version;
    }
    this.version = this.flieService.getLocalHcpVersion();
    return this.version;
  };
  constructor(private navCtrl: NavController, private flieService: FileHelperService) { }
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
  }
  onLogChange(evt: CustomEvent) {
    const isLog = evt.detail.checked;
    if (isLog) {
      console.log = console.info;
    } else {
      console.log = _ => 0;
    }
  }
  onVConsoleChange(evt: CustomEvent) {
    const isShowVConsole = evt.detail.checked;
    if (isShowVConsole) {
      this.vConsole = new VConsole();
    } else {
      if (this.vConsole) {
        this.vConsole.destroy();
      }
    }
  }
}
