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
    path: "flight-list-gp",
    loadChildren: () =>
      import("./flight-list-gp/flight-list-gp.module").then(
        (m) => m.FlightListGpPageModule
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
    path: "flight-item-cabins-gp",
    loadChildren: () =>
      import("./flight-item-cabins-gp/flight-item-cabins-gp.module").then(
        (m) => m.FlightItemCabinsGpPageModule
      ),
    canActivate: [TmcGuard],
  },
  {
    path: "flight-bookinfos-gp",
    loadChildren: () =>
      import("./flight-bookinfos-gp/flight-bookinfos-gp.module").then(
        (m) => m.FlightBookinfosGpPageModule
      ),
  },
  {
    path: "add-passenger-informartion-gp",
    loadChildren: () =>
      import("./add-passenger-informartion-gp/add-passenger-informartion-gp.module").then(
        (m) => m.AddPassengerInformartionGpPageModule
      ),
  },
  {
    path: "update-passenger-informartion-gp",
    loadChildren: () =>
      import("./update-passenger-informartion-gp/update-passenger-informartion-gp.module").then(
        (m) => m.UpdatePassengerInformartionGpPageModule
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
    path: "select-flight-bank-gp",
    loadChildren: () =>
      import("./select-flight-bank-gp/select-flight-bank-gp.module").then(
        (m) => m.SelectFlightBankGpPageModule
      ),
  }
];
@NgModule({
  imports: [ RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightGpRoutingModule {}
