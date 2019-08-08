import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TmcGuard } from "../guards/tmc.guard";
import { FlightComponentsModule } from "./components/components.module";
const routes: Routes = [
  {
    path: "search-flight",
    loadChildren: "./search-flight/search-flight.module#SearchFlightPageModule",
    canActivate: [TmcGuard]
  },
  {
    path: "flight-list",
    loadChildren: "./flight-list/flight-list.module#FlightListPageModule",
    canActivate: [TmcGuard]
  },
  {
    path: "flight-item-cabins",
    loadChildren:
      "./flight-item-cabins/flight-item-cabins.module#FlightItemCabinsPageModule",
    canActivate: [TmcGuard]
  },
  {
    path: "flight-book",
    loadChildren: "./book/book.module#BookPageModule"
  }
];
@NgModule({
  imports: [FlightComponentsModule, RouterModule.forChild(routes)],
  exports: [RouterModule, FlightComponentsModule]
})
export class FlightRoutingModule {}
