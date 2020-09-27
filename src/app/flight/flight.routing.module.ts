import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TmcGuard } from "../guards/tmc.guard";
import { FlightComponentsModule } from "./components/components.module";
import { ConfirmCredentialInfoGuard } from "../guards/confirm-credential-info.guard";
const routes: Routes = [
  {
    path: "search-flight",
    loadChildren: () =>
      import("./search-flight/search-flight.module").then(
        m => m.SearchFlightPageModule
      )
  },
  {
    path: "search-flight_en",
    loadChildren: () =>
      import("./search-flight_en/search-flight_en.module").then(
        m => m.SearchFlightEnPageModule
      )
  },
  {
    path: "selected-flight-bookinfos",
    loadChildren: () =>
      import("./selected-flight-bookinfos/selected-flight-bookinfos.module").then(
        m => m.SelectedFlightBookInfosPageModule
      )
  },
  {
    path: "flight-list",
    loadChildren: () =>
      import("./flight-list/flight-list.module").then(
        m => m.FlightListPageModule
      )
  },
  {
    path: "select-flight-city",
    loadChildren: () =>
      import("./select-flight-city/select-flight-city.module").then(
        m => m.SelectFlightCityPageModule
      )
  },
  {
    path: "flight-item-cabins",
    loadChildren: () =>
      import(
        "src/app/flight/flight-item-cabins/flight-item-cabins.module"
      ).then(m => m.FlightItemCabinsPageModule),
    canActivate: [TmcGuard]
  },
  {
    path: "flight-book",
    loadChildren: () =>
      import("src/app/flight/book/book.module").then(
        m => m.FlightBookPageModule
      )
  }
];
@NgModule({
  imports: [FlightComponentsModule, RouterModule.forChild(routes)],
  exports: [RouterModule, FlightComponentsModule]
})
export class FlightRoutingModule { }
