import { enableProdMode, ApplicationRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import 'babel-polyfill'// 解决android低版本打开白屏的问题
import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { hmrBootstrap } from "./hmr";
import { enableDebugTools } from "@angular/platform-browser";
import { ThemeService } from "./app/services/theme/theme.service";
import { AppHelper } from "./app/appHelper";
import {
  AlertController,
  LoadingController,
  ModalController,
  Platform,
  PopoverController,
  ToastController,
} from "@ionic/angular";
import { MapService } from "./app/services/map/map.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { CONFIG } from "./app/config";
// const module = window["module"];
try {
  AppHelper.initlizeQueryParamers();
  AppHelper.processPath();
  console.log("url,locationurl", window.location.href);
  changeAppTitle();
  initStyle();
  if (
    // true||
    window["VConsole"] &&
    (CONFIG.isShowVConsole ||
      window["isShowVConsole"] ||
      AppHelper.getQueryParamers()["isDebug"])
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
  window.addEventListener("message", (evt) => {
    AppHelper.windowMsgSource.emit(evt);
  });
} catch (e) {
  console.error(e);
}
// if (CONFIG.mockProBuild) {
//   const obj = AppHelper.getQueryParamers();
//   obj.style = "df";
// }
AppHelper.checkNetworkStatus();

function changeAppTitle() {
  const title = CONFIG.appTitle;
  if (title) {
    const el = document.querySelector("title");
    if (el) {
      el.textContent = title;
    }
  }
}
function initStyle() {
  const obj = AppHelper.getQueryParamers();
  obj.style =
    obj.style ||
    AppHelper.getStyle() ||
    AppHelper.getLanguage() ||
    CONFIG.defaultStyle;
  AppHelper.setStyle(obj.style);
  obj.language = obj.language || (obj.style == "en" ? "en" : "cn");
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((moduleRef) => {
    AppHelper.setHttpClient(moduleRef.injector.get(HttpClient));
    // 为了设置模式
    moduleRef.injector.get(ThemeService);
    AppHelper.Router = moduleRef.injector.get(Router);
    AppHelper.ActivatedRoute = moduleRef.injector.get(ActivatedRoute);
    AppHelper.loadingController = moduleRef.injector.get(LoadingController);
    AppHelper.platform = moduleRef.injector.get(Platform);
    AppHelper.setHttpClient(moduleRef.injector.get(HttpClient));
    AppHelper.setAlertController(moduleRef.injector.get(AlertController));
    AppHelper.setToastController(moduleRef.injector.get(ToastController));
    AppHelper.setModalController(moduleRef.injector.get(ModalController));
    AppHelper.setPopoverController(moduleRef.injector.get(PopoverController));
    return moduleRef;
  })
  .catch((err) => console.log(err));
