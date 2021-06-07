import { AppDirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "../../components/appcomponents.module";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FlyListItemComponent } from "./fly-list-item/fly-list-item.component";
import { FlightPipesModule } from "../pipes/Pipes.module";
import { FlyFilterComponent } from "./fly-filter/fly-filter.component";
import { TakeOffTimeSpanComponent } from "./fly-filter/take-off-timespan/take-off-timespan.component";
import { AircompanyComponent } from "./fly-filter/aircompany/aircompany.component";
import { AirportsComponent } from "./fly-filter/airports/airports.component";
import { AirtypeComponent } from "./fly-filter/airtype/airtype.component";
import { CabinComponent } from "./fly-filter/cabin/cabin.component";
import { TicketchangingComponent } from "./ticketchanging/ticketchanging.component";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { SelectFlightPassengerComponent } from "./select-flight-passenger/select-flight-passenger.component";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { MemberComponentsModule } from "src/app/member/components/components.module";
import { FlightSegmentItemComponent } from "./flight-segment-item/flight-segment-item.component";
import { TakeOffTimeSpanDfComponent } from "./fly-filter/take-off-timespan-df/take-off-timespan-df.component";
import { FlightSegmentItemDfComponent } from "./flight-segment-item-df/flight-segment-item-df.component";
import { SelectCardBinsComponent } from "./select-card-bins/select-card-bins.component";

@NgModule({
  declarations: [
    TakeOffTimeSpanDfComponent,
    FlyListItemComponent,
    FlyFilterComponent,
    TakeOffTimeSpanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    TicketchangingComponent,
    SelectFlightPassengerComponent,
    SelectCardBinsComponent,
    FlightSegmentItemComponent,
    FlightSegmentItemDfComponent
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
    MemberComponentsModule,
  ],
  exports: [
    FlightSegmentItemDfComponent,
    AppDirectivesModule,
    TakeOffTimeSpanDfComponent,
    FlyListItemComponent,
    FlyFilterComponent,
    TakeOffTimeSpanComponent,
    AircompanyComponent,
    AirportsComponent,
    AirtypeComponent,
    CabinComponent,
    FlightPipesModule,
    TicketchangingComponent,
    SelectCardBinsComponent,
    FlightSegmentItemComponent,
    AppComponentsModule
  ],
})
export class FlightGpComponentsModule {}
