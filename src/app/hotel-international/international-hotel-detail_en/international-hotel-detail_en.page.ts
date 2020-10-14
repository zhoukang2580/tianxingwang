import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { IHotelInfo } from "./../../hotel/hotel.service";
import { SelectPassengerPage } from "src/app/tmc/select-passenger/select-passenger.page";
import { fadeInOut } from "./../../animations/fadeInOut";
import { flyInOut } from "./../../animations/flyInOut";
import { AppHelper } from "./../../appHelper";
import { SlidesComponent } from "./../../components/slides/slides.component";
import { ConfigEntity } from "./../../services/config/config.entity";
import { ConfigService } from "./../../services/config/config.service";
import { finalize, debounceTime } from "rxjs/operators";
import { Subscription, fromEvent } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition,
  IInterHotelInfo,
} from "./../international-hotel.service";
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  Renderer2,
  EventEmitter,
} from "@angular/core";
import {
  IonRefresher,
  DomController,
  IonContent,
  IonHeader,
  Platform,
  NavController,
  PopoverController,
  IonList,
  ModalController,
} from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
// tslint:disable-next-line: max-line-length
import { FilterPassengersPolicyComponent } from "src/app/tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
} from "src/app/tmc/tmc.service";
import { StaffService } from "src/app/hr/staff.service";
import { TripType } from "src/app/tmc/models/TripType";
import { HotelPassengerModel } from "src/app/hotel/models/HotelPassengerModel";
import { HotelEntity } from "src/app/hotel/models/HotelEntity";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { RoomEntity } from "src/app/hotel/models/RoomEntity";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { InternationalHotelDetailPage } from '../international-hotel-detail/international-hotel-detail.page';

@Component({
  selector: "app-international-hotel-detail_em",
  templateUrl: "./international-hotel-detail_en.page.html",
  styleUrls: ["./international-hotel-detail_en.page.scss"],
  animations: [flyInOut, fadeInOut],
})
export class InternationalHotelDetailEnPage extends InternationalHotelDetailPage{
}
