import { AppDirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "./../../components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FlightDynamicComponent } from "./flight-dynamic/flight-dynamic.component";
import { FlyListItemComponent } from "./fly-list-item/fly-list-item.component";
import { FlightPipesModule } from "../pipes/Pipes.module";
import { FlyFilterComponent } from "./fly-filter/fly-filter.component";
import { TakeOffTimeSpanComponent } from "./fly-filter/take-off-timespan/take-off-timespan.component";
import { AircompanyComponent } from "./fly-filter/aircompany/aircompany.component";
import { AirportsComponent } from "./fly-filter/airports/airports.component";
import { AirtypeComponent } from "./fly-filter/airtype/airtype.component";
import { CabinComponent } from "./fly-filter/cabin/cabin.component";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";
import { SelectedPassengersComponent } from "../../tmc/components/selected-passengers/selected-passengers.component";
import { SelectFlightsegmentCabinComponent } from "./select-flightsegment-cabin/select-flightsegment-cabin.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { SelectFlightPassengerComponent } from "./select-flight-passenger/select-flight-passenger.component";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { PriceDetailComponent } from './price-detail/price-detail.component';
import { SelectAndReplacebookinfoComponent } from './select-and-replacebookinfo/select-and-replacebookinfo.component';
import { FlightSegmentItemComponent } from './flight-segment-item/flight-segment-item.component';
import { MemberComponentsModule } from 'src/app/member/components/components.module';

@NgModule({
  declarations: [
    FlightDynamicComponent,
    FlyListItemComponent,
    FlyFilterComponent,
    TakeOffTimeSpanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectFlightsegmentCabinComponent,
    PriceDetailComponent,
    SelectFlightPassengerComponent,
    SelectAndReplacebookinfoComponent,
    FlightSegmentItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlightPipesModule,
    ReactiveFormsModule,
    AppDirectivesModule,
    AppComponentsModule,
    TmcComponentsModule,
    MemberPipesModule,
    MemberComponentsModule
  ],
  exports: [
    AppDirectivesModule,
    FlightDynamicComponent,
    FlyListItemComponent,
    FlyFilterComponent,
    TakeOffTimeSpanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    FlightPipesModule,
    TicketchangingComponent,
    SelectedPassengersComponent,
    SelectAndReplacebookinfoComponent,
    FlightSegmentItemComponent,
    AppComponentsModule
  ]
})
export class FlightComponentsModule { }
