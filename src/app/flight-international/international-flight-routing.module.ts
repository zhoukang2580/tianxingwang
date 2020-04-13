import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
const routes: Routes = [
  {
    path: "search-international-flight",
    loadChildren: () =>
      import(
        "./search-international-flight/search-international-flight.module"
      ).then(m => m.SearchInternationalFlightPageModule)
  },
  {
    path: "select-international-flight-city",
    loadChildren: () =>
      import("./select-city/select-city.module").then(
        m => m.SelectFlightCityPageModule
      )
  },
  {
    path: 'international-flight-list',
    loadChildren: () => import('./flight-list/flight-list.module').then( m => m.FlightListPageModule)
  },
  {
    path: 'flight-list-detail',
    loadChildren: () => import('./flight-list-detail/flight-list-detail.module').then( m => m.FlightListDetailPageModule)
  }

];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class FlightInternationalRoutingModule {}
