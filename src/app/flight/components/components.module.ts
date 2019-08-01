import { DirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
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
import { SelectCityComponent } from "./select-city/select-city.component";
import { FlightDirectivesModule } from "../directives/directives.module";
import { SearchDayComponent } from "./search-day/search-day.component";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";
import { SelectedPassengersComponent } from "./selected-passengers/selected-passengers.component";
import { SelectFlyDateComponent } from "./select-fly-date/select-fly-date.component";
import { SelectedFlightsegmentInfoComponent } from "./selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectFlightsegmentCabinComponent } from "./select-flightsegment-cabin/select-flightsegment-cabin.component";
import { SelectedPassengersPopoverComponent } from "./selected-passengers-popover/selected-passengers-popover.component";
import { SearchApprovalComponent } from "./search-approval/search-approval.component";
import { SearchCostcenterComponent } from "./search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "./organization/organization.component";
import { SelectTravelNumberPopoverComponent } from "./select-travel-number-popover/select-travel-number-popover.component";
import { AddcontactsModalComponent } from "./addcontacts-modal/addcontacts-modal.component";

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
    SelectCityComponent,
    SearchDayComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectFlyDateComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent,
    SelectedPassengersPopoverComponent,
    SearchApprovalComponent,
    SearchCostcenterComponent,
    OrganizationComponent,
    SelectTravelNumberPopoverComponent,
    AddcontactsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightPipesModule,
    ReactiveFormsModule,
    FlightDirectivesModule,
    DirectivesModule,
    AppComponentsModule
  ],
  exports: [
    DirectivesModule,
    FlightDirectivesModule,
    AppComponentsModule,
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
    SelectFlightsegmentCabinComponent,
    SelectedPassengersPopoverComponent,
    SearchApprovalComponent,
    SearchCostcenterComponent,
    OrganizationComponent,
    SelectTravelNumberPopoverComponent,
    AddcontactsModalComponent
  ]
})
export class FlightComponentsModule {}
