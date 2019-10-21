import { AppDirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FlightDynamicComponent } from "./flight-dynamic/flight-dynamic.component";
import { SwitchCityComponent } from "./switch-city/switch-city.component";
import { FlyListItemComponent } from "./fly-list-item/fly-list-item.component";
import { FlightPipesModule } from "../pipes/Pipes.module";
import { FlyFilterComponent } from "./fly-filter/fly-filter.component";
import { TakeOffTimeSpanComponent } from "./fly-filter/take-off-timespan/take-off-timespan.component";
import { AircompanyComponent } from "./fly-filter/aircompany/aircompany.component";
import { AirportsComponent } from "./fly-filter/airports/airports.component";
import { AirtypeComponent } from "./fly-filter/airtype/airtype.component";
import { CabinComponent } from "./fly-filter/cabin/cabin.component";
import { SelectCityComponent } from "./select-city/select-city.component";
import { FlightDirectivesModule } from "../directives/directives.module";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";
import { SelectedPassengersComponent } from "../../tmc/components/selected-passengers/selected-passengers.component";
import { SelectedFlightsegmentInfoComponent } from "./selected-flightsegment-info/selected-flightsegment-info.component";
import { SelectFlightsegmentCabinComponent } from "./select-flightsegment-cabin/select-flightsegment-cabin.component";
import { FlightTripComponent } from "./flight-trip/flight-trip.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { SelectFlightPassengerComponent } from "./select-flight-passenger/select-flight-passenger.component";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { PriceDetailComponent } from './price-detail/price-detail.component';

@NgModule({
  declarations: [
    FlightDynamicComponent,
    SwitchCityComponent,
    FlyListItemComponent,
    FlyFilterComponent,
    TakeOffTimeSpanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    SelectCityComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent,
    FlightTripComponent,
    PriceDetailComponent,
    SelectFlightPassengerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightPipesModule,
    ReactiveFormsModule,
    FlightDirectivesModule,
    AppDirectivesModule,
    AppComponentsModule,
    TmcComponentsModule,
    MemberPipesModule
  ],
  exports: [
    AppDirectivesModule,
    FlightDirectivesModule,
    AppComponentsModule,
    FlightDynamicComponent,
    SwitchCityComponent,
    FlyListItemComponent,
    FlyFilterComponent,
    TakeOffTimeSpanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    FlightPipesModule,
    SelectCityComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    FlightTripComponent,
  ],
  entryComponents: [
    FlyFilterComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectedFlightsegmentInfoComponent,
    SelectFlightsegmentCabinComponent,
    PriceDetailComponent,
    SelectFlightPassengerComponent
  ]
})
export class FlightComponentsModule {}
