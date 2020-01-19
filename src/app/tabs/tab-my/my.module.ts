import { IonicModule } from '@ionic/angular';
import { RouterModule, Route } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyPage } from './my.page';
// import { TranslateModule } from '@ngx-translate/core';
import { AuthorityGuard } from 'src/app/guards/authority.guard';
import { AppDirectivesModule } from 'src/app/directives/directives.module';
let routes: Route[] = [
  { path: '', component: MyPage },

];
// (()=>{
//   routes=routes.map(r => {
//     if (r.loadChildren) {
//       return {
//         ...r,
//         canLoad: [AuthorityGuard]
//       }
//     }
//     if(r.component){
//       return {
//         ...r,
//         canActivate:[AuthorityGuard]
//       }
//     }
//     return r;
//   });
// })()
// .map(r => ({ ...r, canLoad: [AuthorityGuard] }));
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // TranslateModule.forChild(),
    RouterModule.forChild(routes),
    AppDirectivesModule
  ],
  declarations: [MyPage]
})
export class MyPageModule { }
