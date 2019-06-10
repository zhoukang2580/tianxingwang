import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TmcGuard } from '../guards/tmc.guard';
const routes: Routes = [
  {
    path: 'book-flight',
    loadChildren: './book-flight/book-flight.module#BookFlightPageModule',
    canActivate: [TmcGuard]
  },
  // {
  //   path: "select-fly-day",
  //   loadChildren: "./select-fly-days/select-fly-days.module#SelectFlyDaysPageModule",
  //   canActivate: [TmcGuard]
  // },
  {
    path: "flight-list",
    loadChildren: "./flight-list/flight-list.module#FlightListPageModule",
    canActivate: [TmcGuard]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightRoutingModule {

}