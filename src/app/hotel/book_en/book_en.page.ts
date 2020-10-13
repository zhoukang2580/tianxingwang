import { RefresherComponent } from "src/app/components/refresher";
import { BookTmcOutnumberComponent } from "../../tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { PayService } from "src/app/services/pay/pay.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CalendarService } from "src/app/tmc/calendar.service";
import { RoomPlanEntity } from "../models/RoomPlanEntity";
import { StaffService } from "../../hr/staff.service";
import {
  InitialBookDtoModel,
  TravelUrlInfo,
  TmcService,
  TmcApprovalType,
  PassengerBookInfo,
  TravelFormEntity,
  IllegalReasonEntity,
} from "../../tmc/tmc.service";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { HotelService, IHotelInfo } from "../hotel.service";
import { IdentityService } from "../../services/identity/identity.service";
import {
  IonRefresher,
  PopoverController,
  ModalController,
  IonContent,
  IonItemGroup,
  Platform,
} from "@ionic/angular";
import { NavController } from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  HostBinding,
  AfterViewInit,
  QueryList,
  ElementRef,
  ViewChildren,
  OnDestroy,
} from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { Storage } from "@ionic/storage";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  StaffEntity,
  OrganizationEntity,
  StaffApprover,
} from "src/app/hr/staff.service";
import {
  OrderTravelType,
  OrderTravelPayType,
} from "src/app/order/models/OrderTravelEntity";
import { AddContact } from "src/app/tmc/models/AddContact";
import { TaskType } from "src/app/workflow/models/TaskType";
import { of, combineLatest, from, Subscription, fromEvent } from "rxjs";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { map, tap, mergeMap } from "rxjs/operators";
import { trigger, state, style } from "@angular/animations";
import { HotelPaymentType } from "../models/HotelPaymentType";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { OrderCardEntity } from "src/app/order/models/OrderCardEntity";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { HotelEntity } from "../models/HotelEntity";
import { RoomEntity } from "../models/RoomEntity";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { flyInOut } from "src/app/animations/flyInOut";
import { OrderHotelType } from "src/app/order/models/OrderHotelEntity";
import { WarrantyComponent } from "../components/warranty/warranty.component";
import { BookPage } from '../book/book.page';
@Component({
  selector: "app-book_en",
  templateUrl: "./book_en.page.html",
  styleUrls: ["./book_en.page.scss"],
  animations: [
    flyInOut,
    trigger("showHide", [
      state("true", style({ display: "initial" })),
      state("false", style({ display: "none" })),
    ]),
  ],
})
export class BookEnPage extends BookPage{
  
}
