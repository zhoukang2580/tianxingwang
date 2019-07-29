import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
export const routes: Routes = [
  {
    path: "train-list",
    loadChildren: "./train-list/train-list.module#TrainListPageModule"
  },
  { path: 'search-train', loadChildren: './search-train/search-train.module#SearchTrainPageModule' }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TainRoutingModule {}
