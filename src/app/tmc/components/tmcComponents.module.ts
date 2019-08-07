import { CalendarComponent } from "./calendar/calendar.component";
import { MemberPipesModule } from "./../../member/pipe/pipe.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SelectTrainStationModalComponent } from "./select-stations/select-station.component";
import { SelectAirportsModalComponent } from "./select-airports/select-airports.component";
import { SearchApprovalComponent } from "./search-approval/search-approval.component";
import { SearchCostcenterComponent } from "./search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "./organization/organization.component";
import { SelectTravelNumberComponent } from "./select-travel-number-popover/select-travel-number-popover.component";
import { AddcontactsModalComponent } from "src/app/tmc/components/addcontacts-modal/addcontacts-modal.component";
import { FilterPassengersPolicyComponent } from "./filter-passengers-popover/filter-passengers-policy-popover.component";
import { DirectivesModule } from "src/app/directives/directives.module";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { BookCredentialCompComponent } from "./book-credential-comp/book-credential-comp.component";
import { BookIllegalReasonCompComponent } from "./book-illegal-reason-comp/book-illegal-reason-comp.component";
import { BookCostcenterCompComponent } from "./book-costcenter-comp/book-costcenter-comp.component";
import { BookOrganizationCompComponent } from "./book-organization-comp/book-organization-comp.component";
import { BookAddcontactsCompComponent } from "./book-addcontacts-comp/book-addcontacts-comp.component";
import { DayComponent } from "src/app/tmc/components/day/day.component";

@NgModule({
  declarations: [
    SelectTrainStationModalComponent,
    FilterPassengersPolicyComponent,
    SelectAirportsModalComponent,
    SearchApprovalComponent,
    SearchCostcenterComponent,
    OrganizationComponent,
    SelectTravelNumberComponent,
    AddcontactsModalComponent,
    BookIllegalReasonCompComponent,
    BookCredentialCompComponent,
    BookCostcenterCompComponent,
    BookOrganizationCompComponent,
    BookAddcontactsCompComponent,
    DayComponent,
    CalendarComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    DirectivesModule,
    AppComponentsModule,
    MemberPipesModule
  ],
  exports: [
    BookCredentialCompComponent,
    BookIllegalReasonCompComponent,
    BookCostcenterCompComponent,
    BookOrganizationCompComponent,
    BookAddcontactsCompComponent,
    DayComponent
  ],
  entryComponents: [
    AddcontactsModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent,
    SearchApprovalComponent,
    SearchCostcenterComponent,
    SelectTravelNumberComponent,
    AddcontactsModalComponent,
    AddcontactsModalComponent,
    OrganizationComponent,
    CalendarComponent
  ]
})
export class TmcComponentsModule {}
