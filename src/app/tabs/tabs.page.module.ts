import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TabsPage } from "./tabs.page";
import { TabsRoutingModule } from "./tabs-routing.module";

@NgModule({
  declarations: [TabsPage],
  imports: [IonicModule, CommonModule, FormsModule, TabsRoutingModule],
  exports: []
})
export class TabsPageModule {}
