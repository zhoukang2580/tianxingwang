import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { BookCredentialCompComponent } from "../../tmc/components/book-credential-comp/book-credential-comp.component";
import { flyInOut } from "../../animations/flyInOut";
import { environment } from "../../../environments/environment";
import * as moment from "moment";
import {
  InternationalHotelService,
  IInterHotelInfo,
} from "../international-hotel.service";
import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import {
  PassengerBookInfo,
  TmcService,
  InitialBookDtoModel,
  TmcEntity,
  TravelFormEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelUrlInfo,
} from "src/app/tmc/tmc.service";
import {
  NavController,
  PopoverController,
  ModalController,
  IonRefresher,
  IonContent,
  Platform,
} from "@ionic/angular";
import {
  HrService,
  StaffApprover,
  OrganizationEntity,
  StaffEntity,
} from "src/app/hr/hr.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PayService } from "src/app/services/pay/pay.service";
import { CalendarService } from "src/app/tmc/calendar.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { HotelPaymentType } from "src/app/hotel/models/HotelPaymentType";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import {
  OrderTravelPayType,
  OrderTravelType,
} from "src/app/order/models/OrderTravelEntity";
import {
  BookTmcOutnumberComponent,
  ITmcOutNumberInfo,
} from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { of, combineLatest, from, Subscription, fromEvent } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { OrderCardEntity } from "src/app/order/models/OrderCardEntity";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { RoomEntity } from "src/app/hotel/models/RoomEntity";
import { map, tap } from "rxjs/operators";
import { TaskType } from "src/app/workflow/models/TaskType";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { AddContact } from "src/app/tmc/models/AddContact";
import { BookCostcenterCompComponent } from "src/app/tmc/components/book-costcenter-comp/book-costcenter-comp.component";
import { OrderHotelType } from "src/app/order/models/OrderHotelEntity";
import { RefresherComponent } from "src/app/components/refresher";
import { WarrantyComponent } from "src/app/hotel/components/warranty/warranty.component";
import { InterHotelWarrantyComponent } from "../components/inter-hotel-warranty/inter-hotel-warranty.component";
import { CHINESE_REG } from "src/app/member/member.service";
import { InterHotelBookPage } from '../inter-hotel-book/inter-hotel-book.page';

@Component({
  selector: "app-inter-hotel-book_en",
  templateUrl: "./inter-hotel-book_en.page.html",
  styleUrls: ["./inter-hotel-book_en.page.scss"],
  animations: [flyInOut],
})
export class InterHotelBookEnPage extends InterHotelBookPage {

}
