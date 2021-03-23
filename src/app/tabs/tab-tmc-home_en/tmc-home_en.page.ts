import { MemberService, MemberCredential } from "../../member/member.service";
import { NavController, DomController, IonSlides } from "@ionic/angular";
import { FlightService } from "src/app/flight/flight.service";
import { HotelService } from "../../hotel/hotel.service";
import { TrainService } from "src/app/train/train.service";
import { StaffEntity } from "src/app/hr/staff.service";
import { StaffService } from "../../hr/staff.service";
import { Notice, CmsService } from "../../cms/cms.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "../../services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import Swiper from "swiper";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  Renderer2,
  AfterViewInit,
} from "@angular/core";
import {
  Observable,
  Subject,
  BehaviorSubject,
  from,
  of,
  Subscription,
  interval,
} from "rxjs";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { PayService } from "src/app/services/pay/pay.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { tap, shareReplay, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { InternationalHotelService } from "src/app/hotel-international/international-hotel.service";
import { InternationalFlightService } from "src/app/international-flight/international-flight.service";
import { ConfigService } from "src/app/services/config/config.service";
import { ConfigEntity } from "src/app/services/config/config.entity";
import { ConfirmCredentialInfoGuard } from "src/app/guards/confirm-credential-info.guard";
import { LoginService } from "src/app/services/login/login.service";
import { LangService } from "src/app/services/lang.service";
import { TmcHomePage } from '../tab-tmc-home/tmc-home.page';
@Component({
  selector: "app-tmc-home",
  templateUrl: "tmc-home_en.page.html",
  styleUrls: ["tmc-home_en.page.scss"],
})
export class TmcHomeEnPage extends TmcHomePage {
 
}
