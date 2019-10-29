import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConfirmCredentialInfoGuard } from '../guards/confirm-credential-info.guard';
export const routes: Routes = [
  {
    path: "train-list",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: "./train-list/train-list.module#TrainListPageModule"
  },
  {
    path: "search-train",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: "./search-train/search-train.module#SearchTrainPageModule"
  },
  {
    path: "train-book",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: "./train-book/book.module#TrainBookPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainRoutingModule { }
