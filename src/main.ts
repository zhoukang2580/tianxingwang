import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
  if (window["cordova"]) {
    if (window["VConsole"]) {
      var vConsole = new window["VConsole"]();
    }
  }
}
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
