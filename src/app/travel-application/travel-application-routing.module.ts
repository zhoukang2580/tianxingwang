import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

export const routes: Routes = [
  {
    path: 'business-list',
    loadChildren: () => import('./business-list/business-list.module').then(m => m.BusinessListPageModule)
  },
  {
    path: 'add-apply',
    loadChildren: () => import('./add-apply/add-apply.module').then(m => m.AddApplyPageModule)
  },
  {
    path: 'travel-apply-detail',
    loadChildren: () => import('./travel-apply-detail/travel-apply-detail.module').then( m => m.TravelApplyDetailPageModule)
  },
  {
    path: 'approval-tack',
    loadChildren: () => import('./approval-task/approval-task.module').then( m => m.ApprovalTackPageModule)
  },


];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelApplicationRoutingModule { }

