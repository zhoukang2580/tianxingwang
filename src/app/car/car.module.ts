import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarRoutingModule } from "./car-routing.module";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { CallNumber } from "@ionic-native/call-number/ngx";
import { Clipboard } from "@ionic-native/clipboard/ngx";
@NgModule({
  declarations: [],
  imports: [CommonModule, CarRoutingModule],
  exports: [CarRoutingModule],
  providers: [InAppBrowser, CallNumber, Clipboard],
})
export class CarModule {}
