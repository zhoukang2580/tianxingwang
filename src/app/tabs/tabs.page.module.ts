import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TabsPage } from "./tabs.page";
import { TabsRoutingModule } from "./tabs-routing.module";
import { AppDirectivesModule } from 'src/app/directives/directives.module';

@NgModule({
  declarations: [TabsPage],
  imports: [IonicModule, CommonModule, FormsModule, TabsRoutingModule,AppDirectivesModule],
  exports: []
})
export class TabsPageModule {}
