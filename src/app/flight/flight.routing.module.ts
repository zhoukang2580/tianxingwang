import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TmcGuard } from "../guards/tmc.guard";
import { FlightComponentsModule } from './components/components.module';
const routes: Routes = [
  {
    path: "book-flight",
    loadChildren: "./book-flight/book-flight.module#BookFlightPageModule",
    canActivate: [TmcGuard]
  },
  {
    path: "select-fly-day",
    loadChildren:
      "./select-fly-days/select-fly-days.module#SelectFlyDaysPageModule",
    canActivate: [TmcGuard]
  },
  {
    path: "flight-list",
    loadChildren: "./flight-list/flight-list.module#FlightListPageModule",
    canActivate: [TmcGuard]
  },
  {
    path: "flight-detail",
    loadChildren: "./flight-detail/flight-detail.module#FlightDetailPageModule",
    canActivate: [TmcGuard]
  }
];
@NgModule({
  imports: [FlightComponentsModule, RouterModule.forChild(routes)],
  exports: [RouterModule, FlightComponentsModule]
})
export class FlightRoutingModule {}
