import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { mdTransitionAnimation } from "./animations/md.transition";
import { iosTransitionAnimation } from "./animations/ios-transition";
import { NgModule, ErrorHandler, Injector } from "@angular/core";
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
import { Keyboard } from "@ionic-native/keyboard/ngx";
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
import { IonicStorageModule } from '@ionic/storage-angular';
import { Animation } from "./animations/animation-interface";
import { FileHelperService } from './services/file-helper.service';
import { AppHelper } from './appHelper';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Clipboard } from "@ionic-native/clipboard/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
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
    ReactiveFormsModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    FormBuilder,
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
      deps: [LogService,LoadingController,Platform]
    },
    Zip,
    File,
    InAppBrowser,
    Clipboard,
    AppVersion,
    WebView,
    Geolocation
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router, plt: Platform) {
    curPlt = plt.is("ios") ? "ios" : "md";
    console.log("AppModule", router.config);
  }
}