import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';
import { FlightCabinEntity } from "./../models/flight/FlightCabinEntity";
import { IdentityService } from "./../../services/identity/identity.service";
import {
  StaffService,
  StaffEntity,
  StaffBookType
} from "../../hr/staff.service";
import { DayModel } from "../../tmc/models/DayModel";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute, Router } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  AlertController,
  NavController,
  PopoverController
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import { SelectedFlightsegmentInfoComponent } from "../components/selected-flightsegment-info/selected-flightsegment-info.component";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  CurrentViewtFlightSegment,
  FlightPolicy,
  IFlightSegmentInfo
} from "../models/PassengerFlightInfo";
import { of, Observable, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { AppHelper } from "src/app/appHelper";
import { FlightFareType } from '../models/flight/FlightFareType';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';

@Component({
  selector: "app-flight-item-cabins",
  templateUrl: "./flight-item-cabins.page.html",
  styleUrls: ["./flight-item-cabins.page.scss"]
})
export class FlightItemCabinsPage implements OnInit {
  vmFlightSegment: FlightSegmentEntity;
  FlightFareType = FlightFareType;
  currentViewtFlightSegment: CurrentViewtFlightSegment;
  vmCabins: FlightPolicy[] = [];
  staff: StaffEntity;
  showOpenBtn$ = of(0);
  identity: IdentityEntity;
  filteredPolicyPassenger$: Observable<PassengerBookInfo<IFlightSegmentInfo>>;
  filterConditions: FilterConditionModel;
  filterConditionSub = Subscription.EMPTY;
  constructor(
    private flightService: FlightService,
    activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private flydayService: CalendarService,
    private staffService: StaffService,
    private alertCtrl: AlertController,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private router: Router,
    private popoverController: PopoverController
  ) {
    activatedRoute.queryParamMap.subscribe(async p => {
      this.currentViewtFlightSegment = flightService.getCurrentViewtFlightSegment();
      console.log("flight-item-cabins", this.currentViewtFlightSegment);
      this.vmFlightSegment = this.currentViewtFlightSegment.flightSegment;
      const identity = await this.identityService.getIdentityAsync().catch(_ => null)
      this.identity = identity;
      this.staff = await this.staffService.getStaff();
      if (
        this.staff &&
        this.staff.BookType == StaffBookType.Self &&
        !this.staff.Name
      ) {
        this.staff.Name = identity && identity.Name;
      }
    });
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("flight-list")]);
  }
  getMothDay() {
    const t =
      this.currentViewtFlightSegment &&
      moment(this.currentViewtFlightSegment.flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  getFlightIllegalTip(){
    const bookInfos=this.flightService.getPassengerBookInfos();
    const info=bookInfos.find(it=>it.isFilteredPolicy);
    return info&&info.passenger&&info.passenger.Policy&&info.passenger.Policy.FlightIllegalTip;
  }
  async onBookTicket(flightCabin: FlightCabinEntity) {
    await this.flightService.addOrReplaceSegmentInfo(flightCabin);
    await this.showSelectedInfos();
  }
  async filterPolicyFlights() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      translucent: true,
      componentProps: {
        bookInfos$: this.flightService.getPassengerBookInfoSource()
      }
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    const data = d && (d.data as PassengerBookInfo<IFlightSegmentInfo>);
    if (!data) {
      return;
    }
    this.flightService.setPassengerBookInfosSource(
      this.flightService.getPassengerBookInfos().map(it => {
        it.isFilteredPolicy = it.id == data.id;
        if (it.isFilteredPolicy) {
          it.isAllowBookPolicy = data.isAllowBookPolicy;
          it.isOnlyFilterMatchedPolicy = data.isOnlyFilterMatchedPolicy;
        }
        return it;
      })
    );
    this.vmCabins = await this.getPolicyCabins();
  }
  async showSelectedInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await this.flightService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
    return "goBack";
  }
  async openrules(cabin: any) {
    // this.popoverController.dismiss().catch(_ => {});
    const m = await this.popoverController.create({
      component: TicketchangingComponent,
      componentProps: { cabin: cabin.Cabin },
      showBackdrop: true,
      cssClass: "ticket-changing"
      // animated: false
    });
    m.backdropDismiss = false;
    await m.present();
  }
  bookColor(cabin: FlightPolicy) {
    if (cabin) {
      if (!cabin.IsAllowBook) {
        return "danger";
      }
      if (cabin.Rules && cabin.Rules.length) {
        return "warning";
      }
      return "success";
    }
    return "primary";
  }
  async ngOnInit() {
    this.filterConditionSub = this.flightService.getFilterConditionSource().subscribe(c => {
      this.filterConditions = c;
    })
    this.filteredPolicyPassenger$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos.find(it => it.isFilteredPolicy)));
    this.showOpenBtn$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos && infos.filter(it => !!it.bookInfo).length));
    this.vmCabins = await this.getPolicyCabins();
  }

  private async getPolicyCabins() {
    const isfilteredBookInfo = this.flightService
      .getPassengerBookInfos()
      .find(it => it.isFilteredPolicy);
    const bookInfo = isfilteredBookInfo;
    let policyCabins = this.flightService.filterPassengerPolicyCabins({ data: bookInfo, flightSegment: this.currentViewtFlightSegment.flightSegment });
    if (this.filterConditions && this.filterConditions.cabins && this.filterConditions.cabins.length) {
      policyCabins = policyCabins.filter(c => c.Cabin && this.filterConditions.cabins.some(it => it.id == c.Cabin.Type))
    }
    console.log("showPolicyCabins ", policyCabins);
    return policyCabins;
  }
}
