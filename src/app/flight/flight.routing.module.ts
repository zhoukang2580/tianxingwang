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
        (m) => m.SearchFlightPageModule
      ),
  },
  {
    path: "search-flight_en",
    loadChildren: () =>
      import("./search-flight_en/search-flight_en.module").then(
        (m) => m.SearchFlightEnPageModule
      ),
  },
  {
    path: "search-flight_df",
    loadChildren: () =>
      import("./search-flight_df/search-flight-df.module").then(
        (m) => m.SearchFlightDfPageModule
      ),
  },
  {
    path: "selected-flight-bookinfos",
    loadChildren: () =>
      import(
        "./selected-flight-bookinfos/selected-flight-bookinfos.module"
      ).then((m) => m.SelectedFlightBookInfosPageModule),
  },
  {
    path: "selected-flight-bookinfos_en",
    loadChildren: () =>
      import(
        "./selected-flight-bookinfos_en/selected-flight-bookinfos_en.module"
      ).then((m) => m.SelectedFlightBookInfosEnPageModule),
  },
  {
    path: "flight-list",
    loadChildren: () =>
      import("./flight-list/flight-list.module").then(
        (m) => m.FlightListPageModule
      ),
  },
  {
    path: "flight-list-roundtrip",
    loadChildren: () =>
      import("./flight-list-roundtrip/flight-list-roundtrip.module").then(
        (m) => m.FlightListRoundTripPageModule
      ),
  },
  {
    path: "flight-list_en",
    loadChildren: () =>
      import("./flight-list_en/flight-list_en.module").then(
        (m) => m.FlightListEnPageModule
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
    path: "flight-item-cabins",
    loadChildren: () =>
      import("./flight-item-cabins/flight-item-cabins.module").then(
        (m) => m.FlightItemCabinsPageModule
      ),
    canActivate: [TmcGuard],
  },
  {
    path: "flight-item-cabins_en",
    loadChildren: () =>
      import("./flight-item-cabins_en/flight-item-cabins_en.module").then(
        (m) => m.FlightItemCabinsEnPageModule
      ),
    canActivate: [TmcGuard],
  },
  {
    path: "flight-book_df",
    loadChildren: () =>
      import("./flight-book_df/flight-book-df.module").then(
        (m) => m.FlightBookDfPageModule
      ),
  },
  {
    path: "flight-book",
    loadChildren: () =>
      import("./flight-book/flight-book.module").then((m) => m.FlightBookPageModule),
  },
  {
    path: "flight-book_en",
    loadChildren: () =>
      import("./book_en/book_en.module").then((m) => m.FlightBookEnPageModule),
  },
];
@NgModule({
  imports: [FlightComponentsModule, RouterModule.forChild(routes)],
  exports: [RouterModule, FlightComponentsModule],
})
export class FlightRoutingModule {}
