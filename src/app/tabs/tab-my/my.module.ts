import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyPage } from './my.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      { path: '', component: MyPage },
      { path: 'my-detail', loadChildren: "./my-detail/my-detail.module#MyDetailPageModule" },
      { path: 'my-credential-management', loadChildren: "./my-credential-management/my-credential-management.module#MyCredentialManagementPageModule" },
  { path: 'my-credential-management-add', loadChildren: "./my-credential-management-add/my-credential-management-add.module#MyCredentialManagementAddPageModule" },

    ])
  ],
  declarations: [MyPage]
})
export class MyPageModule {}
