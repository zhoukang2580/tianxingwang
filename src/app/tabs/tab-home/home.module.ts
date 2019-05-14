import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HomePage } from "./home.page";
import { TmcGuard } from 'src/app/guards/tmc.guard';
import { AppcomponentsModule } from 'src/app/components/appcomponents.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: "", component: HomePage, canActivate: [TmcGuard] },
    ]),
    AppcomponentsModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
