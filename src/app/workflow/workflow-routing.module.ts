import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { WorkflowComponentsModule } from './components/workflow-components.module';
export const routes: Routes = [
  {
    path: "workflow-list",
    loadChildren: () =>
      import("./workflow-list/workflow-list.module").then(
        m => m.WorkflowListPageModule
      )
  },
  {
    path: 'business-list',
    loadChildren: () => import('./business-list/business-list.module').then( m => m.BusinessListPageModule)
  },
  {
    path: 'add-apply',
    loadChildren: () => import('./add-apply/add-apply.module').then( m => m.AddApplyPageModule)
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
