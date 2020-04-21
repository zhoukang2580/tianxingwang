import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";
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
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  FlightPolicy,
  IFlightSegmentInfo
} from "../models/PassengerFlightInfo";
import { of, Observable, Subscription } from "rxjs";
import { map, tap, filter } from "rxjs/operators";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { AppHelper } from "src/app/appHelper";
import { FlightFareType } from "../models/flight/FlightFareType";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchTypeModel } from "../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { OrderService } from "src/app/order/order.service";

@Component({
  selector: "app-flight-item-cabins",
  templateUrl: "./flight-item-cabins.page.html",
  styleUrls: ["./flight-item-cabins.page.scss"]
})
export class FlightItemCabinsPage implements OnInit {
  private cabins: FlightPolicy[] = [];
  private economyClassCabins: FlightPolicy[] = []; // 显示经济舱的最低价、协议价、全价
  private moreCabins: FlightPolicy[] = []; // 显示更多价格
  vmCabins: FlightPolicy[] = [];
  hasMoreCabins = true;
  vmFlightSegment: FlightSegmentEntity;
  FlightFareType = FlightFareType;
  staff: StaffEntity;
  showOpenBtn$ = of(0);
  identity: IdentityEntity;
  filteredPolicyPassenger$: Observable<PassengerBookInfo<IFlightSegmentInfo>>;
  filterConditions: FilterConditionModel;
  filterConditionSub = Subscription.EMPTY;
  selectedCabinType: number;
  cabinTypes: SearchTypeModel[];
  isSelf = true;
  constructor(
    private flightService: FlightService,
    activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private flydayService: CalendarService,
    private staffService: StaffService,
    private identityService: IdentityService,
    private router: Router,
    private popoverController: PopoverController,
    private orderService: OrderService,
    private navCtrl: NavController
  ) {
    activatedRoute.queryParamMap.subscribe(async p => {
      this.vmFlightSegment = this.flightService.currentViewtFlightSegment;
      this.isSelf = await this.staffService.isSelfBookType();
      this.cabinTypes = this.getCabinTypes();
      const identity = await this.identityService
        .getIdentityAsync()
        .catch(_ => null);
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
  get isAgent() {
    return (
      this.identity && this.identity.Numbers && this.identity.Numbers["AgentId"]
    );
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("flight-list")]);
  }
  private getCabinTypes() {
    let cts: SearchTypeModel[] = [];
    if (this.vmFlightSegment && this.vmFlightSegment.Cabins) {
      this.vmFlightSegment.Cabins.forEach(c => {
        if (!cts.find(it => it.id == c.Type)) {
          cts.push({
            id: c.Type,
            label: c.TypeName,
            isChecked: false
          });
        }
      });
    }
    return cts;
  }
  getMothDay() {
    const t = this.vmFlightSegment && moment(this.vmFlightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    if (!d || !t) {
      return "";
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  getFlightIllegalTip() {
    const bookInfos = this.flightService.getPassengerBookInfos();
    const info = bookInfos.find(it => it.isFilterPolicy);
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightIllegalTip
    );
  }
  getFlightlegalTip() {
    const bookInfos = this.flightService.getPassengerBookInfos();
    const info = bookInfos.find(it => it.isFilterPolicy);
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightLegalTip
    );
  }
  async onBookTicket(flightCabin: FlightCabinEntity) {
    if (
      !this.flightService.policyFlights ||
      !this.flightService.policyFlights.length
    ) {
      await this.flightService.loadPolicyedFlightsAsync(
        this.flightService.flightJourneyList
      );
      if (
        !this.flightService.policyFlights ||
        !this.flightService.policyFlights.length
      ) {
        AppHelper.alert("差标获取失败");
        return;
      }
    }
    const isSelf = await this.staffService.isSelfBookType();
    const bookInfos = this.flightService.getPassengerBookInfos();
    if (isSelf) {
      const bookInfo = bookInfos[0];
      const info = this.flightService.getPolicyCabinBookInfo(
        bookInfo,
        flightCabin,
        this.vmFlightSegment
      );
      const rules = (info.flightPolicy && info.flightPolicy.Rules) || [];
      if (info && info.isDontAllowBook) {
        let msg = rules.join(";");
        if (rules.length) {
          msg += ",不可预订";
        }
        AppHelper.alert(
          msg,
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        return;
      }
    }
    await this.flightService.addOrReplaceSegmentInfo(
      flightCabin,
      this.vmFlightSegment
    );
    await this.onShowSelectedInfosPage();
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
    const data =
      d &&
      (d.data as PassengerBookInfo<IFlightSegmentInfo> | "isUnFilterPolicy");
    if (!data) {
      return;
    }
    const arr = this.flightService.getPassengerBookInfos().map(it => {
      it.isFilterPolicy =
        data != "isUnFilterPolicy"
          ? it.id == data.id && data.isFilterPolicy
          : false;
      return it;
    });
    this.flightService.setPassengerBookInfosSource(arr);
    this.cabins = this.getPolicyCabins();
    this.initVmCabins(this.cabins);
  }
  onShowMoreCabins() {
    this.vmCabins = this.economyClassCabins.concat(this.moreCabins);
    this.moreCabins = [];
    this.economyClassCabins = [];
    const BusinessCabins = [];//公务舱
    const DiscountCabins = []; //头等舱
    this.vmCabins.forEach(it => {
      if (it.Cabin) {
        if (it.Cabin.Type == FlightCabinType.Y) {
          this.economyClassCabins.push(it);
        } else if (it.Cabin.Type == FlightCabinType.SeniorY) {
          BusinessCabins.push(it)
        }
        else if (it.Cabin.Type == FlightCabinType.C || it.Cabin.Type == FlightCabinType.DiscountC || it.Cabin.Type == FlightCabinType.BusinessPremier) {
          DiscountCabins.push(it)
        }
        else {
          this.moreCabins.push(it);
        }
      }
    });
    this.economyClassCabins.sort((a, b) =>
      b.Cabin && a.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    this.moreCabins.sort((a, b) =>
      a.Cabin && b.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    BusinessCabins.sort((a, b) =>
      b.Cabin && a.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    DiscountCabins.sort((a, b) =>
      a.Cabin && b.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    this.vmCabins = this.economyClassCabins.concat(BusinessCabins).concat(DiscountCabins).concat(this.moreCabins);
    this.hasMoreCabins = false;
  }
  private initVmCabins(cabins: FlightPolicy[]) {
    if (!cabins || !cabins.length) {
      return;
    }
    this.moreCabins = [];
    this.economyClassCabins = [];
    let lowestPrice = Infinity;
    if (this.vmFlightSegment && this.vmFlightSegment.Cabins) {
      this.vmFlightSegment.Cabins.forEach(it => {
        lowestPrice = Math.min(+it.SalesPrice, lowestPrice);
      });
    }
    const isfirstAgreementCabin = cabins.find(
      it => it.Cabin && +it.Cabin.FareType == FlightFareType.Agreement
    );
    cabins.forEach(it => {
      if (
        it.Cabin &&
        it.Cabin.Type == FlightCabinType.Y &&
        // 最低价
        (it.Cabin.SalesPrice == `${lowestPrice}` ||
          // 全价
          +it.Cabin.Discount >= 1 ||
          // 协议价
          +it.Cabin.FareType == FlightFareType.Agreement)
      ) {
        if (+it.Cabin.FareType == FlightFareType.Agreement) {
          if (it == isfirstAgreementCabin) {
            this.economyClassCabins.push(it);
          } else {
            this.moreCabins.push(it);
          }
        } else if (+it.Cabin.FareType != FlightFareType.Agreement) {
          this.economyClassCabins.push(it);
        }
      } else if (it.Cabin) {
        this.moreCabins.push(it);
      }
    });
    this.hasMoreCabins = !!this.moreCabins.length;
    this.economyClassCabins.sort((a, b) =>
      b.Cabin && a.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    this.moreCabins.sort((a, b) =>
      a.Cabin && b.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    if (this.economyClassCabins.length) {
      this.vmCabins = this.economyClassCabins;
    } else {
      this.hasMoreCabins = false;
      this.vmCabins = this.moreCabins;
    }
  }
  onShowSelectedInfosPage() {
    this.flightService.showSelectedBookInfosPage();
  }
  async openrules(cabin: any) {
    // this.popoverController.dismiss().catch(_ => {});
    const m = await this.popoverController.create({
      component: TicketchangingComponent,
      componentProps: { cabin: cabin },
      showBackdrop: true,
      cssClass: "ticket-changing"
      // animated: false
    });
    m.backdropDismiss = false;
    await m.present();
  }
  async onFilterCabinType(evt: CustomEvent) {
    console.log(evt, this.cabinTypes);
    if (evt && evt.detail) {
      const cabins = this.cabinTypes.filter(it => it.isChecked);
      this.flightService.setFilterConditionSource({
        ...this.flightService.getFilterCondition(),
        cabins
      });
      this.cabins = this.getPolicyCabins();
      this.initVmCabins(this.cabins);
    }
  }
  onionChange(c: { id: string }) {
    if (this.isSelf) {
      this.cabinTypes = this.cabinTypes.map(it => {
        it.isChecked = it.id == c.id;
        return it;
      });
    }
  }
  async ngOnInit() {
    this.filterConditionSub = this.flightService
      .getFilterConditionSource()
      .subscribe(c => {
        this.filterConditions = c;
        const cabin = c && c.cabins.find(it => it.isChecked);
        if (cabin) {
          this.selectedCabinType = +cabin.id;
        }
      });
    this.filteredPolicyPassenger$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos.find(it => it.isFilterPolicy)));
    this.showOpenBtn$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(map(infos => infos && infos.filter(it => !!it.bookInfo).length));
    this.cabins = this.getPolicyCabins();
    this.initVmCabins(this.cabins);
  }

  private getPolicyCabins() {
    const isfilteredBookInfo = this.flightService
      .getPassengerBookInfos()
      .find(it => it.isFilterPolicy);
    const bookInfo = isfilteredBookInfo;
    let policyCabins = this.flightService.filterPassengerPolicyCabins({
      data: bookInfo,
      flightSegment: { ...this.vmFlightSegment }
    });
    if (
      this.filterConditions &&
      this.filterConditions.cabins &&
      this.filterConditions.cabins.length
    ) {
      policyCabins = policyCabins.filter(
        c =>
          c.Cabin &&
          this.filterConditions.cabins.some(it => it.id == c.Cabin.Type)
      );
    }
    console.log("showPolicyCabins ", policyCabins);
    return policyCabins;
  }
}
