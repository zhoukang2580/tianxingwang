import { AgentGuard } from "../../guards/agent.guard";
import { AppDirectivesModule } from "../../directives/directives.module";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TmcHomePage } from "./tmc-home.page";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { AppHelper } from "src/app/appHelper";
const canActivate = [];
if (!AppHelper.isWechatMini()) {
  canActivate.push(TmcGuard);
}
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppComponentsModule,
    AppDirectivesModule,
    RouterModule.forChild([
      {
        path: "",
        component: TmcHomePage,
        canActivate,
      },
    ]),
  ],
  declarations: [TmcHomePage],
})
export class TmcHomePageModule {}
