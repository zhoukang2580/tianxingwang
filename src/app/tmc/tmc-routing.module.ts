import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
export const routes: Routes = [
  {
    path: "switch-company",
    loadChildren: () =>
      import("./switch-company/switch-company.module").then(
        m => m.SwitchCompanyPageModule
      )
  },
  {
    path: "select-passenger",
    loadChildren: () =>
      import("./select-passenger/select-passenger.module").then(
        m => m.SelectPassengerPageModule
      )
  },
  {
    path: "select-passenger_en",
    loadChildren: () =>
      import("./select-passenger_en/select-passenger_en.module").then(
        m => m.SelectPassengerEnPageModule
      )
  },
  {
    path: "select-passenger-df",
    loadChildren: () =>
      import("./select-passenger-df/select-passenger-df.module").then(
        m => m.SelectPassengerDfPageModule
      )
  }

];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TmcRoutingModule {}
