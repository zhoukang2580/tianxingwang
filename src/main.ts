import { enableProdMode, ApplicationRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { hmrBootstrap } from "./hmr";
import { enableDebugTools } from "@angular/platform-browser";
import { ThemeService } from "./app/services/theme/theme.service";
import { AppHelper } from "./app/appHelper";
import { LoadingController } from "@ionic/angular";
import { MapService } from "./app/services/map/map.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { CONFIG } from "./app/config";
// const module = window["module"];
try {
  AppHelper.initlizeQueryParamers();
  processPath();
  console.log("url,locationurl", window.location.href);
  changeAppTitle();
  if (
    // true||
    window["VConsole"] &&
    CONFIG.isShowVConsole
  ) {
    if (window["vConsole"]) {
      window["vConsole"].destroy();
    }
    window["vConsole"] = new window["VConsole"]();
  }
  console.log(
    "initlizeQueryParamers getQueryParamers ",
    AppHelper.getQueryParamers()
  );
} catch (e) {
  console.error(e);
}
function changeAppTitle() {
  const title = CONFIG.appTitle;
  if (title) {
    const el = document.querySelector("title");
    if (el) {
      el.textContent = title;
    }
  }
}
function processPath() {
  const query = AppHelper.getQueryParamers();
  let hrefPath = AppHelper.getNormalizedPath(window.location.href);
  if (query) {
    if (hrefPath) {
      if (!query.path && hrefPath) {
        query.path = hrefPath.startsWith("http") ? "" : hrefPath;
      }
    }
    if (
      query.unroutehome &&
      (query.unroutehome as string).toLowerCase().includes("true")
    ) {
      if ((query.unroutehome as string).includes("#")) {
        const [unroutehome, path] = (query.unroutehome as string).split("#");
        query.unroutehome = unroutehome;
        query.path = path;
      }
    }
    const path2 = query.path;
    query.path = AppHelper.getNormalizedPath(path2);
  }
}
const meta = document.createElement("meta");
const head = document.querySelector("head");
meta.content = `upgrade-insecure-requests`;
meta.httpEquiv = `Content-Security-Policy`;
const bootstrap = () =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((moduleRef) => {
      AppHelper.setHttpClient(moduleRef.injector.get(HttpClient));
      // 为了设置模式
      moduleRef.injector.get(ThemeService);
      AppHelper.Router = moduleRef.injector.get(Router);
      AppHelper.ActivatedRoute = moduleRef.injector.get(ActivatedRoute);
      moduleRef.injector.get(MapService);
      AppHelper.loadingController = moduleRef.injector.get(LoadingController);
      return moduleRef;
    })
    .catch((err) => {
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
    bootstrap().then((moduleRef) => {
      const applicationRef = moduleRef.injector.get(ApplicationRef);
      const appComponent = applicationRef.components[0];
      enableDebugTools(appComponent);
    });
  }
}
