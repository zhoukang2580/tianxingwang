import { IonicModule } from '@ionic/angular';
import { RouterModule, Route } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyPage } from './my.page';
import { TranslateModule } from '@ngx-translate/core';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
let routes: Route[] = [
  { path: '', component: MyPage },
  { path: 'my-detail', loadChildren: "./my-detail/my-detail.module#MyDetailPageModule" },
  {
    path: 'my-credential-management',
    loadChildren: "./my-credential-management/my-credential-management.module#MyCredentialManagementPageModule"
  },
  {
    path: 'my-credential-management-add',
    loadChildren: "./my-credential-management-add/my-credential-management-add.module#MyCredentialManagementAddPageModule"
  }

];
(()=>{
  routes=routes.map(r => {
    if (r.loadChildren) {
      return {
        ...r,
        canLoad: [AuthorityGuard]
      }
    }
    if(r.component){
      return {
        ...r,
        canActivate:[AuthorityGuard]
      }
    }
    return r;
  });
})()
// .map(r => ({ ...r, canLoad: [AuthorityGuard] }));
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [MyPage]
})
export class MyPageModule { }
