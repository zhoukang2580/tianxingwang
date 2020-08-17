import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarRoutingModule } from "./car-routing.module";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';

@NgModule({
  declarations: [],
  imports: [CommonModule, CarRoutingModule],
  exports: [CarRoutingModule],
  providers:[SafariViewController]
})
export class CarModule {}
