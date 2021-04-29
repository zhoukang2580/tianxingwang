import { MemberPipesModule } from "./../../member/pipe/pipe.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SelectAirportsModalComponent } from "./select-airports/select-airports.component";
import { SearchApprovalComponent } from "./search-approval/search-approval.component";
import { SearchCostcenterComponent } from "./search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "./organization/organization.component";
import { SelectTravelNumberComponent } from "./select-travel-number-popover/select-travel-number-popover.component";
import { AddcontactsModalComponent } from "src/app/tmc/components/addcontacts-modal/addcontacts-modal.component";
import { FilterPassengersPolicyComponent } from "./filter-passengers-popover/filter-passengers-policy-popover.component";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { BookCredentialCompComponent } from "./book-credential-comp/book-credential-comp.component";
import { BookIllegalReasonCompComponent } from "./book-illegal-reason-comp/book-illegal-reason-comp.component";
import { BookCostcenterCompComponent } from "./book-costcenter-comp/book-costcenter-comp.component";
import { BookOrganizationCompComponent } from "./book-organization-comp/book-organization-comp.component";
import { BookAddcontactsCompComponent } from "./book-addcontacts-comp/book-addcontacts-comp.component";
import { DayComponent } from "src/app/tmc/components/day/day.component";
import { SelectCountryModalComponent } from "./select-country/select-countrymodal.component";
import { DateSelectWheelPopoverComponent } from "./date-select-wheel-popover/date-select-wheel-popover.component";
import { SelectWheelComponent } from "./select-wheel/select-wheel.component";
import { SearchDayComponent } from "./search-day/search-day.component";
import { DaysCalendarComponent } from "./days-calendar/days-calendar.component";
import { BookTmcOutnumberComponent } from "./book-tmc-outnumber/book-tmc-outnumber.component";
import { WaitingCheckPayComponent } from "./waiting-check-pay/waiting-check-pay.component";
import { ShowStandardDetailsComponent } from "./show-standard-details/show-standard-details.component";
import { BookExpenseTypesCompComponent } from "./book-expense-types-comp/book-expense-types-comp.component";
import { TmcCalendarComponent } from "./tmc-calendar/tmc-calendar.page";
import { DayEnComponent } from "./day-en/dayEn.component";
import { BookCredentialCompEnComponent } from './book-credential-comp_en/book-credential-comp_en.component';
import { AddcontactsModalEnComponent } from './addcontacts-modal_en/addcontacts-modal_en.component';
import { BookAddcontactsCompEnComponent } from './book-addcontacts-comp_en/book-addcontacts-comp_en.component';
import { SearchApprovalEnComponent } from './search-approval_en/search-approval_en.component';
import { BookOrganizationDfCompComponent } from './book-organization-comp-df/book-organization-comp-df.component';
import { BookCostcenterCompDfComponent } from './book-costcenter-comp-df/book-costcenter-comp-df.component';
import { BookAddcontactsCompDfComponent } from './book-addcontacts-comp-df/book-addcontacts-comp-df.component';
import { SearchDayDfComponent } from './search-day-df/search-day-df.component';
import { AddcontactsModalDfComponent } from './addcontacts-modal-df/addcontacts-modal-df.component';
import { DaysCalendarDfComponent } from "./days-calendar-df/days-calendar-df.component";
import { SearchDayDyComponent } from "./search-day-dy/search-day-dy.component";

@NgModule({
  declarations: [
    FilterPassengersPolicyComponent,
    SelectAirportsModalComponent,
    SearchApprovalComponent,
    SearchApprovalEnComponent,
    SearchCostcenterComponent,
    OrganizationComponent,
    SelectTravelNumberComponent,
    AddcontactsModalComponent,
    AddcontactsModalEnComponent,
    AddcontactsModalDfComponent,
    BookIllegalReasonCompComponent,
    BookCredentialCompComponent,
    BookCredentialCompEnComponent,
    BookCostcenterCompComponent,
    BookCostcenterCompDfComponent,
    BookOrganizationCompComponent,
    BookOrganizationDfCompComponent,
    BookAddcontactsCompComponent,
    BookAddcontactsCompEnComponent,
    BookAddcontactsCompDfComponent,
    DayComponent,
    DayEnComponent,
    SelectCountryModalComponent,
    SelectWheelComponent,
    DateSelectWheelPopoverComponent,
    SearchDayComponent,
    SearchDayDfComponent,
    SearchDayDyComponent,
    DaysCalendarComponent,
    DaysCalendarDfComponent,
    BookTmcOutnumberComponent,
    WaitingCheckPayComponent,
    ShowStandardDetailsComponent,
    TmcCalendarComponent,
    BookExpenseTypesCompComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppComponentsModule,
    MemberPipesModule,
  ],
  exports: [
    DayEnComponent,
    BookCredentialCompComponent,
    BookIllegalReasonCompComponent,
    BookCostcenterCompComponent,
    BookCostcenterCompDfComponent,
    BookCredentialCompEnComponent,
    BookOrganizationCompComponent,
    BookOrganizationDfCompComponent,
    BookAddcontactsCompComponent,
    BookAddcontactsCompEnComponent,
    BookAddcontactsCompDfComponent,
    BookAddcontactsCompDfComponent,
    BookTmcOutnumberComponent,
    DayComponent,
    SelectWheelComponent,
    SearchDayComponent,
    SearchDayDfComponent,
    SearchDayDyComponent,
    DaysCalendarComponent,
    DaysCalendarDfComponent,
    WaitingCheckPayComponent,
    BookExpenseTypesCompComponent,
  ],
})
export class TmcComponentsModule {}
