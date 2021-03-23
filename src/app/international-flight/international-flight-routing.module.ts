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
  },
  {
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
    path: "select-international-flight-city_en",
    loadChildren: () =>
      import("./select-city_en/select-city_en.module").then(
        (m) => m.SelectFlightCityEnPageModule
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
    path: "international-flight-list_en",
    loadChildren: () =>
      import("./flight-list_en/flight-list_en.module").then(
        (m) => m.FlightListEnPageModule
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
    path: "selected-trip-info_en",
    loadChildren: () =>
      import("./selected-trip-info_en/selected-trip-info_en.module").then(
        (m) => m.SelectedTripInfoEnPageModule
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
    path: "international-flight-book_df",
    loadChildren: () =>
      import(
        "./international-flight-book_df/international-flight-book-df.module"
      ).then((m) => m.InternationalFlightBookDfPageModule),
  },
  {
    path: "international-flight-book",
    loadChildren: () =>
      import(
        "./international-flight-book_df/international-flight-book-df.module"
      ).then((m) => m.InternationalFlightBookDfPageModule),
  },
  {
    path: "flight-ticket-reserve_en",
    loadChildren: () =>
      import("./flight-ticket-reserve_en/flight-ticket-reserve_en.module").then(
        (m) => m.FlightTicketReserveEnPageModule
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
