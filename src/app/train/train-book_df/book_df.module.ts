import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { TrainComponentsModule } from '../components/traincomponents.module';
import { TrainBookDfPage } from './book_df.page';
import { ConfirmCredentialInfoGuard } from 'src/app/guards/confirm-credential-info.guard';
import { AppDirectivesModule } from 'src/app/directives/directives.module';
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";

const routes: Routes = [
  {
    path: "",
    component: TrainBookDfPage,
    canActivate: [StylePageGuard,ConfirmCredentialInfoGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TmcComponentsModule,
    AppComponentsModule,
    TrainComponentsModule,
    AppDirectivesModule,
    MemberPipesModule
  ],
  declarations: [TrainBookDfPage]
})
export class TrainBookDfPageModule { }
