import { enableProdMode, ApplicationRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { hmrBootstrap } from "./hmr";
import { enableDebugTools } from "@angular/platform-browser";
import { ThemeService } from './app/services/theme/theme.service';
// const module = window["module"];
const meta = document.createElement("meta");
const head = document.querySelector("head");
meta.content = `upgrade-insecure-requests`;
meta.httpEquiv = `Content-Security-Policy`;
const bootstrap = () =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(moduleRef => {
      // 为了设置模式)
      moduleRef.injector.get(ThemeService);
      return moduleRef;
    })
    .catch(err => {
      console.log(err);
      return null;
    });
if (environment.production) {
  if (!environment.mockProBuild) {
    // head.appendChild(meta);
  }
  enableProdMode();
  bootstrap();
  // if (window["VConsole"]) {
  //   if( window['vConsole'] ){
  //     window['vConsole'] .destroy();
  //   }
  //   window['vConsole'] = new window["VConsole"]();
  // }
} else {
  // if (window["cordova"]||navigator.userAgent.toLowerCase().includes("iphone")) {
  //   if (window["VConsole"]) {
  //     if (window['vConsole']) {
  //       window['vConsole'].destroy();
  //     }
  //     window['vConsole'] = new window["VConsole"]();
  //   }
  // }
  // if (window["VConsole"]) {
  //   if( window['vConsole'] ){
  //     window['vConsole'] .destroy();
  //   }
  //   window['vConsole'] = new window["VConsole"]();
  // }
  console.log(module);
  if (module["hot"]) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.log("Amm..HMR is not enabled for webpack");
    bootstrap().then(moduleRef => {
      const applicationRef = moduleRef.injector.get(ApplicationRef);
      const appComponent = applicationRef.components[0];
      enableDebugTools(appComponent);
    });
  }
}