import { enableProdMode, ApplicationRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { hmrBootstrap } from "./hmr";
import { enableDebugTools } from "@angular/platform-browser";
import { ThemeService } from "./app/services/theme/theme.service";
import { AppHelper } from "./app/appHelper";
import { LoadingController } from "@ionic/angular";
// const module = window["module"];
try {
  console.log("url,locationurl", window.location.href);
  if (
    window["VConsole"] &&
    (AppHelper.isApp() || AppHelper.isWechatH5()) &&
    location.href.toLowerCase().includes("test")
  ) {
    if (window["vConsole"]) {
      window["vConsole"].destroy();
    }
    window["vConsole"] = new window["VConsole"]();
  }
  AppHelper.initlizeQueryParamers();
  console.log(
    "initlizeQueryParamers getQueryParamers ",
    AppHelper.getQueryParamers()
  );
} catch (e) {
  console.error(e);
}
const meta = document.createElement("meta");
const head = document.querySelector("head");
meta.content = `upgrade-insecure-requests`;
meta.httpEquiv = `Content-Security-Policy`;
const bootstrap = () =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(moduleRef => {
      // 为了设置模式
      moduleRef.injector.get(ThemeService);
      AppHelper.loadingController = moduleRef.injector.get(LoadingController);
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
