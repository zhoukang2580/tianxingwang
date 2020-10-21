import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

export const routes: Routes = [
  {
    path: "approval-task",
    loadChildren: () =>
      import("./approval-task/approval-task.module").then(
        (m) => m.ApprovalTaskPageModule
      ),
  },
  {
    path: "approval-task_en",
    loadChildren: () =>
      import("./approval-task_en/approval-task_en.module").then(
        (m) => m.ApprovalTaskEnPageModule
      ),
  },
  {
    path: 'business-list',
    loadChildren: () => import('./business-list/business-list.module').then(m => m.BusinessListPageModule)
  },
  {
    path: 'business-list_en',
    loadChildren: () => import('./business-list_en/business-list_en.module').then(m => m.BusinessListEnPageModule)
  },
  {
    path: 'add-apply',
    loadChildren: () => import('./add-apply/add-apply.module').then(m => m.AddApplyPageModule)
  },
  {
    path: 'add-apply_en',
    loadChildren: () => import('./add-apply_en/add-apply_en.module').then(m => m.AddApplyEnPageModule)
  },
  {
    path: 'travel-apply-detail',
    loadChildren: () => import('./travel-apply-detail/travel-apply-detail.module').then( m => m.TravelApplyDetailPageModule)
  },
  {
    path: 'travel-apply-detail_en',
    loadChildren: () => import('./travel-apply-detail_en/travel-apply-detail_en.module').then( m => m.TravelApplyDetailEnPageModule)
  },



];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelApplicationRoutingModule { }

