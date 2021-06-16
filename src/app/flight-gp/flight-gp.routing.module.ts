import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TmcGuard } from "../guards/tmc.guard";
import { FlightGpComponentsModule } from "./components/components.module";
const routes: Routes = [
  {
    path: "search-flight-gp",
    loadChildren: () =>
      import("./search-flight-gp/search-flight-gp.module").then(
        (m) => m.SearchFlightGpPageModule
      ),
  },
  {
    path: "flight-gp-list",
    loadChildren: () =>
      import("./flight-gp-list/flight-gp-list.module").then(
        (m) => m.FlightGpListPageModule
      ),
  },
  {
    path: "select-flight-city",
    loadChildren: () =>
      import("./select-flight-city/select-flight-city.module").then(
        (m) => m.SelectFlightCityPageModule
      ),
  },
  {
    path: "flight-gp-item-cabins",
    loadChildren: () =>
      import("./flight-gp-item-cabins/flight-gp-item-cabins.module").then(
        (m) => m.FlightGpItemCabinsPageModule
      ),
    canActivate: [TmcGuard],
  },
  {
    path: "flight-gp-bookinfos",
    loadChildren: () =>
      import("./flight-gp-bookinfos/flight-gp-bookinfos.module").then(
        (m) => m.FlightGpBookinfosPageModule
      ),
  },
  {
    path: "flight-gp-add-passenger",
    loadChildren: () =>
      import("./flight-gp-add-passenger/flight-gp-add-passenger.module").then(
        (m) => m.FlightGpAddPassengerPageModule
      ),
  },
  {
    path: "flight-gp-update-passenger",
    loadChildren: () =>
      import("./flight-gp-update-passenger/flight-gp-update-passenger.module").then(
        (m) => m.FlightGpUpdatePassengerPagePageModule
      ),
  },
  {
    path: "select-passenger-gp",
    loadChildren: () =>
      import("./select-passenger-gp/select-passenger-gp.module").then(
        (m) => m.SelectPassengerGpPageModule
      ),
  },
  {
    path: "select-flight-gp-bank",
    loadChildren: () =>
      import("./select-flight-gp-bank/select-flight-gp-bank.module").then(
        (m) => m.SelectFlightGpBankPageModule
      ),
  },
  {
    path: "selected-confirm-bookinfos-gp",
    loadChildren: () =>
      import("./selected-confirm-bookinfos-gp/selected-confirm-bookinfos-gp.module").then(
        (m) => m.SelectedConfirmBookInfosGpPageModule
      ),
  }
];
@NgModule({
  imports: [ RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightGpRoutingModule {}
