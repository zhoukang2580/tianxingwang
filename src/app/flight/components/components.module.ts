import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DayComponent } from "./day/day.component";
import { FlightDynamicComponent } from "./flight-dynamic/flight-dynamic.component";
import { SwitchCityComponent } from "./switch-city/switch-city.component";
import { FlyListItemComponent } from "./fly-list-item/fly-list-item.component";
import { FlyDaysCalendarComponent } from "./fly-days-calendar/fly-days-calendar.component";
import { PipesModule } from "../pipes/Pipes.module";
import { FlyFilterComponent } from "./fly-filter/fly-filter.component";
import { TakeOffTimespanComponent } from "./fly-filter/take-off-timespan/take-off-timespan.component";
import { AircompanyComponent } from "./fly-filter/aircompany/aircompany.component";
import { AirportsComponent } from "./fly-filter/airports/airports.component";
import { AirtypeComponent } from "./fly-filter/airtype/airtype.component";
import { CabinComponent } from "./fly-filter/cabin/cabin.component";
import { NoMoreDataComponent } from "./no-more-data/no-more-data.component";
import { FlyTimelineComponent } from "./fly-timeline/fly-timeline.component";
import { FlyTimelineItemComponent } from "./fly-timeline-item/fly-timeline-item.component";
import { SelectCityComponent } from "./select-city/select-city.component";
import { DirectivesModule } from "../directives/directives.module";
import { SearchDayComponent } from "./search-day/search-day.component";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";

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
    NoMoreDataComponent,
    FlyTimelineComponent,
    FlyTimelineItemComponent,
    SelectCityComponent,
    SearchDayComponent,
    TicketchangingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ReactiveFormsModule,
    DirectivesModule
  ],
  exports: [
    SearchDayComponent,
    DayComponent,
    FlightDynamicComponent,
    SwitchCityComponent,
    FlyListItemComponent,
    FlyDaysCalendarComponent,
    NoMoreDataComponent,
    FlyFilterComponent,
    TakeOffTimespanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    PipesModule,
    FlyTimelineComponent,
    FlyTimelineItemComponent,
    SelectCityComponent,
    TicketchangingComponent
  ],
  entryComponents: [FlyFilterComponent,TicketchangingComponent]
})
export class FlightComponentsModule {}
