import { AppHelper } from "src/app/appHelper";
import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy, Router } from "@angular/router";
import {
  IonicModule,
  IonicRouteStrategy,
  LoadingController
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { AppErrorHandler } from "./appErrorHandler";
import { LogService } from "./services/log/log.service";
// import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { environment } from "src/environments/environment";
// import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AppComponentsModule } from "./components/appcomponents.module";
import { Zip } from "@ionic-native/zip/ngx";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";
import { File } from "@ionic-native/file/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { IonicStorageModule } from "@ionic/storage";
import { Animation, AnimationBuilder, AnimationController } from "@ionic/core";
export function navAnimations(AnimationC: Animation, baseEl) {
  const animation: Animation = new AnimationC();
  animation
    .addElement(baseEl)
    .easing("cubic-bezier(0.32,0.72,0,1)")
    .beforeStyles({ opacity: 1 })
    .fromTo("translateX", "-100%", 0)
    .fromTo("opacity", 0, 1)
    .duration(300);
  console.log("baseEl", baseEl);
  return Promise.resolve(animation);
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      backButtonIcon: "arrow-back",
      backButtonText: "",
      loadingSpinner: "crescent",
      swipeBackEnabled: false,
      hardwareBackButton: !true,
      // navAnimation: navAnimations
    }),
    HttpClientModule,
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: HttpLoaderFactory,
    //     deps: [HttpClient]
    //   }
    // }),
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
    BarcodeScanner,
    File,
    AppVersion,
    WebView
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router) {
    console.log("AppModule", router.config);
  }
}
// export function HttpLoaderFactory(http: HttpClient) {
//   if (environment.production && AppHelper.isH5()) {
//     // 非手机上运行，生成阶段
//     return new TranslateHttpLoader(http, "/www/assets/i18n/", ".json");
//   }
//   return new TranslateHttpLoader(http, "/assets/i18n/", ".json");
// }
