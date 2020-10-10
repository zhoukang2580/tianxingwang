import { flyInOut } from "../../animations/flyInOut";
import { PriceDetailComponent } from "../components/price-detail/price-detail.component";
import { PayService } from "../../services/pay/pay.service";
import { OrderBookDto } from "../../order/models/OrderBookDto";
import {
  ActivatedRoute,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { InsuranceProductEntity } from "../../insurance/models/InsuranceProductEntity";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import {
  NavController,
  ModalController,
  IonCheckbox,
  PopoverController,
  IonContent,
  Platform,
  IonRefresher,
  IonRadio,
  IonFooter,
} from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelFormEntity,
  TravelUrlInfo,
  PassengerBookInfo,
  InitialBookDtoModel,
  IBookOrderResult,
} from "../../tmc/tmc.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import {
  StaffService,
  StaffEntity,
  CostCenterEntity,
  OrganizationEntity,
  StaffApprover,
  StaffBookType,
} from "../../hr/staff.service";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Storage } from "@ionic/storage";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import * as moment from "moment";
import { DayModel } from "../../tmc/models/DayModel";
import { LanguageHelper } from "src/app/languageHelper";
import { trigger, state, style } from "@angular/animations";
import {
  Subject,
  BehaviorSubject,
  from,
  combineLatest,
  of,
  fromEvent,
} from "rxjs";
import {
  OrderTravelType,
  OrderTravelPayType,
} from "../../order/models/OrderTravelEntity";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { TaskType } from "src/app/workflow/models/TaskType";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { IFlightSegmentInfo } from "../models/PassengerFlightInfo";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, tap } from "rxjs/operators";
import { AddContact } from "src/app/tmc/models/AddContact";
import { environment } from "src/environments/environment";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { IHotelInfo } from "src/app/hotel/hotel.service";
import { RefresherComponent } from "src/app/components/refresher";
import { BookCredentialCompComponent } from "src/app/tmc/components/book-credential-comp/book-credential-comp.component";
import {
  CandeactivateGuard,
  CanComponentDeactivate,
} from "src/app/guards/candeactivate.guard";
import { BookPage } from '../book/book.page';

@Component({
  selector: "app-book_en",
  templateUrl: "./book_en.page.html",
  styleUrls: ["./book_en.page.scss"],
  animations: [flyInOut],
})
export class BookEnPage extends BookPage{
 
}
