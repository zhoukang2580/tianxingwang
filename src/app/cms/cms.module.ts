import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "bulletin-list",
    loadChildren: () =>
      import("./bulletin-list/bulletin-list.module").then(
        m => m.BulletinListPageModule
      )
  },
  {
    path: "view-bulletin-detail",
    loadChildren: () =>
      import("./view-detail/view-detail.module").then(
        m => m.ViewDetailPageModule
      )
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmsModule {}
