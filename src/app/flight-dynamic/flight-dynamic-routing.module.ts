import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlightDynamicComponent } from '../flight/components/flight-dynamic/flight-dynamic.component';


const routes: Routes = [
  {
    path: "search-flight-dynamic",
    loadChildren: () =>
      import("./search-flight-dynamic/search-flight-dynamic.module").then(
        (m) => m.SearchFlightDynamicPageModule
      ),
  },
  {
    path: "flight-dynamic-info",
    loadChildren: () =>
      import("./flight-dynamic-info/flight-dynamic-info.module").then(
        (m) => m.FlightDynamicInfoPageModule
      ),
  },
  {
    path: "flight-dynamic-list",
    loadChildren: () =>
      import("./flight-dynamic-list/flight-dynamic-list.module").then(
        (m) => m.FlightDynamicListPageModule
      ),
  },
  {
    path: "flight-dynamic-preorder",
    loadChildren: () =>
      import("./flight-dynamic-preorder/flight-dynamic-preorder.module").then(
        (m) => m.FlightDynamicPreorderPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    ],
  exports: [RouterModule]
})
export class FlightDynamicRoutingModule { }
