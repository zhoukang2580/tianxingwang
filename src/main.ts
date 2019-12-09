import { AppHelper } from './app/appHelper';
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
  // if (window["VConsole"]) {
  //   if( window['vConsole'] ){
  //     window['vConsole'] .destroy();
  //   }
  //   window['vConsole'] = new window["VConsole"]();
  // }

} else {
  if (window["cordova"]) {
    if (window["VConsole"]) {
      if (window['vConsole']) {
        window['vConsole'].destroy();
      }
      window['vConsole'] = new window["VConsole"]();
    }
  }
  // if (window["VConsole"]) {
  //   if( window['vConsole'] ){
  //     window['vConsole'] .destroy();
  //   }
  //   window['vConsole'] = new window["VConsole"]();
  // }
}
if (AppHelper.isWechatH5) {
  document.body.addEventListener('touchmove', function (e) {
    // console.log('indexhtml script e',e,window._isPreventDefault)
    if (window['_isPreventDefault'])
      e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
  }, { passive: false }); //passive 参数不能省略，用来兼容ios和android 
}
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
