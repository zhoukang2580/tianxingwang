import { mdTransitionAnimation } from "./animations/md.transition";
import { iosTransitionAnimation } from "./animations/ios-transition";
import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy, Router } from "@angular/router";
import {
  IonicModule,
  IonicRouteStrategy,
  LoadingController,
  Platform
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { AppErrorHandler } from "./appErrorHandler";
import { LogService } from "./services/log/log.service";
import { environment } from "src/environments/environment";
import { AppComponentsModule } from "./components/appcomponents.module";
import { Zip } from "@ionic-native/zip/ngx";
import { File } from "@ionic-native/file/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { IonicStorageModule } from "@ionic/storage";
import { Animation } from "./animations/animation-interface";
let curPlt: "ios" | "md";
export function navAnimations(baseEl, opts) {
  const animation =
    curPlt == "ios"
      ? iosTransitionAnimation(baseEl, opts)
      : mdTransitionAnimation(baseEl, opts);
  return animation;
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      backButtonText: "",
      loadingSpinner: "crescent",
      swipeBackEnabled: false,
      hardwareBackButton: !true,
      refreshingIcon: "bubbles",
      refreshingSpinner: "crescent",
      navAnimation: navAnimations as any
    }),
    HttpClientModule,
    AppRoutingModule,
    AppComponentsModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
      deps: [LogService, LoadingController]
    },
    Zip,
    File,
    AppVersion,
    WebView
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router, plt: Platform) {
    curPlt = plt.is("ios") ? "ios" : "md";
    console.log("AppModule", router.config);
  }
}