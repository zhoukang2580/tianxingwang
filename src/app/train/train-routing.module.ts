import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConfirmCredentialInfoGuard } from "../guards/confirm-credential-info.guard";
export const routes: Routes = [
  {
    path: "train-list",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: () =>
      import("./train-list/train-list.module").then(m => m.TrainListPageModule)
  },
  {
    path: "train-list_en",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: () =>
      import("./train-list_en/train-list_en.module").then(m => m.TrainListEnPageModule)
  },
  {
    path: "search-train",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: () =>
      import("./search-train/search-train.module").then(
        m => m.SearchTrainPageModule
      )
  },
  {
    path: "search-train_en",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: () =>
      import("./search-train_en/search-train_en.module").then(
        m => m.SearchTrainEnPageModule
      )
  },
  {
    path: "select-station",
    loadChildren: () =>
      import("./select-station/select-station.module").then(
        m => m.SelectStationPageModule
      )
  },
  {
    path: "select-station_df",
    loadChildren: () =>
      import("./select-station-df/select-station-df.module").then(
        m => m.SelectStationDfPageModule
      )
  },
  {
    path: "train-book",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: () =>
      import("./train-book/book.module").then(m => m.TrainBookPageModule)
  },
  {
    path: "train-book_en",
    canActivate: [ConfirmCredentialInfoGuard],
    loadChildren: () =>
      import("./train-book_en/book.module_en").then(m => m.TrainBookEnPageModule)
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainRoutingModule {}
