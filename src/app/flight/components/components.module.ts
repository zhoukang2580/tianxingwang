import { DirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FlightDynamicComponent } from "./flight-dynamic/flight-dynamic.component";
import { SwitchCityComponent } from "./switch-city/switch-city.component";
import { FlyListItemComponent } from "./fly-list-item/fly-list-item.component";
import { FlyDaysCalendarComponent } from "./fly-days-calendar/fly-days-calendar.component";
import { FlightPipesModule } from "../pipes/Pipes.module";
import { FlyFilterComponent } from "./fly-filter/fly-filter.component";
import { TakeOffTimespanComponent } from "./fly-filter/take-off-timespan/take-off-timespan.component";
import { AircompanyComponent } from "./fly-filter/aircompany/aircompany.component";
import { AirportsComponent } from "./fly-filter/airports/airports.component";
import { AirtypeComponent } from "./fly-filter/airtype/airtype.component";
import { CabinComponent } from "./fly-filter/cabin/cabin.component";
import { SelectCityComponent } from "./select-city/select-city.component";
import { FlightDirectivesModule } from "../directives/directives.module";
import { SearchDayComponent } from "./search-day/search-day.component";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";
import { SelectedPassengersComponent } from "../../tmc/components/selected-passengers/selected-passengers.component";
import { SelectFlyDateComponent } from "./select-fly-date/select-fly-date.component";
import { SelectedFlightsegmentInfoComponent } from "./selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectFlightsegmentCabinComponent } from "./select-flightsegment-cabin/select-flightsegment-cabin.component";
import { FlightTripComponent } from "./flight-trip/flight-trip.component";
import { OriginalFlightTripComponent } from "./original-flight-trip/original-flight-trip.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";

@NgModule({
  declarations: [
    FlightDynamicComponent,
    SwitchCityComponent,
    FlyListItemComponent,
    FlyDaysCalendarComponent,
    FlyFilterComponent,
    TakeOffTimespanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    SelectCityComponent,
    SearchDayComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectFlyDateComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent,
    FlightTripComponent,
    OriginalFlightTripComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightPipesModule,
    ReactiveFormsModule,
    FlightDirectivesModule,
    DirectivesModule,
    AppComponentsModule,
    TmcComponentsModule
  ],
  exports: [
    DirectivesModule,
    FlightDirectivesModule,
    AppComponentsModule,
    SearchDayComponent,
    FlightDynamicComponent,
    SwitchCityComponent,
    FlyListItemComponent,
    FlyDaysCalendarComponent,
    FlyFilterComponent,
    TakeOffTimespanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    FlightPipesModule,
    SelectCityComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectFlyDateComponent,
    FlightTripComponent,
    OriginalFlightTripComponent
  ],
  entryComponents: [
    FlyFilterComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent,
    SelectFlyDateComponent
  ]
})
export class FlightComponentsModule {}
