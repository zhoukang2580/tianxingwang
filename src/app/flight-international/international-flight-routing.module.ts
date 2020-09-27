import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
const routes: Routes = [
  {
    path: "search-international-flight",
    loadChildren: () =>
      import(
        "./search-international-flight/search-international-flight.module"
      ).then((m) => m.SearchInternationalFlightPageModule),
  }, {
    path: "search-international-flight_en",
    loadChildren: () =>
      import(
        "./search-international-flight_en/search-international-flight_en.module"
      ).then((m) => m.SearchInternationalFlightEnPageModule),
  },
  {
    path: "select-international-flight-city",
    loadChildren: () =>
      import("./select-city/select-city.module").then(
        (m) => m.SelectFlightCityPageModule
      ),
  },
  {
    path: "international-flight-list",
    loadChildren: () =>
      import("./flight-list/flight-list.module").then(
        (m) => m.FlightListPageModule
      ),
  },
  {
    path: "selected-trip-info",
    loadChildren: () =>
      import("./selected-trip-info/selected-trip-info.module").then(
        (m) => m.SelectedTripInfoPageModule
      ),
  },
  {
    path: "flight-ticket-reserve",
    loadChildren: () =>
      import("./flight-ticket-reserve/flight-ticket-reserve.module").then(
        (m) => m.FlightTicketReservePageModule
      ),
  },
  {
    path: "choose-flight-seat",
    loadChildren: () =>
      import("./choose-flight-seat/choose-flight-seat.module").then(
        (m) => m.ChooseFlightSeatPageModule
      ),
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class FlightInternationalRoutingModule {}
