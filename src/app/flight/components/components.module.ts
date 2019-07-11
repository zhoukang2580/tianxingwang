import { AppcomponentsModule } from "./../../components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DayComponent } from "./day/day.component";
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
import { FlyTimelineComponent } from "./fly-timeline/fly-timeline.component";
import { FlyTimelineItemComponent } from "./fly-timeline-item/fly-timeline-item.component";
import { SelectCityComponent } from "./select-city/select-city.component";
import { DirectivesModule } from "../directives/directives.module";
import { SearchDayComponent } from "./search-day/search-day.component";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";
import { SelectedPassengersComponent } from "./selected-passengers/selected-passengers.component";
import { SelectFlyDateComponent } from "./select-fly-date/select-fly-date.component";
import { SelectedFlightsegmentInfoComponent } from "./selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectFlightsegmentCabinComponent } from './select-flightsegment-cabin/select-flightsegment-cabin.component';

@NgModule({
  declarations: [
    DayComponent,
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
    FlyTimelineComponent,
    FlyTimelineItemComponent,
    SelectCityComponent,
    SearchDayComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectFlyDateComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightPipesModule,
    ReactiveFormsModule,
    DirectivesModule,
    AppcomponentsModule
  ],
  exports: [
    AppcomponentsModule,
    SearchDayComponent,
    DayComponent,
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
    FlyTimelineComponent,
    FlyTimelineItemComponent,
    SelectCityComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectFlyDateComponent
  ],
  entryComponents: [
    FlyFilterComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent
  ]
})
export class FlightComponentsModule {}
