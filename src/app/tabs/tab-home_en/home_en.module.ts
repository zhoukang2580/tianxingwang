import { AgentGuard } from "./../../guards/agent.guard";
import { AppDirectivesModule } from "../../directives/directives.module";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HomeEnPage } from "./home_en.page";
import { TmcGuard } from "src/app/guards/tmc.guard";
import { AppComponentsModule } from "src/app/components/appcomponents.module";

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
        component: HomeEnPage,
        canActivate: [TmcGuard]
      }
    ])
  ],
  declarations: [HomeEnPage]
})
export class HomeEnPageModule {}
