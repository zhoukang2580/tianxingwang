import { MemberPipesModule } from 'src/app/member/pipe/pipe.module';
import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemberCredentialListPageRoutingModule } from './member-credential-list-routing.module';

import { MemberCredentialListPage } from './member-credential-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberCredentialListPageRoutingModule,
    AppComponentsModule,
    MemberPipesModule
  ],
  declarations: [MemberCredentialListPage]
})
export class MemberCredentialListPageModule { }
